import { defineQuery, stegaClean } from "next-sanity";
import { WorkTileFragment, type WorkTileResult } from "~/features/kaijo/fragments";
import { WorkTile } from "~/features/page-builder/sections/work-overview-tile";
import { sanityFetch } from "~/features/sanity/client";
import { SANITY_PROJECT_DOCUMENT_TYPE } from "~/sanity/constants";

const WorkOverviewSectionQ =
  defineQuery(`*[_id == $docId][0].pageBuilder.sectionsArray[_type == "workOverviewSectionField" && _key == $sectionKey][0]{
    "groups": sectionContent.groups[]{
      "key": _key,
      heading,
      intro,
      "projects": *[_type == "${SANITY_PROJECT_DOCUMENT_TYPE}" && defined(slug.current) && category == ^.category] | order(date asc){${WorkTileFragment}}
    }
}`);

type WorkOverviewResult = {
  groups: Array<{
    key: string;
    heading: string | null;
    intro: string | null;
    projects: WorkTileResult[];
  }> | null;
} | null;

/** Slugify a (possibly stega-encoded) heading for use as an anchor id / hash target. */
function anchorId(heading: string | null): string {
  return stegaClean(heading ?? "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function WorkOverviewSection({ docId, sectionKey }: { docId: string; sectionKey: string }) {
  const section = await sanityFetch<WorkOverviewResult>({
    query: WorkOverviewSectionQ,
    params: { docId, sectionKey },
    options: { next: { tags: [`doc:${docId}`, SANITY_PROJECT_DOCUMENT_TYPE] } },
  });

  const groups = section?.groups?.filter((group) => group.projects?.length);

  if (!groups?.length) {
    return null;
  }

  return (
    <div className="section_work section-padding-top" data-page-builder-section="workOverviewSection">
      <div className="container">
        <nav className="work-anchors" aria-label="Work sections">
          {groups.map((group) => (
            <a key={group.key} href={`#${anchorId(group.heading)}`} className="work-anchor">
              {group.heading}
            </a>
          ))}
        </nav>
        {groups.map((group) => (
          <section key={group.key} id={anchorId(group.heading)} className="work-group">
            <div className="work-section_header">
              <h2 data-scramble="scroll" className="section_title work-group_heading">
                {group.heading}
              </h2>
              {group.intro && (
                <p data-scramble="scroll" className="work-group_intro">
                  {group.intro}
                </p>
              )}
            </div>
            <div className="work-masonry">
              {group.projects.map((project) => (
                <WorkTile key={project._id} project={project} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
