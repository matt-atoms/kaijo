import { defineQuery, stegaClean } from "next-sanity";
import { sanityFetch } from "~/features/sanity/client";
import { ImageFragment, type ImageFragmentResult } from "~/features/sanity/media/fragment";
import { SANITY_PROJECT_DOCUMENT_TYPE } from "~/sanity/constants";
import type { PrintsShowcaseProjectsQResult, PrintsShowcaseSectionQResult } from "~/sanity/types";
import { type PrintSlide, PrintsMockupCarousel } from "./prints-mockup-carousel";

const PrintsShowcaseSectionQ =
  defineQuery(`*[_id == $docId][0].pageBuilder.sectionsArray[_type == "printsShowcaseSectionField" && _key == $sectionKey][0]{
    "content": sectionContent{
      heading,
      intro,
      optionsHeading,
      priceNote,
      editions[]{ "key": _key, size, edition }
    },
    "hash": sectionSettings.sectionHash.current
}`);

const PrintsShowcaseProjectsQ =
  defineQuery(`*[_type == "${SANITY_PROJECT_DOCUMENT_TYPE}" && count(prints) > 0] | order(coalesce(gridOrder, 999) asc, date asc){
  title,
  "slug": slug.current,
  "prints": prints[]{ title, image{${ImageFragment}} }
}`);

export async function PrintsShowcaseSection({ docId, sectionKey }: { docId: string; sectionKey: string }) {
  const [section, projects] = await Promise.all([
    sanityFetch<PrintsShowcaseSectionQResult>({
      query: PrintsShowcaseSectionQ,
      params: { docId, sectionKey },
      options: { next: { tags: [`doc:${docId}`, SANITY_PROJECT_DOCUMENT_TYPE] } },
    }),
    sanityFetch<PrintsShowcaseProjectsQResult>({
      query: PrintsShowcaseProjectsQ,
      options: { next: { tags: [SANITY_PROJECT_DOCUMENT_TYPE] } },
    }),
  ]);

  const content = section?.content;

  // Flatten every project's prints into one carousel, numbered per project.
  const slides: PrintSlide[] = (projects ?? []).flatMap((project) => {
    const title = project.title ?? "Project";
    const slug = project.slug ?? "";
    const prints = (project.prints ?? []).filter((print): print is typeof print & { image: ImageFragmentResult } =>
      Boolean(print?.image?._id)
    );
    return prints.map((print, index) => ({
      key: `${slug}-${index}`,
      project: title,
      slug,
      number: index + 1,
      title: print.title ?? null,
      image: print.image,
    }));
  });

  if (slides.length === 0) {
    return null;
  }

  const editions = content?.editions ?? [];
  const sizes = editions.map((edition) => edition.size).filter((size): size is string => Boolean(size));

  return (
    <div
      id={stegaClean(section?.hash) || "prints"}
      data-page-builder-section="printsShowcaseSection"
      className="section_prints-showcase section-padding-top"
    >
      <div className="container">
        <div className="prints_head">
          {content?.heading && (
            <h1 data-scramble="scroll" className="section_title prints_head-title">
              {content.heading}
            </h1>
          )}
          <div className="prints_head-body">{content?.intro && <p className="prints_intro">{content.intro}</p>}</div>
          {editions.length > 0 && (
            <>
              <div className="prints_options-head">
                {content?.optionsHeading && <div className="prints_options-title">{content.optionsHeading}</div>}
                {content?.priceNote && <p className="prints_options-price">{content.priceNote}</p>}
              </div>
              <dl className="prints_options-list">
                {editions.map((edition) => (
                  <div key={edition.key} className="prints_options-row">
                    <dt>{edition.size}</dt>
                    {edition.edition && <dd>{edition.edition}</dd>}
                  </div>
                ))}
              </dl>
            </>
          )}
        </div>
      </div>

      <PrintsMockupCarousel slides={slides} sizes={sizes} />
    </div>
  );
}
