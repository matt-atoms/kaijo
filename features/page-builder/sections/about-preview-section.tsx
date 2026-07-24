import { defineQuery } from "next-sanity";
import { sanityFetch } from "~/features/sanity/client";
import { SanityLink } from "~/features/sanity/link";
import { LinkFragment } from "~/features/sanity/link/fragment";
import type { AboutPreviewSectionQResult } from "~/sanity/types";

const AboutPreviewSectionQ =
  defineQuery(`*[_id == $docId][0].pageBuilder.sectionsArray[_type == "aboutPreviewSectionField" && _key == $sectionKey][0]{
    "content": sectionContent{
      text,
      "link": appLink{${LinkFragment}}
    }
}`);

export async function AboutPreviewSection({ docId, sectionKey }: { docId: string; sectionKey: string }) {
  const section = await sanityFetch<AboutPreviewSectionQResult>({
    query: AboutPreviewSectionQ,
    params: { docId, sectionKey },
    options: { next: { tags: [`doc:${docId}`] } },
  });

  if (!section?.content) {
    return null;
  }

  const { text, link } = section.content;

  return (
    <div className="section_about-preview">
      <div className="container">
        <div className="about-preview_inner">
          <p data-scramble="scroll" className="about-preview_text">
            {text}
          </p>
          {link?.href && (
            <SanityLink link={link} className="about-preview_link">
              {link.text || "Read more"} →
            </SanityLink>
          )}
        </div>
      </div>
    </div>
  );
}
