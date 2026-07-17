import { defineQuery } from "next-sanity";
import { LinkFragment } from "~/features/sanity/link/fragment";
import { SANITY_ARTICLE_DOCUMENT_TYPE, SANITY_PAGE_DOCUMENT_TYPE, SANITY_SINGLETON_SITE_ID } from "~/sanity/constants";

/**
 * Content served at `/llms.txt`. Read from the published `site` singleton.
 * `enabled` gates serving (undefined is treated as on); `content` is the markdown body.
 */
export const LlmsTxtServeQuery = defineQuery(`*[_type == "${SANITY_SINGLETON_SITE_ID}"][0]{
  "enabled": llms.enabled,
  "content": llms.content
}`);

/**
 * Everything the AI needs to draft an llms.txt: site identity plus the indexable pages and
 * articles (same visibility rules as the sitemap: has a URI, not noindex, not password protected).
 * Fetched server-side with an edit token so it can run under the `drafts` perspective.
 */
export const LlmsTxtInventoryQuery = defineQuery(`{
  "site": *[_type == "${SANITY_SINGLETON_SITE_ID}"][0]{
    name,
    "summary": seoMetadata.description,
    "guidance": llms.guidance
  },
  "pages": *[
    _type in ["${SANITY_PAGE_DOCUMENT_TYPE}", "${SANITY_ARTICLE_DOCUMENT_TYPE}"]
    && defined(uri.current)
    && seoMetadata.noIndex != true
    && passwordProtected != true
  ] | order(_type asc, coalesce(publishedAt, _createdAt) desc) {
    _type,
    "uri": uri.current,
    "title": coalesce(seoMetadata.title, title),
    "description": seoMetadata.description,
    "publishedAt": publishedAt,
    "categories": categories[]->name
  }
}`);

// Lean Portable Text projection for Markdown: block style, list shape, span marks, link hrefs, media-block images.
const AgentMarkdownRichTextFragment = `
  _type,
  _type == "block" => {
    style,
    listItem,
    level,
    "children": children[]{ _type, text, marks },
    "markDefs": markDefs[]{
      _key,
      _type,
      _type == "linkField" => { ${LinkFragment} }
    }
  },
  _type == "mediaBlock" => {
    "alt": appMedia.image.asset->altText,
    "imageUrl": appMedia.image.asset->url
  }
`;

// The guaranteed page-builder factory outputs, aliased to the keys their default renderers in `markdown.ts` read.
const FactorySectionContentFragment = `
  "text": sectionContent.appRichText[]{${AgentMarkdownRichTextFragment}},
  "media": sectionContent.appMedia{
    "alt": image.asset->altText,
    "imageUrl": image.asset->url
  },
  "cta": sectionContent.appLink{${LinkFragment}}
`;

// The per-project "which fields" seam: factory fields plus this template's `headline`/`caption`. Extend by
// adding an alias here and a matching renderer in `markdown.ts`. Hand-written because GROQ must stay a static string for typegen.
const AgentMarkdownSectionContentFragment = `
  ${FactorySectionContentFragment},
  "headline": sectionContent.headline,
  "caption": sectionContent.caption
`;

// Content projection for one routed document, matched on `uri.current` (not a fixed type list) so new routed
// types are covered. No eligibility gate here: serving is gated by `AgentMarkdownServeQuery` and the proxy state query.
export const AgentMarkdownContentQuery = defineQuery(`*[
  defined(uri.current)
  && uri.current == $uri
][0]{
  _type,
  "uri": coalesce(uri.current, "/"),
  "title": coalesce(seoMetadata.title, title),
  "description": seoMetadata.description,
  publishedAt,
  author,
  "categories": categories[]->name,
  "sections": pageBuilder.sectionsArray[]{
    _type,
    ${AgentMarkdownSectionContentFragment}
  }
}`);

/**
 * Stored Markdown served at the agent-markdown route for one routed document by URI.
 * `enabled` gates serving (undefined is treated as on); `content` is the Markdown body.
 */
export const AgentMarkdownServeQuery = defineQuery(`*[
  defined(uri.current)
  && uri.current == $uri
][0]{
  "enabled": agentMarkdown.enabled,
  "content": agentMarkdown.content
}`);
