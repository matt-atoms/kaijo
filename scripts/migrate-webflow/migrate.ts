/**
 * One-off migration: seeds the Sanity dataset with the content of the original
 * Webflow site (kaijo.webflow.io), scraped into `manifest.json`.
 *
 * - Downloads every image from the Webflow CDN and uploads it as a Sanity asset.
 * - Creates the six project documents (positional 16-slot collage images).
 * - Creates the homepage / work / info pages with their page-builder sections.
 * - Creates the `site` singleton (name, header/footer links, SEO title, favicon).
 *
 * Run with: npm run migrate:webflow
 * Idempotent: documents are created with fixed ids via createOrReplace.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { createClient } from "@sanity/client";

type Manifest = {
  projects: Array<{
    slug: string;
    title: string;
    category: string | null;
    date: string;
    gridOrder: number;
    gridStyle: "normal" | "wide";
    thumbnail: string;
    description: unknown[];
    images: Array<string | null>;
  }>;
  about: { title: string; text: string; secondText: string; image: string };
  favicon: string;
};

const manifest: Manifest = JSON.parse(readFileSync(path.join(import.meta.dirname, "manifest.json"), "utf8"));

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  token: process.env.SANITY_API_EDIT_TOKEN,
  useCdn: false,
});

const uploadedByUrl = new Map<string, string>();

async function uploadImage(url: string): Promise<string> {
  const cached = uploadedByUrl.get(url);

  if (cached) {
    return cached;
  }

  const filename = decodeURIComponent(url.split("/").pop() ?? "image").replace(/^[a-f0-9]{24}_/, "");
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Failed to download ${url}: ${res.status}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  const asset = await client.assets.upload("image", buffer, { filename });
  uploadedByUrl.set(url, asset._id);
  console.log(`  uploaded ${filename} -> ${asset._id}`);
  return asset._id;
}

function imageRef(assetId: string) {
  return { _type: "image", asset: { _type: "reference", _ref: assetId } };
}

function section(type: string, key: string, content: Record<string, unknown> = {}) {
  return {
    _type: `${type}Field`,
    _key: key,
    sectionContent: { _type: type, ...content },
  };
}

async function run() {
  // Projects
  for (const project of manifest.projects) {
    console.log(`Project: ${project.slug}`);
    const thumbnailId = await uploadImage(project.thumbnail);

    const imageFields: Record<string, unknown> = {};
    for (let i = 0; i < 16; i++) {
      const url = project.images[i];
      if (url) {
        imageFields[`image${i + 1}`] = imageRef(await uploadImage(url));
      }
    }

    await client.createOrReplace({
      _id: `project-${project.slug}`,
      _type: "project",
      title: project.title,
      slug: { _type: "slug", current: project.slug },
      category: project.category ?? undefined,
      date: project.date,
      gridOrder: project.gridOrder,
      gridStyle: project.gridStyle,
      description: project.description,
      thumbnail: imageRef(thumbnailId),
      ...imageFields,
    });
  }

  // About image + favicon
  console.log("Uploading about image + favicon");
  const aboutImageId = await uploadImage(manifest.about.image);
  const faviconId = await uploadImage(manifest.favicon);

  // Pages
  console.log("Creating pages");
  await client.createOrReplace({
    _id: "homepage",
    _type: "page",
    uri: { _type: "slug", current: "/" },
    showHeader: true,
    showFooter: true,
    pageBuilder: {
      sectionsArray: [
        section("projectHeroSection", "hero"),
        section("aboutSection", "about", {
          title: manifest.about.title,
          text: manifest.about.text,
          secondText: manifest.about.secondText,
          image: imageRef(aboutImageId),
        }),
        section("portfolioGridSection", "grid"),
      ],
    },
  });

  await client.createOrReplace({
    _id: "page-work",
    _type: "page",
    title: "Work",
    uri: { _type: "slug", current: "/work" },
    showHeader: true,
    showFooter: true,
    pageBuilder: {
      sectionsArray: [section("portfolioGridSection", "grid")],
    },
  });

  // The original /info page has an empty main and no footer.
  await client.createOrReplace({
    _id: "page-info",
    _type: "page",
    title: "Info",
    uri: { _type: "slug", current: "/info" },
    showHeader: true,
    showFooter: false,
    pageBuilder: { sectionsArray: [] },
  });

  // Site singleton
  console.log("Creating site singleton");
  await client.createOrReplace({
    _id: "site",
    _type: "site",
    name: "kaijo",
    header: {
      links: [
        {
          _type: "appLink",
          _key: "work",
          type: "internal",
          customText: "work",
          internal: { link: { _type: "reference", _ref: "page-work" } },
        },
        {
          _type: "appLink",
          _key: "info",
          type: "internal",
          customText: "info",
          internal: { link: { _type: "reference", _ref: "page-info" } },
        },
      ],
    },
    footer: {
      links: [
        {
          _type: "appLink",
          _key: "instagram",
          type: "external",
          customText: "INSTAGRAM",
          // The original Webflow footer links INSTAGRAM to "#" (placeholder).
          external: "#",
        },
        {
          _type: "appLink",
          _key: "email",
          type: "email",
          customText: "CONTACT@KAIJO.STUDIO",
          email: "CONTACT@KAIJO.STUDIO",
        },
      ],
    },
    seoMetadata: { title: "kaijo" },
    favicon: { iconLight: imageRef(faviconId) },
  });

  console.log(`Done. Uploaded ${uploadedByUrl.size} unique assets.`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
