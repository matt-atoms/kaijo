/** Studio's fixed filesystem segment. The public URL is `NEXT_PUBLIC_SANITY_STUDIO_BASE_PATH` (not this); use the env for reserved-URI checks and `basePath`. */
export const SANITY_STUDIO_APP_SEGMENT = "sanity-studio" as const;
export const SANITY_STUDIO_APP_BASE_PATH = `/${SANITY_STUDIO_APP_SEGMENT}` as const;

export const TEMPLATE_IDS = {
  pageSingleton: "pageSingletonTemplate",
} as const;

/** Singleton IDs as string literals (typegen resolves only literals, not member access); derive `SINGLETON_IDS` from these. */
export const SANITY_SINGLETON_SITE_ID = "site";
export const SANITY_SINGLETON_HOMEPAGE_ID = "homepage";

export const SINGLETON_IDS = {
  site: SANITY_SINGLETON_SITE_ID,
  homepage: SANITY_SINGLETON_HOMEPAGE_ID,
  // PLOP: Add Singleton ID
} as const;

/** Singleton URIs, used for `initialValueTemplate` when creating/opening singleton pages. */
export const SINGLETON_ROUTES = {
  [SINGLETON_IDS.homepage]: "/",
  // PLOP: Add Singleton Route
} as const;

/** Submission schema types; only delete and discardChanges are allowed in the Studio. */
export const API_ONLY_DOCUMENTS = {
  contactFormSubmission: "contactFormSubmission",
} as const;

/** Routed non-singleton `_type` names; use these literal bindings in `defineQuery` interpolations (typegen won't resolve member access). Site's `_type` is `SANITY_SINGLETON_SITE_ID`, also its `revalidateTag`. */
export const SANITY_PAGE_DOCUMENT_TYPE = "page" as const;
export const SANITY_ARTICLE_DOCUMENT_TYPE = "article" as const;
