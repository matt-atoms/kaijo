import { defineQuery, PortableText } from "next-sanity";
import { sanityFetch } from "~/features/sanity/client";
import { SanityLink } from "~/features/sanity/link";
import { LinkFragment } from "~/features/sanity/link/fragment";
import type { WorkshopIntroSectionQResult } from "~/sanity/types";

const WorkshopIntroSectionQ =
  defineQuery(`*[_id == $docId][0].pageBuilder.sectionsArray[_type == "workshopIntroSectionField" && _key == $sectionKey][0]{
    "content": sectionContent{
      heading,
      quote,
      quoteAttribution,
      appRichText,
      "link": appLink{${LinkFragment}}
    }
}`);

export async function WorkshopIntroSection({ docId, sectionKey }: { docId: string; sectionKey: string }) {
  const section = await sanityFetch<WorkshopIntroSectionQResult>({
    query: WorkshopIntroSectionQ,
    params: { docId, sectionKey },
    options: { next: { tags: [`doc:${docId}`] } },
  });

  const content = section?.content;

  if (!content) {
    return null;
  }

  return (
    <div className="section_workshop-intro section-padding-top">
      <div className="container">
        <h1 data-scramble="scroll" className="section_title">
          {content.heading}
        </h1>
        <div className="workshop-intro_inner">
          <div className="workshop-intro_lede">
            {content.quote && (
              <blockquote className="workshop-intro_quote">
                <p>“{content.quote}”</p>
                {content.quoteAttribution && <cite>— {content.quoteAttribution}</cite>}
              </blockquote>
            )}
          </div>
          <div className="workshop-intro_body">
            <div className="w-richtext">{content.appRichText && <PortableText value={content.appRichText} />}</div>
            {content.link?.href && (
              <SanityLink link={content.link} className="workshop-intro_cta">
                {content.link.text || "Request info"} →
              </SanityLink>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
