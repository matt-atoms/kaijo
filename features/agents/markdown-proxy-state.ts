// Agent-Markdown eligibility for `proxy.ts`; cache mechanics live in `~/features/sanity/proxy-state`.

import { createProxySanityState } from "~/features/sanity/proxy-state";
import { normalizePathname } from "~/features/utils/pathname";
import { SANITY_SINGLETON_SITE_ID } from "~/sanity/constants";

// Under `/api` so it sits outside the public `(web)` catch-all and gets its own CDN cache entry.
export const AGENT_MARKDOWN_INTERNAL_BASE_PATH = "/api/agent-markdown";

type AgentMarkdownRoute = { uri?: string | null; excluded?: boolean | null };

type AgentMarkdownPayload = {
  siteWideBasicAuth?: boolean | null;
  routes: AgentMarkdownRoute[] | null;
};

/** Request-facing shape: paths pre-normalized into a Set once per fetch (O(1) per request). */
export type AgentMarkdownState = {
  siteWideBasicAuth: boolean;
  excludedPathSet: ReadonlySet<string>;
};

function toAgentMarkdownState(payload: AgentMarkdownPayload): AgentMarkdownState {
  const excludedPaths = (payload.routes ?? [])
    .filter((route): route is { uri: string; excluded: true } => route.excluded === true && typeof route.uri === "string")
    .map((route) => normalizePathname(route.uri));

  return {
    siteWideBasicAuth: payload.siteWideBasicAuth === true,
    excludedPathSet: new Set(excludedPaths),
  };
}

// A path is excluded from Markdown (agents get HTML) when it is noindex, password-protected, has the
// per-page toggle off, or has no stored Markdown yet (the content check keeps this a pure consume model:
// an ungenerated page is not advertised, so the serve route never 404s an agent).
//
// Project the exclusion flag over the STABLE result set `*[defined(uri.current)]` (every routed doc) and
// reduce to the excluded Set above; do NOT filter `*[...predicate...]`. A filtered set changes membership
// when a page is first generated, and even the live API misses that transition (stays stale for minutes),
// which would keep freshly-generated pages HTML-only. See the proxy-fetch-cache strategy note.
const SANITY_AGENT_MARKDOWN_STATE_QUERY = `{
  "siteWideBasicAuth": *[_type == "${SANITY_SINGLETON_SITE_ID}"][0].basicAuth.siteWideEnabled,
  "routes": *[defined(uri.current)]{
    "uri": uri.current,
    "excluded": seoMetadata.noIndex == true
      || passwordProtected == true
      || agentMarkdown.enabled == false
      || !defined(agentMarkdown.content)
      || agentMarkdown.content == ""
  }
}`;

export const getAgentMarkdownState = createProxySanityState(SANITY_AGENT_MARKDOWN_STATE_QUERY, toAgentMarkdownState);
