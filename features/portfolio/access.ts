import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { env } from "~/env";
import { sanityClient } from "~/features/sanity/client";
import { SANITY_PORTFOLIO_DOCUMENT_TYPE } from "~/sanity/constants";

/**
 * Access control for the password-gated client lookbooks at /portfolio/<slug>.
 *
 * The gate is deliberately simple (see the schema note): it keeps a portfolio unlisted and out of
 * search, not the image files themselves, which stay reachable by direct CDN URL. The unlock cookie
 * is an HMAC of `slug + password` keyed with the server-only `SANITY_REVALIDATE_SECRET`, so it can't
 * be forged, and changing a portfolio's password invalidates every browser that had unlocked it.
 *
 * server-only: the stored password is read here and never crosses to the client.
 */

const COOKIE_PREFIX = "pf_";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

export function portfolioCookieName(slug: string): string {
  return `${COOKIE_PREFIX}${slug}`;
}

function tokenFor(slug: string, password: string): string {
  return createHmac("sha256", env.SANITY_REVALIDATE_SECRET).update(`portfolio:${slug}:${password}`).digest("hex");
}

function safeEqualHex(a: string, b: string): boolean {
  const ab = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  return ab.length > 0 && ab.length === bb.length && timingSafeEqual(ab, bb);
}

/** The stored access password for a portfolio (published perspective, uncached). Server-only. */
async function getPortfolioPassword(slug: string): Promise<string | null> {
  const password = await sanityClient.fetch<string | null>(
    `*[_type == "${SANITY_PORTFOLIO_DOCUMENT_TYPE}" && slug.current == $slug][0].password`,
    { slug },
    { perspective: "published", cache: "no-store" }
  );
  return typeof password === "string" && password.length > 0 ? password : null;
}

/** True when the caller already holds a valid unlock cookie for this portfolio. */
export async function hasPortfolioAccess(slug: string): Promise<boolean> {
  const password = await getPortfolioPassword(slug);
  if (!password) {
    return false;
  }
  const cookie = (await cookies()).get(portfolioCookieName(slug))?.value;
  return cookie ? safeEqualHex(cookie, tokenFor(slug, password)) : false;
}

/** Check an entered password; on a match, set the unlock cookie. Returns whether it matched. */
export async function grantPortfolioAccess(slug: string, entered: string): Promise<boolean> {
  const password = await getPortfolioPassword(slug);
  if (!password) {
    return false;
  }
  // Length check first so timingSafeEqual (which requires equal length) never throws.
  const matches = entered.length === password.length && timingSafeEqual(Buffer.from(entered), Buffer.from(password));
  if (!matches) {
    return false;
  }
  (await cookies()).set(portfolioCookieName(slug), tokenFor(slug, password), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: `/portfolio/${slug}`,
    maxAge: MAX_AGE_SECONDS,
  });
  return true;
}
