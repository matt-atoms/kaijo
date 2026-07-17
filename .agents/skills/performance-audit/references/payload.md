# Payload, bundles, and mounting

Use this file when the problem is bytes or execution: heavy HTML, heavy chunks, high TBT, or a high **simulated** LCP while observed LCP is already at first paint (see `measurement.md` on lantern: simulated text LCP tracks total initial JS).

The unifying rule: **the only load-time cost a page may pay is for what it actually displays in the current viewport and breakpoint.** Everything else mounts near-viewport, on visibility, on intent, or on open.

## Hidden SSR DOM: render collapsed content lazily

**Symptom:** a decorative mock server-rendered ~280 file-tree rows, each with a multi-element SVG icon, inside collapsed folders (`grid-template-rows: 0fr`, invisible). 308KB of an 887KB homepage HTML, plus hundreds of nodes to hydrate, plus ~1s of HTML parse on a throttled phone.

**Fix:** render a collapsed container's children only after it has been opened once, latched so the collapse animation still has content to shrink:

```tsx
const [everOpened, setEverOpened] = React.useState(open);
if (open && !everOpened) setEverOpened(true); // render-phase state adjust, React-sanctioned
// in JSX: {everOpened || open ? children : null}
```

Expand still animates because the `0fr -> 1fr` change and the children mounting land in the same commit; collapse works because children stay mounted after first open.

**Sweep rule:** weigh the HTML per section (snippet in `measurement.md`). Anything invisible at rest (collapsed accordions with huge bodies, hidden tabs, off-screen carousel clones, hidden tree views) is a candidate. If it never paints before a user interaction, it does not belong in the SSR payload at full fidelity.

## RSC-serialized props: data for a closed dialog in every page

**Symptom:** page HTML 550-780KB; the RSC payload was 512KB of a 549KB document.

**Cause:** a server component fetched the full search dataset (full text of every document) and passed it as a prop to a client lightbox. RSC serializes client-component props into the HTML, and a twice-rendered header (desktop + mobile) inlined the dataset **twice per page**.

**Fix:** move the dataset behind a route handler (same query, same cache tags) and fetch it in the client component when the dialog first opens. The fetch races the user's first keystroke debounce and wins; recompute results when data arrives so a query typed before the payload lands still resolves. Measured result: one route went from 549KB to 72KB.

**Sweep rule:** every prop crossing the RSC-to-client boundary ships in the HTML and parses during hydration. Audit the biggest client components' props; anything needed only after an interaction (dialogs, autocomplete indexes, pickers) belongs behind an on-demand fetch or dynamic import. Quick check: `curl page | wc -c` across routes, grep the HTML for your largest dataset's field names.

## Heavy media runtimes: split per media type

**Symptom:** a shared media component branches on type (image, video player, Rive, Lottie); one branch statically imported its runtime, so ~50KB gz (plus a WASM loader) shipped on every page of a site with zero content of that type, folded into a commons chunk.

**Fix:** keep the layout wrapper (sizing, aspect ratio, viewport pausing) in the always-loaded module; move everything touching the runtime into its own module behind `next/dynamic`:

```tsx
const RiveCanvas = dynamic(() => import("./rive-canvas").then(m => m.RiveCanvas), { ssr: false });
```

Hooks like `useRive` cannot be called conditionally, so the split point must be a component boundary, not an `if`.

**Sweep rule:** list what the page actually fetches (`network-requests`, `resourceType === 'Script'`, sort by `transferSize`), fingerprint suspicious chunks (`canvas_advanced.wasm`, `mux-player`, `dotlottie`, shader strings). Any player/renderer most pages never use must be behind a dynamic import in its own module. Runtime WASM fetched from the vendor's default CDN (e.g. unpkg) is acceptable as long as the runtime module is dynamically imported and mount-gated near-viewport, since the fetch then stays off the critical path; self-hosting the `.wasm` (postinstall copy to `public/` + the runtime's `setWasmUrl` equivalent) is optional hardening for CDN reliability, not a default requirement.

## Near-viewport mounting: gate the mount, not just playback

**Symptom:** 3.7MB page weight, TBT 1,330ms. Playback was viewport-gated but *loading* was not. `next/dynamic` alone defers nothing meaningful: the component mounts at hydration, so the chunk plus everything it fetches loads immediately. Measured offenders in one pass: a 3D model viewer bundling three.js (~1MB raw, 1.8s CPU) for a bottom-of-page model, Rive WASM + ~1.9MB of `.riv` files, and a Lottie runtime, all at hydration.

**Fix:** a shared `useNearViewport` hook: an IntersectionObserver with a generous `rootMargin` (default 100%, one viewport ahead) that latches once true. Players render their placeholder until `isNear`, then mount the real thing; assets load about a viewport before the user arrives. Merge refs with `useMergedRef` when the element already has one.

**Sweep rule:** the question is never "does it play lazily" but "what does the network tab show at t=0 on a page where this content is below the fold".

## Visibility-gated singletons

**Symptom:** a site-wide provider mounted a WebGL background unconditionally: 231KB gz + 106KB gz (three.js + postprocessing), 1-1.6s of evaluation, on every route including ones where the background's slot did not exist or was `display: none`. It was already behind `next/dynamic` + `requestIdleCallback`, and that did not help: **"deferred to idle" still executes inside the trace and the TBT window**.

**Fix:** gate the mount on the slot being visible at least once (nonzero rect), latch it for the session so client-side navigation never remounts:

```tsx
const [everActive, setEverActive] = React.useState(false);
React.useEffect(() => { if (active) setEverActive(true); }, [active]);
// render: {everActive && <Scene active={active} />}
```

## Warm on intent, not idle

Idle-warming a heavy chunk (`requestIdleCallback`) optimizes the second interaction at the expense of the first paint: the parse/eval lands in TBT. Warm on the first sign of user intent instead (`pointermove`, `pointerdown`, `touchstart`, `keydown`; once, passive). Real users still get the chunk before their first click completes; a passive load (and Lighthouse) never pays for it.

## Closed overlays are free chunk splits

Dynamically import the internals of any closed-by-default overlay (e.g. a search dialog and its fuzzy-search library). The chunk loads on first open; costs nothing visually. Confirm the overlay actually unmounts children while closed before relying on this.

## Keep env validation out of client bundles (two proven fixes)

**Symptom:** a typed env module (`@t3-oss/env-nextjs` + zod) imported transitively by client-reachable modules (Sanity image URL helpers) pulls all of zod (~30KB+ / a 64KB transfer chunk, 78% unused) into every client bundle to read two constant strings. No `"use client"` file imported it directly; **trace transitive imports, not just direct ones**.

Two proven fixes, pick one:

- In client-reachable modules, read `process.env.NEXT_PUBLIC_*` directly; Next inlines these at build time and the build-time validation in `env.ts` still guarantees existence: `projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID as string`.
- Switch `env.ts` to `zod/mini` (tree-shakable, a few KB, Standard Schema compatible so t3-oss accepts it). API differences: `z.optional(z.string())` instead of `.optional()`, `.check(z.refine(fn, msg))` instead of `.refine()`.

**Sweep rule:** `grep -rln 'from "~/env"'` across components and feature folders with client components; check each hit for a `"use client"` file importing it directly or transitively.

## Resource hints

`preconnect` the media/API CDNs and `prefetchDNS` analytics, emitted from the server layout via `react-dom` so the hints ship in the HTML:

```tsx
import { preconnect, prefetchDNS } from "react-dom";
preconnect("https://cdn.sanity.io");
prefetchDNS("https://cloud.umami.is");
```

## Analytics scoping

Trackers sending from localhost/preview return errors into the console (caps Best Practices at 96) and pollute analytics. Derive allowed hostnames from the canonical URL and skip the script on localhost:

```tsx
function umamiDomains(): string | null {
  const apex = new URL(env.NEXT_PUBLIC_URL).hostname.replace(/^www\./, "");
  if (apex === "localhost" || apex === "127.0.0.1") return null;
  return `${apex},www.${apex}`;
}
// render <Script ... data-domains={trackedDomains} /> only when non-null
```

Transfers to any tracker with a domain allowlist (Umami, Plausible, Fathom).

## Structural patterns worth having everywhere

- **`DeferredMount`**: mount expensive client subtrees (WebGL canvases) only near the viewport, optionally waiting for `requestIdleCallback`; a hero canvas can mount on idle so it never competes with hydration and LCP (note: on-idle is acceptable for a *visible* hero effect that must appear; for optional/decorative work prefer visibility or intent gating per the sections above).
- **LazyMotion + `m.*` + `strict`**: never import full `motion.*`; animation features load async. Verify this pattern exists before shipping `motion` anywhere.
- **Editor-only tooling gated hard**: any CMS overlay/preview entry should check viewport size, pointer type, and draft mode before dynamically importing its controller (`ssr: false`); phones ship none of it.
- **Modern `browserslist`** so the bundler emits modern JS (the remaining core-js chunk is `noModule`; see `pitfalls.md`).
- **Per-section `<React.Suspense>`** + `next/dynamic` for heavy client components in server components: SSR HTML identical, gives the bundler and hydration scheduler boundaries. Modest effect under Turbopack (it merges chunks aggressively) but correct structure and free.
