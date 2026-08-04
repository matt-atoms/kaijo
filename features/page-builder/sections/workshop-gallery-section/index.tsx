import { defineQuery } from "next-sanity";
import { sanityFetch } from "~/features/sanity/client";
import { ImageFragment } from "~/features/sanity/media/fragment";
import { SANITY_PROJECT_DOCUMENT_TYPE } from "~/sanity/constants";
import type { WorkshopGallerySectionQResult } from "~/sanity/types";
import { WorkshopGallery, type WorkshopGalleryImage } from "./workshop-gallery";

const WorkshopGallerySectionQ =
  defineQuery(`*[_id == $docId][0].pageBuilder.sectionsArray[_type == "workshopGallerySectionField" && _key == $sectionKey][0]{
    "content": sectionContent{
      heading,
      "prints": project->prints[defined(image.asset)].image{ ${ImageFragment} },
      "overview": project->overviewImages[defined(image.asset)].image{ ${ImageFragment} }
    }
}`);

export async function WorkshopGallerySection({ docId, sectionKey }: { docId: string; sectionKey: string }) {
  const section = await sanityFetch<WorkshopGallerySectionQResult>({
    query: WorkshopGallerySectionQ,
    params: { docId, sectionKey },
    options: { next: { tags: [`doc:${docId}`, SANITY_PROJECT_DOCUMENT_TYPE] } },
  });

  const content = section?.content;
  const source = content?.prints?.length ? content.prints : (content?.overview ?? []);
  const images: WorkshopGalleryImage[] = source
    .filter((image) => image?._id)
    .map((image, index) => ({
      key: `${image._id}:${index}`,
      image,
      aspectRatio: image.dimensions?.aspectRatio ?? null,
    }));

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="section_workshop-gallery section-padding-top">
      <div className="container">
        {content?.heading && (
          <h2 data-scramble="scroll" className="section-eyebrow workshop-gallery_heading">
            {content.heading}
          </h2>
        )}
      </div>
      <WorkshopGallery images={images} />
    </div>
  );
}
