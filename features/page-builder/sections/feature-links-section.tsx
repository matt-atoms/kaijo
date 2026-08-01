import { defineQuery } from "next-sanity";
import { sanityFetch } from "~/features/sanity/client";
import { SanityLink } from "~/features/sanity/link";
import { LinkFragment } from "~/features/sanity/link/fragment";
import type { FeatureLinksSectionQResult } from "~/sanity/types";

const FeatureLinksSectionQ =
  defineQuery(`*[_id == $docId][0].pageBuilder.sectionsArray[_type == "featureLinksSectionField" && _key == $sectionKey][0]{
    "content": sectionContent{
      title,
      items[]{
        "key": _key,
        title,
        caption,
        "link": appLink{${LinkFragment}}
      }
    }
}`);

export async function FeatureLinksSection({ docId, sectionKey }: { docId: string; sectionKey: string }) {
  const section = await sanityFetch<FeatureLinksSectionQResult>({
    query: FeatureLinksSectionQ,
    params: { docId, sectionKey },
    options: { next: { tags: [`doc:${docId}`] } },
  });

  const content = section?.content;

  if (!content?.items?.length) {
    return null;
  }

  return (
    <div className="section_feature-links">
      <div className="container">
        <div className="vertical_layout">
          {content.title && (
            <h2 data-scramble="scroll" className="section_title">
              {content.title}
            </h2>
          )}
          <div className="feature-links_grid">
            {content.items.map((item) =>
              item.link?.href ? (
                <SanityLink key={item.key} link={item.link} className="feature-links_tile">
                  <div className="feature-links_body">
                    <span className="feature-links_label">{item.title}</span>
                    {item.caption && <span className="feature-links_caption">{item.caption}</span>}
                    <span className="feature-links_cta">{item.link.text || "Explore"} →</span>
                  </div>
                </SanityLink>
              ) : null
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
