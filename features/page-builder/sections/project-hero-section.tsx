import { defineQuery } from "next-sanity";
import { Link } from "~/components/link";
import { ProjectTileFragment, type ProjectTileResult } from "~/features/kaijo/fragments";
import { KaijoImage } from "~/features/kaijo/kaijo-image";
import { sanityFetch } from "~/features/sanity/client";
import { SANITY_PROJECT_DOCUMENT_TYPE } from "~/sanity/constants";

const ProjectHeroQ = defineQuery(`
  *[_type == "${SANITY_PROJECT_DOCUMENT_TYPE}" && defined(slug.current)] | order(date asc){${ProjectTileFragment}}
`);

/**
 * "Selected Work": inverts the original floating-name hero. The project image, category and year
 * are shown up front; the project name is revealed as an overlay on hover (the reverse of the old
 * names-visible / image-on-hover interaction). Hover is CSS-only (see .selected_* in global.css).
 */
export async function ProjectHeroSection(_props: { docId: string; sectionKey: string }) {
  const projects = await sanityFetch<ProjectTileResult[]>({
    query: ProjectHeroQ,
    options: { next: { tags: [SANITY_PROJECT_DOCUMENT_TYPE] } },
  });

  if (!projects?.length) {
    return null;
  }

  return (
    <section className="section_selected section-padding-top">
      <div className="container">
        <div className="vertical_layout">
          <h2 data-scramble="scroll" className="section_title">
            Selected Work
          </h2>
          <div className="selected_grid">
            {projects.map((project) => (
              <Link key={project._id} href={`/project/${project.slug}`} className="selected_tile">
                <div className="selected_media">
                  <KaijoImage
                    image={project.thumbnail}
                    className="selected_image"
                    sizes="(max-width: 767px) 90vw, (max-width: 991px) 45vw, 30vw"
                  />
                  <div className="selected_overlay">
                    <span className="selected_name">{project.title}</span>
                  </div>
                </div>
                <div className="selected_meta">
                  {project.client && <span className="selected_client">{project.client}</span>}
                  {project.type && <span className="selected_category">{project.type}</span>}
                  {project.date && <span className="selected_year">{project.date.slice(0, 4)}</span>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
