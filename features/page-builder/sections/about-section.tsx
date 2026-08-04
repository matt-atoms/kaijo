import { defineQuery } from "next-sanity";
import { KaijoImage } from "~/features/kaijo/kaijo-image";
import { sanityFetch } from "~/features/sanity/client";
import { SanityLink } from "~/features/sanity/link";
import { LinkFragment, type LinkFragmentResult } from "~/features/sanity/link/fragment";
import { ImageFragment, type ImageFragmentResult } from "~/features/sanity/media/fragment";
import { ContactLinks } from "~/features/site/contact-links";

const AboutSectionQ = defineQuery(`
  *[_id == $docId][0].pageBuilder.sectionsArray[_type == "aboutSectionField" && _key == $sectionKey][0]{
    "content": sectionContent{
      title,
      text,
      secondText,
      image{${ImageFragment}},
      "link": appLink{${LinkFragment}}
    }
}`);

type AboutSectionResult = {
  content: {
    title: string | null;
    text: string | null;
    secondText: string | null;
    image: ImageFragmentResult | null;
    link: LinkFragmentResult | null;
  } | null;
} | null;

export async function AboutSection({ docId, sectionKey }: { docId: string; sectionKey: string }) {
  const section = await sanityFetch<AboutSectionResult>({
    query: AboutSectionQ,
    params: { docId, sectionKey },
    options: { next: { tags: [`doc:${docId}`] } },
  });

  if (!section?.content) {
    return null;
  }

  const { title, text, secondText, image, link } = section.content;

  return (
    <div className="section_about section-padding-top">
      <div className="container">
        <div className="vertical_layout">
          <div className="about_text-wrapper">
            <div className="about_intro-main">
              {title && (
                <h2 data-scramble="scroll" className="section_title">
                  {title}
                </h2>
              )}
              <p data-scramble="scroll" className="about_intro-text">
                {text}
              </p>
              <div className="about_intro-meta">
                <ContactLinks className="about_intro-contact" />
                {link?.href && (
                  <SanityLink link={link} className="about_intro-more">
                    {link.text || "Read more"} →
                  </SanityLink>
                )}
              </div>
            </div>
          </div>
          {(image?._id || secondText) && (
            <div className="about_image-wrapper">
              <KaijoImage image={image} className="image" sizes="(max-width: 1400px) 100vw, 1400px" />
              {secondText && (
                <p data-scramble="scroll" className="about_paragraph">
                  {secondText}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
