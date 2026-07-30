import { defineQuery, PortableText } from "next-sanity";
import { KaijoImage } from "~/features/kaijo/kaijo-image";
import { sanityFetch } from "~/features/sanity/client";
import { ImageFragment } from "~/features/sanity/media/fragment";
import { ContactLinks } from "~/features/site/contact-links";
import type { AboutIdentitySectionQResult } from "~/sanity/types";

const AboutIdentitySectionQ =
  defineQuery(`*[_id == $docId][0].pageBuilder.sectionsArray[_type == "aboutIdentitySectionField" && _key == $sectionKey][0]{
    "content": sectionContent{
      heading,
      appRichText,
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

  return (
    <div className="section_about-identity section-padding-top">
      <div className="container">
        <div className="about-identity_inner">
          <div className="about-identity_text">
            {content.heading && (
              <h2 data-scramble="scroll" className="section_title">
                {content.heading}
              </h2>
            )}
            <div className="about-identity_body w-richtext">
              {content.appRichText && <PortableText value={content.appRichText} />}
            </div>
            <ContactLinks className="about-identity_contact" />
          </div>
          <div className="about-identity_portrait">
            <KaijoImage image={content.portrait} className="image" sizes="(max-width: 991px) 100vw, 42vw" />
          </div>
        </div>
      </div>
    </div>
  );
}
