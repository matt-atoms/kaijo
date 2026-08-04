import { defineQuery, PortableText } from "next-sanity";
import { KaijoImage } from "~/features/kaijo/kaijo-image";
import { sanityFetch } from "~/features/sanity/client";
import { LinkFragment } from "~/features/sanity/link/fragment";
import { ImageFragment } from "~/features/sanity/media/fragment";
import { GetInTouchForm } from "~/features/site/get-in-touch-form";
import type { WorkshopIntroSectionQResult } from "~/sanity/types";

const WorkshopIntroSectionQ =
  defineQuery(`*[_id == $docId][0].pageBuilder.sectionsArray[_type == "workshopIntroSectionField" && _key == $sectionKey][0]{
    "content": sectionContent{
      heading,
      image{${ImageFragment}},
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
        <h1 data-scramble="scroll" className="section-eyebrow">
          {content.heading}
        </h1>
        <div className="workshop-intro_inner">
          <div className="workshop-intro_lede">
            {content.image && (
              <KaijoImage image={content.image} className="workshop-intro_image" sizes="(max-width: 991px) 100vw, 45vw" />
            )}
            {content.quote && (
              <blockquote className="workshop-intro_quote">
                <p>“{content.quote}”</p>
                {content.quoteAttribution && <cite>— {content.quoteAttribution}</cite>}
              </blockquote>
            )}
          </div>
          <div className="workshop-intro_body">
            <div className="w-richtext">{content.appRichText && <PortableText value={content.appRichText} />}</div>
            {/* Only when a CTA link is set (the main workshops page); detail pages book at the bottom. */}
            {content.link?.text && (
              <GetInTouchForm
                triggerLabel={content.link.text}
                triggerClassName="workshop-intro_cta"
                title="Request info"
                defaultSubject="Workshop enquiry"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
