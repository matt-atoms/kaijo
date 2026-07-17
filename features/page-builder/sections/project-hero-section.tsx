import { defineQuery } from "next-sanity";
import { Link } from "~/components/link";
import { formatProjectDate } from "~/features/kaijo/format-date";
import { ProjectTileFragment, type ProjectTileResult } from "~/features/kaijo/fragments";
import { HeroHover } from "~/features/kaijo/hero-hover";
import { KaijoImage } from "~/features/kaijo/kaijo-image";
import { sanityFetch } from "~/features/sanity/client";
import { cx } from "~/features/style/utils";
import { SANITY_PROJECT_DOCUMENT_TYPE } from "~/sanity/constants";

const ProjectHeroQ = defineQuery(`
  *[_type == "${SANITY_PROJECT_DOCUMENT_TYPE}" && defined(slug.current)] | order(date asc){${ProjectTileFragment}}
`);

function chunkRows<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];

  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }

  return rows;
}

export async function ProjectHeroSection(_props: { docId: string; sectionKey: string }) {
  const projects = await sanityFetch<ProjectTileResult[]>({
    query: ProjectHeroQ,
    options: { next: { tags: [SANITY_PROJECT_DOCUMENT_TYPE] } },
  });

  if (!projects?.length) {
    return null;
  }

  const rows = chunkRows(projects, 3);

  return (
    <section className="section_hero">
      <div className="container">
        <div className="hero_wrapper">
          <div className="portfolio_collection">
            {rows.map((row) => (
              <div key={row[0]?._id} className="portfolio_list-wrapper w-dyn-list">
                {/* biome-ignore lint/a11y/useSemanticElements: 1:1 port of the Webflow collection-list markup. */}
                <div role="list" className="project_row w-dyn-items">
                  {row.map((project) => (
                    // biome-ignore lint/a11y/useSemanticElements: 1:1 port of the Webflow collection-list markup.
                    <div key={project._id} role="listitem" className="project_item w-dyn-item">
                      <Link href={`/project/${project.slug}`} className="project_link w-inline-block">
                        <div className="project_title-wrapper">
                          <h2 className="project_title">{project.title}</h2>
                          <div className="project_details">
                            <div className={cx("project_category", !project.category && "w-dyn-bind-empty")}>
                              {project.category}
                            </div>
                            <div className="project_date">{formatProjectDate(project.date)}</div>
                          </div>
                        </div>
                        <div className="project_image-wrapper">
                          <KaijoImage
                            image={project.thumbnail}
                            className="project_image"
                            sizes="(max-width: 767px) 100vw, (max-width: 991px) 52vw, 30vw"
                          />
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <HeroHover />
    </section>
  );
}
