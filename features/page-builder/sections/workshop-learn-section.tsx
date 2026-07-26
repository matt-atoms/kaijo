import { defineQuery } from "next-sanity";
import { sanityFetch } from "~/features/sanity/client";
import type { WorkshopLearnSectionQResult } from "~/sanity/types";

const WorkshopLearnSectionQ =
  defineQuery(`*[_id == $docId][0].pageBuilder.sectionsArray[_type == "workshopLearnSectionField" && _key == $sectionKey][0]{
    "content": sectionContent{
      heading,
      lead,
      items[]{ "key": _key, title, description }
    }
}`);

export async function WorkshopLearnSection({ docId, sectionKey }: { docId: string; sectionKey: string }) {
  const section = await sanityFetch<WorkshopLearnSectionQResult>({
    query: WorkshopLearnSectionQ,
    params: { docId, sectionKey },
    options: { next: { tags: [`doc:${docId}`] } },
  });

  const content = section?.content;

  if (!content?.items?.length) {
    return null;
  }

  return (
    <div className="section_workshop-learn section-padding-top">
      <div className="container">
        <div className="workshop-learn_head">
          {content.heading && (
            <h2 data-scramble="scroll" className="section_title">
              {content.heading}
            </h2>
          )}
          {content.lead && <p className="workshop-learn_lead">{content.lead}</p>}
        </div>
        <ol className="workshop-learn_list">
          {content.items.map((item) => (
            <li key={item.key} className="workshop-learn_item">
              <span className="workshop-learn_item-title">{item.title}</span>
              {item.description && <span className="workshop-learn_item-desc">{item.description}</span>}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
