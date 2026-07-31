import { defineQuery, stegaClean } from "next-sanity";
import { sanityFetch } from "~/features/sanity/client";
import { ImageFragment } from "~/features/sanity/media/fragment";
import { SANITY_PROJECT_DOCUMENT_TYPE } from "~/sanity/constants";
import type { HomeShowcaseProjectsQResult, HomeShowcaseSectionQResult } from "~/sanity/types";
import { HomeShowcaseScroll, type HomeShowcaseSlide } from "./home-showcase-scroll";

const HomeShowcaseSectionQ =
  defineQuery(`*[_id == $docId][0].pageBuilder.sectionsArray[_type == "homeShowcaseSectionField" && _key == $sectionKey][0]{
    "content": sectionContent{
      title,
      intro
    }
}`);

/**
 * Every project image ticked "Show on home" (project → Media → Overview images → home), flattened
 * into one pool. A project surfaces here only if it has ≥1 home image; it still shows on /work either
 * way. The client component scatters + reshuffles the pool on each load.
 */
const HomeShowcaseProjectsQ = defineQuery(`
  *[_type == "${SANITY_PROJECT_DOCUMENT_TYPE}" && defined(slug.current) && count(overviewImages[home == true && defined(image.asset)]) > 0]
    | order(date desc){
    _id,
    title,
    type,
    client,
    date,
    "slug": slug.current,
    "images": overviewImages[home == true && defined(image.asset)]{
      "key": _key,
      "aspectRatio": image.asset->metadata.dimensions.aspectRatio,
      "image": image{${ImageFragment}}
    }
  }
`);

export async function HomeShowcaseSection({ docId, sectionKey }: { docId: string; sectionKey: string }) {
  const [section, projects] = await Promise.all([
    sanityFetch<HomeShowcaseSectionQResult>({
      query: HomeShowcaseSectionQ,
      params: { docId, sectionKey },
      options: { next: { tags: [`doc:${docId}`] } },
    }),
    sanityFetch<HomeShowcaseProjectsQResult>({
      query: HomeShowcaseProjectsQ,
      options: { next: { tags: [SANITY_PROJECT_DOCUMENT_TYPE] } },
    }),
  ]);

  const content = section?.content;

  if (!content) {
    return null;
  }

  const slides: HomeShowcaseSlide[] = (projects ?? []).flatMap((project) =>
    (project.images ?? [])
      .filter((slot) => slot.image?._id)
      .map((slot) => ({
        key: `${project._id}:${slot.key}`,
        image: slot.image,
        aspectRatio: slot.aspectRatio ?? slot.image?.dimensions?.aspectRatio ?? null,
        project: project.title ?? "",
        type: project.type ?? null,
        year: project.date ? project.date.slice(0, 4) : null,
        slug: project.slug ?? "",
      }))
  );

  if (slides.length === 0) {
    return null;
  }

  return (
    <section className="section_home-showcase section-padding-top">
      <div className="container">
        <div className="home-showcase_head">
          {content.title && (
            <h2 data-scramble="scroll" className="section_title">
              {stegaClean(content.title)}
            </h2>
          )}
          {content.intro && <p className="home-showcase_intro">{content.intro}</p>}
        </div>
      </div>
      <HomeShowcaseScroll slides={slides} />
    </section>
  );
}
