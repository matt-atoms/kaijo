import { defineQuery } from "next-sanity";
import { Link } from "~/components/link";
import { WorkGallery, type WorkGalleryItem } from "~/features/page-builder/sections/work-overview-section/work-gallery";
import { sanityFetch } from "~/features/sanity/client";
import { ImageFragment, type ImageFragmentResult } from "~/features/sanity/media/fragment";
import { SANITY_PROJECT_DOCUMENT_TYPE } from "~/sanity/constants";

const CategoryProjectsQ = defineQuery(`
  *[_type == "${SANITY_PROJECT_DOCUMENT_TYPE}" && defined(slug.current) && category == $category && slug.current != $currentSlug] | order(coalesce(gridOrder, 9999) asc, date asc){
    _id,
    title,
    type,
    date,
    "slug": slug.current,
    "image": coalesce(images[best == true && defined(image.asset)][0].image, thumbnail){
      ${ImageFragment}
      "aspectRatio": asset->metadata.dimensions.aspectRatio
    }
  }
`);

type CategoryProject = {
  _id: string;
  title: string | null;
  type: string | null;
  date: string | null;
  slug: string | null;
  image: (ImageFragmentResult & { aspectRatio: number | null }) | null;
};

/**
 * Closes a project page by flowing into the /work index gallery for its own category (Projects or
 * Commissions), so a reader can immediately explore more work with previews — reusing the same
 * side-scrolling `WorkGallery` as /work. The current project is excluded.
 */
export async function ProjectCategoryGallery({
  category,
  currentSlug,
  backHref,
}: {
  category: string;
  currentSlug: string;
  backHref: string;
}) {
  if (!category) {
    return null;
  }

  const projects = await sanityFetch<CategoryProject[]>({
    query: CategoryProjectsQ,
    params: { category, currentSlug },
    options: { next: { tags: [SANITY_PROJECT_DOCUMENT_TYPE] } },
  });

  const items: WorkGalleryItem[] = (projects ?? [])
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

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="project_more" aria-label={`More ${category}`}>
      <div className="project_more-head">
        <h2 className="section-eyebrow">More {category}</h2>
        <Link href={backHref} className="project_more-all">
          All {category} →
        </Link>
      </div>
      <WorkGallery items={items} />
    </section>
  );
}
