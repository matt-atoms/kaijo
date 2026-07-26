import { defineQuery } from "next-sanity";
import { sanityFetch } from "~/features/sanity/client";
import type { AboutCredentialsSectionQResult } from "~/sanity/types";

const AboutCredentialsSectionQ =
  defineQuery(`*[_id == $docId][0].pageBuilder.sectionsArray[_type == "aboutCredentialsSectionField" && _key == $sectionKey][0]{
    "content": sectionContent{
      heading,
      columns[]{
        "key": _key,
        title,
        entries[]{ "key": _key, name, year }
      }
    }
}`);

export async function AboutCredentialsSection({ docId, sectionKey }: { docId: string; sectionKey: string }) {
  const section = await sanityFetch<AboutCredentialsSectionQResult>({
    query: AboutCredentialsSectionQ,
    params: { docId, sectionKey },
    options: { next: { tags: [`doc:${docId}`] } },
  });

  const content = section?.content;

  if (!content?.columns?.length) {
    return null;
  }

  return (
    <div className="section_about-credentials section-padding-top">
      <div className="container">
        <div className="vertical_layout">
          {content.heading && (
            <h2 data-scramble="scroll" className="section_title">
              {content.heading}
            </h2>
          )}
          <div className="about-credentials_grid">
            {content.columns.map((column) => (
              <div key={column.key} className="about-credentials_col">
                <div className="about-credentials_col-title">{column.title}</div>
                <ul className="about-credentials_list">
                  {column.entries?.map((entry) => (
                    <li key={entry.key} className="about-credentials_entry">
                      <span className="about-credentials_name">{entry.name}</span>
                      {entry.year && <span className="about-credentials_year">{entry.year}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
