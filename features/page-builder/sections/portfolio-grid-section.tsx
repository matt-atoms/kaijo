import { defineQuery } from "next-sanity";
import { Link } from "~/components/link";
import { DynamicCursor } from "~/features/kaijo/dynamic-cursor";
import { ProjectTileFragment, type ProjectTileResult } from "~/features/kaijo/fragments";
import { KaijoImage } from "~/features/kaijo/kaijo-image";
import { sanityFetch } from "~/features/sanity/client";
import { SANITY_PROJECT_DOCUMENT_TYPE } from "~/sanity/constants";

/**
 * Reads this section's optional `category` filter and lists the matching projects in one round
 * trip: `^.category` is the section's filter, so an unset filter (`!defined(^.category)`) lists
 * every project (homepage / all-work behaviour) while a set filter narrows to that category (the
 * /work sub-pages). The GROQ comparison runs server-side on raw values, so it needs no stegaClean.
 */
const PortfolioGridQ = defineQuery(`
  *[_id == $docId][0].pageBuilder.sectionsArray[_type == "portfolioGridSectionField" && _key == $sectionKey][0]{
    "projects": *[_type == "${SANITY_PROJECT_DOCUMENT_TYPE}" && defined(slug.current) && (!defined(^.sectionContent.category) || category == ^.sectionContent.category)] | order(gridOrder asc){${ProjectTileFragment}}
  }
`);

type PortfolioGridResult = { projects: ProjectTileResult[] } | null;

/**
 * The Webflow grid items carry this node id; the site CSS targets it with
 * `#w-node-… { align-self: start }`, which outranks the `.portfolio_item:nth-child(odd)` rule.
 */
const W_NODE_ID = "w-node-_07809c38-3c7d-8b47-6519-7fadec3796aa-495fc836";

export async function PortfolioGridSection({ docId, sectionKey }: { docId: string; sectionKey: string }) {
  const result = await sanityFetch<PortfolioGridResult>({
    query: PortfolioGridQ,
    params: { docId, sectionKey },
    options: { next: { tags: [`doc:${docId}`, SANITY_PROJECT_DOCUMENT_TYPE] } },
  });

  const projects = result?.projects;

  if (!projects?.length) {
    return null;
  }

  return (
    <div className="section_portfolio section-padding-top section-padding-bottom">
      <DynamicCursor />
      <div className="container">
        <div className="vertical_layout">
          {/* The original page has a Webflow embed (style block) here; as a flex child it adds one
              vertical_layout gap to the section height, so keep an empty stand-in for 1:1 spacing. */}
          <div className="w-embed" />
          <div className="portfolio_list-wrapper w-dyn-list">
            {/* biome-ignore lint/a11y/useSemanticElements: 1:1 port of the Webflow collection-list markup. */}
            <div role="list" className="portfolio_list w-dyn-items">
              {projects.map((project) => (
                // biome-ignore lint/a11y/useSemanticElements: 1:1 port of the Webflow collection-list markup.
                <div
                  key={project._id}
                  item-style={project.gridStyle === "wide" ? "wide" : ""}
                  id={W_NODE_ID}
                  role="listitem"
                  className="portfolio_item w-dyn-item"
                >
                  <Link
                    data-cursor={project.title}
                    href={`/project/${project.slug}`}
                    className="portfolio_item-link w-inline-block"
                  >
                    <div className="portfolio_item-inner">
                      <KaijoImage
                        image={project.thumbnail}
                        className="portfolio_image"
                        sizes="(max-width: 767px) 90vw, (max-width: 991px) 63vw, 65vw"
                      />
                    </div>
                    {/* Mobile-only: touch devices have no cursor follower to name the project. */}
                    <div className="portfolio_item-caption">
                      <div>{project.title}</div>
                      {project.category && <div className="portfolio_item-caption-category">{project.category}</div>}
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
