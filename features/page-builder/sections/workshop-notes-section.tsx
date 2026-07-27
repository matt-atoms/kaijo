import { defineQuery } from "next-sanity";
import { sanityFetch } from "~/features/sanity/client";
import type { WorkshopNotesSectionQResult } from "~/sanity/types";

const WorkshopNotesSectionQ =
  defineQuery(`*[_id == $docId][0].pageBuilder.sectionsArray[_type == "workshopNotesSectionField" && _key == $sectionKey][0]{
    "content": sectionContent{
      heading,
      intro,
      items[]{ "key": _key, label, text },
      note
    }
}`);

export async function WorkshopNotesSection({ docId, sectionKey }: { docId: string; sectionKey: string }) {
  const section = await sanityFetch<WorkshopNotesSectionQResult>({
    query: WorkshopNotesSectionQ,
    params: { docId, sectionKey },
    options: { next: { tags: [`doc:${docId}`] } },
  });

  const content = section?.content;

  if (!content?.items?.length) {
    return null;
  }

  return (
    <div className="section_workshop-notes section-padding-top">
      <div className="container">
        <div className="workshop-notes_head">
          {content.heading && (
            <h2 data-scramble="scroll" className="section_title">
              {content.heading}
            </h2>
          )}
          {content.intro && <p className="workshop-notes_lead">{content.intro}</p>}
        </div>
        <ol className="workshop-notes_list">
          {content.items.map((item) => (
            <li key={item.key} className="workshop-notes_item">
              <span className="workshop-notes_item-title">{item.label ?? item.text}</span>
              {item.label && <span className="workshop-notes_item-desc">{item.text}</span>}
            </li>
          ))}
        </ol>
        {content.note && <p className="workshop-notes_note">{content.note}</p>}
      </div>
    </div>
  );
}
