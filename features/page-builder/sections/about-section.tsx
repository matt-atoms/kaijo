import { defineQuery } from "next-sanity";
import { KaijoImage } from "~/features/kaijo/kaijo-image";
import { sanityFetch } from "~/features/sanity/client";
import { ImageFragment, type ImageFragmentResult } from "~/features/sanity/media/fragment";

const AboutSectionQ = defineQuery(`
  *[_id == $docId][0].pageBuilder.sectionsArray[_type == "aboutSectionField" && _key == $sectionKey][0]{
    "content": sectionContent{
      title,
      text,
      secondText,
      image{${ImageFragment}}
    }
}`);

type AboutSectionResult = {
  content: {
    title: string | null;
    text: string | null;
    secondText: string | null;
    image: ImageFragmentResult | null;
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

  const { title, text, secondText, image } = section.content;

  return (
    <div className="section_about">
      <div className="container">
        <div className="vertical_layout">
          <div className="about_text-wrapper">
            <h2 data-scramble="scroll" className="section_title">
              {title}
            </h2>
            <p data-scramble="scroll">{text}</p>
          </div>
          <div className="about_image-wrapper">
            <KaijoImage image={image} className="image" sizes="(max-width: 1400px) 100vw, 1400px" />
            {secondText && (
              <p data-scramble="scroll" className="about_paragraph">
                {secondText}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
