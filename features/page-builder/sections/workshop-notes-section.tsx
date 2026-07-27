import { defineQuery } from "next-sanity";
import * as React from "react";
import { sanityFetch } from "~/features/sanity/client";
import type { WorkshopNotesSectionQResult } from "~/sanity/types";

const WorkshopNotesSectionQ =
  defineQuery(`*[_id == $docId][0].pageBuilder.sectionsArray[_type == "workshopNotesSectionField" && _key == $sectionKey][0]{
    "content": sectionContent{
      heading,
      columns[]{
        "key": _key,
        heading,
        intro,
        items[]{ "key": _key, label, text },
        note
      }
    }
}`);

export async function WorkshopNotesSection({ docId, sectionKey }: { docId: string; sectionKey: string }) {
  const section = await sanityFetch<WorkshopNotesSectionQResult>({
    query: WorkshopNotesSectionQ,
    params: { docId, sectionKey },
    options: { next: { tags: [`doc:${docId}`] } },
  });

  const content = section?.content;

  if (!content?.columns?.length) {
    return null;
  }

  return (
    <div className="section_workshop-notes section-padding-top">
      <div className="container">
        {content.heading && (
          <h2 data-scramble="scroll" className="section_title">
            {content.heading}
          </h2>
        )}
        <div className="workshop-notes_flow">
          {content.columns.map((column) => (
            <React.Fragment key={column.key}>
              <h2 className="workshop-notes_heading">{column.heading}</h2>
              {column.intro && <p className="workshop-notes_intro">{column.intro}</p>}
              {column.items && column.items.length > 0 && (
                <ol className="workshop-notes_list">
                  {column.items.map((item) => (
                    <li key={item.key} className="workshop-notes_item">
                      <span className="workshop-notes_item-title">{item.label ?? item.text}</span>
                      {item.label && <span className="workshop-notes_item-desc">{item.text}</span>}
                    </li>
                  ))}
                </ol>
              )}
              {column.note && <p className="workshop-notes_note">{column.note}</p>}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
