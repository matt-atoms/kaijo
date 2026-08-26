# Private client portfolios

Password-gated client lookbooks at **`/portfolio/<slug>`**. Each one is a curated, scrollable set of
up to **40 images** pulled from any project (live or archived), laid out automatically as varied
editorial spreads. They are **never** listed in the nav or sitemap and are served `noindex` — reachable
only by their URL + password.

Use them to show a specific client or organisation the most relevant work without exporting a PDF.

## Creating one (Studio)

1. **Portfolios** (in the desk, under Projects) → **Create**.
2. Set **Title** (the client/org name, shown at the top), a **Slug** (this becomes the address —
   `/portfolio/<slug>`), a **Password**, and an optional **Intro** note.
3. Share the URL and password with the client.

## Adding images

On any project, open an image in its **Images** list and tick **In portfolio**, then pick one or more
**Portfolios** for it. A photo can be in several client portfolios at once, and this works for archived
projects too. The lookbook gathers every image opted into it, newest project first, capped at 40, and
arranges them into spreads (full-bleed, diptych, offset pair, triptych, centred single) chosen from
each image's aspect ratio — images are never cropped. There is no manual ordering step by design.

## How the gate works

- The entered password is checked **server-side** (`features/portfolio/access.ts`); on a match, a signed
  cookie is set (an HMAC of `slug + password` keyed with `SANITY_REVALIDATE_SECRET`, so it can't be
  forged). Changing a portfolio's password invalidates everyone who had unlocked it.
- The route (`app/(web)/portfolio/[slug]/`) renders the branded unlock screen until that cookie is held,
  then the lookbook. It runs with no site header/footer for a distraction-free client view.

## Security caveat (important)

This gate keeps a portfolio **unlisted and out of search**, and behind a clean unlock screen. It is
**not** strong secrecy over the image files: the production Sanity dataset is public-read and every
photo stays reachable by its direct CDN URL regardless of the gate. Passwords are stored in plain text
on the portfolio document (readable by anyone querying the public CMS API). Treat these as "private
enough to share with a client", not as protection for confidential material.

## Crawl protection (defence in depth)

- `generateMetadata` sets `robots: noindex, nofollow` on the route.
- `next.config.ts` adds an `X-Robots-Tag: noindex, nofollow` header for `/portfolio/:path*` in **every**
  environment.
- `app/robots.ts` disallows `/portfolio/`.
- Portfolios are not a routed page/project type, so they never appear in `app/sitemap.ts`.
