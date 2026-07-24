import { defineQuery } from "next-sanity";
import { KaijoImage } from "~/features/kaijo/kaijo-image";
import { sanityFetch } from "~/features/sanity/client";
import { SanityLink } from "~/features/sanity/link";
import { LinkFragment } from "~/features/sanity/link/fragment";
import { ImageFragment } from "~/features/sanity/media/fragment";
import type { WorkshopsSectionQResult } from "~/sanity/types";

const WorkshopsSectionQ =
  defineQuery(`*[_id == $docId][0].pageBuilder.sectionsArray[_type == "workshopsSectionField" && _key == $sectionKey][0]{
    "content": sectionContent{
      headline,
      text,
      image{${ImageFragment}},
      "link": appLink{${LinkFragment}}
    }
}`);

export async function WorkshopsSection({ docId, sectionKey }: { docId: string; sectionKey: string }) {
  const section = await sanityFetch<WorkshopsSectionQResult>({
    query: WorkshopsSectionQ,
    params: { docId, sectionKey },
    options: { next: { tags: [`doc:${docId}`] } },
  });

  const content = section?.content;

  if (!content) {
    return null;
  }

  return (
    <div className="section_workshops">
      <div className="container">
        <div className="workshops_inner">
          <div className="workshops_media">
            <KaijoImage image={content.image} className="image" sizes="(max-width: 991px) 100vw, 50vw" />
          </div>
          <div className="workshops_content">
            {content.headline && (
              <h2 data-scramble="scroll" className="section_title">
                {content.headline}
              </h2>
            )}
            <p data-scramble="scroll" className="workshops_text">
              {content.text}
            </p>
            {content.link?.href && (
              <SanityLink link={content.link} className="workshops_button">
                {content.link.text || "Learn more"} →
              </SanityLink>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
