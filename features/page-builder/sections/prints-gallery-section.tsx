import { defineQuery } from "next-sanity";
import { sanityFetch } from "~/features/sanity/client";
import { SanityLink } from "~/features/sanity/link";
import { LinkFragment } from "~/features/sanity/link/fragment";
import { ImageFragment } from "~/features/sanity/media/fragment";
import type { PrintsGallerySectionQResult } from "~/sanity/types";
import { PrintsCarousel } from "./prints-carousel";

const PrintsGallerySectionQ =
  defineQuery(`*[_id == $docId][0].pageBuilder.sectionsArray[_type == "printsGallerySectionField" && _key == $sectionKey][0]{
    "content": sectionContent{
      heading,
      intro,
      "enquiry": enquiryLink{${LinkFragment}},
      optionsHeading,
      editions[]{ "key": _key, size, edition },
      priceNote,
      categories[]{
        "key": _key,
        title,
        description,
        images[]{${ImageFragment}}
      }
    }
}`);

export async function PrintsGallerySection({ docId, sectionKey }: { docId: string; sectionKey: string }) {
  const section = await sanityFetch<PrintsGallerySectionQResult>({
    query: PrintsGallerySectionQ,
    params: { docId, sectionKey },
    options: { next: { tags: [`doc:${docId}`] } },
  });

  const content = section?.content;

  if (!content?.categories?.length) {
    return null;
  }

  return (
    <div className="section_prints section-padding-top section-padding-bottom">
      <div className="container">
        <div className="prints_head">
          {content.heading && (
            <h2 data-scramble="scroll" className="section_title prints_head-title">
              {content.heading}
            </h2>
          )}
          <div className="prints_head-body">
            {content.intro && <p className="prints_intro">{content.intro}</p>}
            {content.enquiry?.href && (
              <SanityLink link={content.enquiry} className="prints_enquiry">
                {content.enquiry.text || "Enquire about prints"} →
              </SanityLink>
            )}
          </div>
          {content.editions && content.editions.length > 0 && (
            <>
              <div className="prints_options-head">
                {content.optionsHeading && <div className="prints_options-title">{content.optionsHeading}</div>}
                {content.priceNote && <p className="prints_options-price">{content.priceNote}</p>}
              </div>
              <dl className="prints_options-list">
                {content.editions.map((edition) => (
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

      {content.categories.map((category) => {
        const images = (category.images ?? []).filter((image) => image?._id);
        if (images.length === 0) {
          return null;
        }
        return (
          <div key={category.key} className="prints_series">
            <div className="container">
              <div className="prints_series-head">
                <h2 className="prints_series-title">{category.title}</h2>
                {category.description && <p className="prints_series-desc">{category.description}</p>}
              </div>
            </div>
            <PrintsCarousel images={images} label={category.title ?? "Prints"} />
          </div>
        );
      })}
    </div>
  );
}
