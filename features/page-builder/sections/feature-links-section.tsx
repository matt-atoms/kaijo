import { defineQuery } from "next-sanity";
import { KaijoImage } from "~/features/kaijo/kaijo-image";
import { sanityFetch } from "~/features/sanity/client";
import { SanityLink } from "~/features/sanity/link";
import { LinkFragment } from "~/features/sanity/link/fragment";
import { ImageFragment } from "~/features/sanity/media/fragment";
import type { FeatureLinksSectionQResult } from "~/sanity/types";

const FeatureLinksSectionQ =
  defineQuery(`*[_id == $docId][0].pageBuilder.sectionsArray[_type == "featureLinksSectionField" && _key == $sectionKey][0]{
    "content": sectionContent{
      title,
      items[]{
        "key": _key,
        title,
        image{${ImageFragment}},
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
                  <div className="feature-links_media">
                    <KaijoImage image={item.image} className="feature-links_image" sizes="(max-width: 767px) 90vw, 45vw" />
                  </div>
                  <div className="feature-links_label">{item.title}</div>
                </SanityLink>
              ) : null
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
