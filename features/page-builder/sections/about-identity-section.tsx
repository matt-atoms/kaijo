import { defineQuery } from "next-sanity";
import { KaijoImage } from "~/features/kaijo/kaijo-image";
import { sanityFetch } from "~/features/sanity/client";
import { ImageFragment } from "~/features/sanity/media/fragment";
import type { AboutIdentitySectionQResult } from "~/sanity/types";

const AboutIdentitySectionQ =
  defineQuery(`*[_id == $docId][0].pageBuilder.sectionsArray[_type == "aboutIdentitySectionField" && _key == $sectionKey][0]{
    "content": sectionContent{
      name,
      descriptor,
      location,
      statement,
      portrait{${ImageFragment}}
    }
}`);

export async function AboutIdentitySection({ docId, sectionKey }: { docId: string; sectionKey: string }) {
  const section = await sanityFetch<AboutIdentitySectionQResult>({
    query: AboutIdentitySectionQ,
    params: { docId, sectionKey },
    options: { next: { tags: [`doc:${docId}`] } },
  });

  const content = section?.content;

  if (!content) {
    return null;
  }

  const meta = [content.descriptor, content.location].filter(Boolean).join(" · ");

  return (
    <div className="section_about-identity section-padding-top">
      <div className="container">
        <div className="about-identity_inner">
          <div className="about-identity_portrait">
            <KaijoImage image={content.portrait} className="image" sizes="(max-width: 991px) 100vw, 45vw" />
          </div>
          <div className="about-identity_text">
            <h1 data-scramble="scroll" className="section_title about-identity_name">
              {content.name}
            </h1>
            {meta && <p className="about-identity_meta">{meta}</p>}
            {content.statement && (
              <p data-scramble="scroll" className="about-identity_statement">
                {content.statement}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
