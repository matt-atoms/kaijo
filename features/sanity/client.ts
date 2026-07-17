import "server-only";

// `useCdn` is true only in development (cheap CDN reads). Production bypasses the CDN so the
// webhook `api/revalidate` purges tags and the next fetch hits the live API with fresh data.

import { draftMode } from "next/headers";
// biome-ignore lint/style/noRestrictedImports: this module IS the client seam.
import { createClient } from "next-sanity";
import { defineLive } from "next-sanity/live";
import { env } from "~/env";

export const sanityClient = createClient({
  token: env.SANITY_API_VIEW_TOKEN,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  apiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION,
  useCdn: process.env.NODE_ENV === "development",
  stega: {
    enabled: false,
    studioUrl: env.NEXT_PUBLIC_SANITY_STUDIO_BASE_PATH,
  },
});

/** Write-capable client for API routes (AI generation, asset uploads). Never import in page rendering paths. */
export const sanityEditClient = createClient({
  token: env.SANITY_API_EDIT_TOKEN,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  apiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION,
  useCdn: false,
});

const { sanityFetch: sanityLiveFetch, SanityLive } = defineLive({
  client: sanityClient,
  serverToken: env.SANITY_API_VIEW_TOKEN,
  browserToken: env.SANITY_API_VIEW_TOKEN,
});

export { SanityLive };

/** Fetch from the Sanity API. `live` defaults to on in Draft Mode; `options` defaults to `cache: "force-cache"`. */
export async function sanityFetch<Res = Record<string, unknown>>(props: {
  query: string;
  params?: Record<string, unknown>;
  live?: boolean;
  options?: RequestInit;
}) {
  const { query, params = {}, live = (await draftMode()).isEnabled, options = {} } = props;

  if (live) {
    const { data } = await sanityLiveFetch({ query, params, stega: true });
    return data as Res;
  }

  return sanityClient.fetch<Res>(query, params, {
    perspective: "published",
    cache: options.cache ?? "force-cache",
    next: {
      ...(options.next ?? {}),
      tags: options.next?.tags ?? [],
    },
  });
}
