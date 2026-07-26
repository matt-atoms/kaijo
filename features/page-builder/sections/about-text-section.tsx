import { defineQuery, PortableText } from "next-sanity";
import { KaijoImage } from "~/features/kaijo/kaijo-image";
import { sanityFetch } from "~/features/sanity/client";
import { SanityLink } from "~/features/sanity/link";
import { LinkFragment } from "~/features/sanity/link/fragment";
import { ImageFragment } from "~/features/sanity/media/fragment";
import type { AboutTextSectionQResult } from "~/sanity/types";

const AboutTextSectionQ =
  defineQuery(`*[_id == $docId][0].pageBuilder.sectionsArray[_type == "aboutTextSectionField" && _key == $sectionKey][0]{
    "content": sectionContent{
      heading,
      pullQuote,
      appRichText,
      images[]{${ImageFragment}},
      "link": appLink{${LinkFragment}}
    }
}`);

export async function AboutTextSection({ docId, sectionKey }: { docId: string; sectionKey: string }) {
  const section = await sanityFetch<AboutTextSectionQResult>({
    query: AboutTextSectionQ,
    params: { docId, sectionKey },
    options: { next: { tags: [`doc:${docId}`] } },
  });

  const content = section?.content;

  if (!content) {
    return null;
  }

  const images = content.images?.filter((image) => image?._id) ?? [];

  return (
    <div className="section_about-text section-padding-top">
      <div className="container">
        <div className="about-text_inner">
          <div className="about-text_main">
            {content.heading && <div className="about-text_heading">{content.heading}</div>}
            <div className="about-text_body w-richtext">
              {content.appRichText && <PortableText value={content.appRichText} />}
            </div>
            {content.pullQuote && <p className="about-text_quote">{content.pullQuote}</p>}
            {content.link?.href && (
              <SanityLink link={content.link} className="about-text_cta">
                {content.link.text || "Learn more"} →
              </SanityLink>
            )}
          </div>
          {images.length > 0 && (
            <div className="about-text_images">
              {images.map((image) => (
                <KaijoImage key={image._id} image={image} className="about-text_image" sizes="(max-width: 991px) 90vw, 32vw" />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
