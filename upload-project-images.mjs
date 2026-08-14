/**
 * Bulk image uploader for project/commission docs → the unified `images[]` pool.
 *
 * Usage (always dry-run first, then apply):
 *   IMG_DIR="~/Local Images/Projects" node_modules/.bin/sanity exec upload-project-images.mjs --with-user-token
 *   IMG_DIR="~/Local Images/Projects" DRY_RUN=0 node_modules/.bin/sanity exec upload-project-images.mjs --with-user-token
 *
 * Env: IMG_DIR (parent of per-project folders, folder name slugified to the doc slug),
 *      DRY_RUN ("0" to write), ONLY (comma slugs), BEST (how many lead images to flag Best, default 16).
 *
 * Per folder: images ordered by filename (natural sort). `thumb` in a name = explicit cover.
 * All images → `images[]`; the first BEST are flagged `best` (fill the top collage); the rest flow into
 * the foot-of-page gallery. `home` is always false (you pick homepage images yourself). thumbnail = cover.
 * Re-running a folder replaces its images[] cleanly.
 *
 * Duplicates WITHIN a folder: byte-identical files are collapsed; a file that is a "-2"/copy variant of
 * another near-identical file is auto-dropped; any other visually-similar pair is only FLAGGED. Cross-
 * folder duplicates are left alone.
 */
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { basename, extname, join } from "node:path";
import sharp from "sharp";
import { getCliClient } from "sanity/cli";

const c = getCliClient({ apiVersion: "2024-01-01", useCdn: false });

const DRY_RUN = process.env.DRY_RUN !== "0";
const IMG_DIR = expandHome(process.env.IMG_DIR ?? "");
const BEST_COUNT = Math.min(Number(process.env.BEST ?? 16), 16);
const NEAR_THRESHOLD = 5;
const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff"]);

function expandHome(p) {
  return p.startsWith("~") ? join(homedir(), p.slice(1)) : p;
}
function slugify(s) {
  return s.toLowerCase().trim().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
const ONLY = (process.env.ONLY ?? "").split(",").map((s) => slugify(s)).filter(Boolean);

function isImage(name) {
  if (name.startsWith(".") || name.startsWith("._")) return false;
  return IMAGE_EXT.has(extname(name).toLowerCase());
}
function tokens(name) {
  return basename(name, extname(name)).toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}
function naturalSort(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}
function imageValue(assetId) {
  return { _type: "image", asset: { _type: "reference", _ref: assetId } };
}

/** If one filename is the other + a copy suffix ("-2", " copy", "(1)"), return the variant to drop. */
function copyVariantToDrop(a, b) {
  const ba = basename(a, extname(a));
  const bb = basename(b, extname(b));
  const suffix = /^[\s\-_]*(copy|\d+|\(\d+\))$/i;
  if (bb.startsWith(ba) && suffix.test(bb.slice(ba.length))) return b;
  if (ba.startsWith(bb) && suffix.test(ba.slice(bb.length))) return a;
  return null;
}

async function dhash(buf) {
  const W = 9;
  const H = 8;
  const raw = await sharp(buf).grayscale().resize(W, H, { fit: "fill" }).raw().toBuffer();
  let bits = 0n;
  let bit = 0n;
  for (let r = 0; r < H; r++) {
    for (let col = 0; col < W - 1; col++) {
      if (raw[r * W + col] > raw[r * W + col + 1]) bits |= 1n << bit;
      bit++;
    }
  }
  return bits;
}
function hamming(a, b) {
  let x = a ^ b;
  let n = 0;
  while (x) {
    n += Number(x & 1n);
    x >>= 1n;
  }
  return n;
}

async function planFolder(dir) {
  const files = readdirSync(dir)
    .filter((f) => isImage(f) && statSync(join(dir, f)).isFile())
    .sort(naturalSort);

  const thumbFile = files.find((f) => tokens(f).includes("thumb"));
  const candidates = files.filter((f) => f !== thumbFile);

  const meta = new Map();
  for (const f of candidates) {
    const buf = readFileSync(join(dir, f));
    let dh = null;
    try {
      dh = await dhash(buf);
    } catch {
      dh = null;
    }
    meta.set(f, { sha: createHash("sha256").update(buf).digest("hex"), dh });
  }

  // 1) exact byte-identical duplicates.
  const seen = new Map();
  let numbered = [];
  const exactDupes = [];
  for (const f of candidates) {
    const { sha } = meta.get(f);
    if (seen.has(sha)) exactDupes.push({ dupe: f, of: seen.get(sha) });
    else {
      seen.set(sha, f);
      numbered.push(f);
    }
  }

  // 2) perceptual near-dupes: auto-drop copy-suffix variants, flag the rest.
  const drop = new Set();
  const variantDropped = [];
  const flagged = [];
  for (let i = 0; i < numbered.length; i++) {
    for (let j = i + 1; j < numbered.length; j++) {
      const a = numbered[i];
      const b = numbered[j];
      const da = meta.get(a).dh;
      const db = meta.get(b).dh;
      if (da == null || db == null || hamming(da, db) > NEAR_THRESHOLD) continue;
      const variant = copyVariantToDrop(a, b);
      if (variant) {
        drop.add(variant);
        variantDropped.push({ dropped: variant, of: variant === a ? b : a });
      } else {
        flagged.push([a, b]);
      }
    }
  }
  numbered = numbered.filter((f) => !drop.has(f));

  return {
    coverFile: thumbFile ?? numbered[0] ?? null,
    explicitThumb: Boolean(thumbFile),
    numbered,
    exactDupes,
    variantDropped,
    flagged: flagged.filter(([a, b]) => !drop.has(a) && !drop.has(b)),
  };
}

/** Retry transient network/5xx failures with exponential backoff (long uploads hit the odd ECONNRESET). */
async function withRetry(fn, label, tries = 6) {
  let delay = 1000;
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const msg = String(err?.code || err?.message || err);
      const transient = /ECONNRESET|ETIMEDOUT|socket hang up|EPIPE|ENETUNREACH|EAI_AGAIN|ECONNREFUSED|\b(429|500|502|503|504)\b/i.test(msg);
      if (attempt >= tries || !transient) throw err;
      console.log(`\n      retry ${attempt}/${tries} (${label}): ${msg.slice(0, 80)}`);
      await new Promise((r) => setTimeout(r, delay));
      delay = Math.min(delay * 2, 20000);
    }
  }
}

async function uploadFile(dir, file) {
  const asset = await withRetry(() => c.assets.upload("image", readFileSync(join(dir, file)), { filename: file }), file);
  return asset._id;
}

async function processFolder(slug, docId, dir) {
  const plan = await planFolder(dir);
  if (!plan.coverFile) {
    console.log(`  ⚠️  ${slug}: no images found — skipped`);
    return { slug, skipped: true };
  }

  const bestCount = Math.min(BEST_COUNT, plan.numbered.length);
  console.log(`  ${slug}: ${plan.numbered.length} images (${bestCount} best), cover=${plan.coverFile}${plan.explicitThumb ? " (explicit)" : ""}`);
  if (plan.exactDupes.length) console.log(`      ✂︎ dropped ${plan.exactDupes.length} exact dupe(s)`);
  if (plan.variantDropped.length) console.log(`      ✂︎ dropped ${plan.variantDropped.length} copy-variant(s): ${plan.variantDropped.map((d) => d.dropped).join(", ")}`);
  if (plan.flagged.length) {
    console.log(`      ⚠️  ${plan.flagged.length} near-dupe pair(s) kept — REVIEW:`);
    for (const [a, b] of plan.flagged) console.log(`           ${a}  ~  ${b}`);
  }

  if (DRY_RUN) return { slug, planned: true, exact: plan.exactDupes.length, variant: plan.variantDropped.length, near: plan.flagged.length };

  const uploads = plan.explicitThumb ? [plan.coverFile, ...plan.numbered] : plan.numbered;
  const idByFile = new Map();
  for (const file of uploads) {
    if (idByFile.has(file)) continue;
    idByFile.set(file, await uploadFile(dir, file));
    process.stdout.write(".");
  }
  process.stdout.write("\n");

  const images = plan.numbered.map((file, i) => ({
    _type: "projectImage",
    _key: `u${i}`,
    image: imageValue(idByFile.get(file)),
    best: i < BEST_COUNT,
    home: false, // homepage picks are chosen by hand later
  }));

  await withRetry(() => c.patch(docId).set({ thumbnail: imageValue(idByFile.get(plan.coverFile)), images }).commit(), `${slug} patch`);
  console.log(`  ✓ ${slug} written`);
  return { slug, written: true, exact: plan.exactDupes.length, variant: plan.variantDropped.length, near: plan.flagged.length };
}

// --- main ---
if (!IMG_DIR) {
  console.log("Set IMG_DIR to the parent folder of your per-project image folders.");
  process.exit(1);
}
console.log(`Mode: ${DRY_RUN ? "DRY-RUN (no changes)" : "APPLY (uploading + writing)"}`);
console.log(`Source: ${IMG_DIR}   Best per project: ${BEST_COUNT}\n`);

const projects = await c.fetch(`*[_type=="project" && defined(slug.current)]{ _id, "slug": slug.current }`);
const idBySlug = new Map(projects.map((p) => [p.slug, p._id]));

const folders = readdirSync(IMG_DIR)
  .filter((f) => !f.startsWith(".") && statSync(join(IMG_DIR, f)).isDirectory())
  .map((name) => ({ name, slug: slugify(name) }))
  .filter((f) => ONLY.length === 0 || ONLY.includes(f.slug))
  .sort((a, b) => naturalSort(a.slug, b.slug));

if (folders.length === 0) {
  console.log("No matching folders found under IMG_DIR.");
  process.exit(0);
}

const unmatched = folders.filter((f) => !idBySlug.has(f.slug));
if (unmatched.length) console.log(`⚠️  No matching project slug (skipped): ${unmatched.map((f) => `"${f.name}"→${f.slug}`).join(", ")}\n`);

const results = [];
for (const { name, slug } of folders) {
  const docId = idBySlug.get(slug);
  if (!docId) continue;
  results.push(await processFolder(slug, docId, join(IMG_DIR, name)));
}

const written = results.filter((r) => r.written).length;
const planned = results.filter((r) => r.planned).length;
const skipped = results.filter((r) => r.skipped).length;
const sum = (k) => results.reduce((n, r) => n + (r[k] ?? 0), 0);
console.log(
  `\nDone. ${DRY_RUN ? `${planned} planned` : `${written} written`}${skipped ? `, ${skipped} skipped` : ""}${unmatched.length ? `, ${unmatched.length} unmatched` : ""}. ` +
    `Dupes: ${sum("exact")} exact + ${sum("variant")} copy-variant dropped, ${sum("near")} pair(s) flagged.`
);
if (DRY_RUN) console.log("Re-run with DRY_RUN=0 to upload + write.");
