import { defineQuery } from "next-sanity";
import { sanityFetch } from "~/features/sanity/client";
import type { WorkshopTestimonialsSectionQResult } from "~/sanity/types";

const WorkshopTestimonialsSectionQ =
  defineQuery(`*[_id == $docId][0].pageBuilder.sectionsArray[_type == "workshopTestimonialsSectionField" && _key == $sectionKey][0]{
    "content": sectionContent{
      heading,
      lead,
      items[]{ "key": _key, quote, name }
    }
}`);

export async function WorkshopTestimonialsSection({ docId, sectionKey }: { docId: string; sectionKey: string }) {
  const section = await sanityFetch<WorkshopTestimonialsSectionQResult>({
    query: WorkshopTestimonialsSectionQ,
    params: { docId, sectionKey },
    options: { next: { tags: [`doc:${docId}`] } },
  });

  const content = section?.content;

  if (!content?.items?.length) {
    return null;
  }

  return (
    <div className="section_workshop-testimonials section-padding-top">
      <div className="container">
        <div className="workshop-testimonials_head">
          {content.heading && (
            <h2 data-scramble="scroll" className="section-eyebrow">
              {content.heading}
            </h2>
          )}
          {content.lead && <p className="workshop-testimonials_lead">{content.lead}</p>}
        </div>
        <ul className="workshop-testimonials_list">
          {content.items.map((item) => (
            <li key={item.key} className="workshop-testimonials_item">
              <blockquote className="workshop-testimonials_quote">“{item.quote}”</blockquote>
              <cite className="workshop-testimonials_name">{item.name}</cite>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
