import { defineQuery } from "next-sanity";
import { sanityFetch } from "~/features/sanity/client";
import { SanityLink } from "~/features/sanity/link";
import { LinkFragment } from "~/features/sanity/link/fragment";
import type { AboutContactSectionQResult } from "~/sanity/types";

const AboutContactSectionQ =
  defineQuery(`*[_id == $docId][0].pageBuilder.sectionsArray[_type == "aboutContactSectionField" && _key == $sectionKey][0]{
    "content": sectionContent{
      heading,
      email,
      instagram,
      location,
      inquiries[]{ "key": _key, label, "link": appLink{${LinkFragment}} }
    }
}`);

/** Build a full Instagram URL + display handle from either an @handle or a URL. */
function instagram(value: string | null) {
  if (!value) {
    return null;
  }
  const handle = value
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/^@/, "")
    .replace(/\/$/, "");
  return { url: value.startsWith("http") ? value : `https://instagram.com/${handle}`, label: `@${handle}` };
}

export async function AboutContactSection({ docId, sectionKey }: { docId: string; sectionKey: string }) {
  const section = await sanityFetch<AboutContactSectionQResult>({
    query: AboutContactSectionQ,
    params: { docId, sectionKey },
    options: { next: { tags: [`doc:${docId}`] } },
  });

  const content = section?.content;

  if (!content) {
    return null;
  }

  const ig = instagram(content.instagram ?? null);

  return (
    <div className="section_about-contact section-padding-top section-padding-bottom">
      <div className="container">
        <div className="about-contact_inner">
          <div className="about-contact_card">
            {content.heading && (
              <h2 data-scramble="scroll" className="section_title">
                {content.heading}
              </h2>
            )}
            <div className="about-contact_details">
              {content.email && (
                <a href={`mailto:${content.email}`} className="about-contact_link">
                  {content.email}
                </a>
              )}
              {ig && (
                <a href={ig.url} target="_blank" rel="noopener noreferrer" className="about-contact_link">
                  {ig.label}
                </a>
              )}
              {content.location && <span className="about-contact_location">{content.location}</span>}
            </div>
          </div>
          {content.inquiries && content.inquiries.length > 0 && (
            <div className="about-contact_inquiries">
              {content.inquiries.map((inquiry) =>
                inquiry.link?.href ? (
                  <SanityLink key={inquiry.key} link={inquiry.link} className="about-contact_button">
                    {inquiry.label}
                  </SanityLink>
                ) : null
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
