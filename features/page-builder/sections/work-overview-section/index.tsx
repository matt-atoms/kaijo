import { defineQuery, stegaClean } from "next-sanity";
import { WorkAnchors } from "~/features/page-builder/sections/work-overview-anchors";
import { sanityFetch } from "~/features/sanity/client";
import { ImageFragment } from "~/features/sanity/media/fragment";
import { SANITY_PROJECT_DOCUMENT_TYPE } from "~/sanity/constants";
import type { WorkOverviewSectionQResult } from "~/sanity/types";
import { WorkGallery, type WorkGalleryItem } from "./work-gallery";
import { WorkRouteLock } from "./work-route-lock";

const WorkOverviewSectionQ =
  defineQuery(`*[_id == $docId][0].pageBuilder.sectionsArray[_type == "workOverviewSectionField" && _key == $sectionKey][0]{
    "groups": sectionContent.groups[]{
      "key": _key,
      heading,
      intro,
      "projects": *[_type == "${SANITY_PROJECT_DOCUMENT_TYPE}" && defined(slug.current) && category == ^.category] | order(coalesce(gridOrder, 9999) asc, date asc){
        _id,
        title,
        type,
        client,
        date,
        "slug": slug.current,
        "image": coalesce(images[best == true && defined(image.asset)][0].image, thumbnail){
          ${ImageFragment}
          "aspectRatio": asset->metadata.dimensions.aspectRatio
        }
      }
    }
}`);

/** Slugify a (possibly stega-encoded) heading for use as an anchor id / hash target. */
function anchorId(heading: string | null | undefined): string {
  return stegaClean(heading ?? "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function WorkOverviewSection({ docId, sectionKey }: { docId: string; sectionKey: string }) {
  const section = await sanityFetch<WorkOverviewSectionQResult>({
    query: WorkOverviewSectionQ,
    params: { docId, sectionKey },
    options: { next: { tags: [`doc:${docId}`, SANITY_PROJECT_DOCUMENT_TYPE] } },
  });

  const groups = section?.groups?.filter((group) => group.projects?.length);

  if (!groups?.length) {
    return null;
  }

  const anchors = groups.map((group) => ({ id: anchorId(group.heading), label: group.heading ?? "" }));

  return (
    <div className="section_work section-padding-top" data-page-builder-section="workOverviewSection">
      <WorkRouteLock />
      <div className="container">
        <WorkAnchors anchors={anchors} />
        {/* On pointer devices `work-route` turns this into a vertical scroll-snap track: each group
            below fills one viewport and snaps into view (see the .work-scroller CSS). */}
        <div className="work-scroller">
          {groups.map((group) => {
            const items: WorkGalleryItem[] = (group.projects ?? [])
              .filter((project) => project.image?._id)
              .map((project) => ({
                key: project._id,
                image: project.image ?? null,
                aspectRatio: project.image?.aspectRatio ?? null,
                project: project.title ?? "",
                type: project.type ?? null,
                year: project.date ? project.date.slice(0, 4) : null,
                slug: project.slug ?? "",
              }));

            return (
              <section key={group.key} id={anchorId(group.heading)} className="work-group">
                {group.intro && (
                  <p data-scramble="scroll" className="work-group_intro">
                    {group.intro}
                  </p>
                )}
                {items.length > 0 && <WorkGallery items={items} />}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
