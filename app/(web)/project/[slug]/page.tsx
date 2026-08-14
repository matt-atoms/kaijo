import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { defineQuery, PortableText, stegaClean } from "next-sanity";
import { env } from "~/env";
import { KaijoImage } from "~/features/kaijo/kaijo-image";
import { sanityFetch } from "~/features/sanity/client";
import { ImageFragment, type ImageFragmentResult } from "~/features/sanity/media/fragment";
import { DevelopLens } from "~/features/site/develop-lens";
import { seo } from "~/features/site/seo/utils";
import { SiteShell } from "~/features/site/site-shell";
import { SANITY_PROJECT_DOCUMENT_TYPE } from "~/sanity/constants";
import { createExcerptFromPortableText } from "~/sanity/utils";
import { ProjectCategoryGallery } from "./category-gallery";
import { ProjectSeriesGallery } from "./project-series-gallery";

const ProjectQ = defineQuery(`
  *[_type == "${SANITY_PROJECT_DOCUMENT_TYPE}" && slug.current == $slug][0]{
    _id,
    title,
    description,
    "slug": slug.current,
    category,
    client,
    role,
    status,
    availability,
    credits,
    date,
    "images": images[defined(image.asset)]{
      "image": image{ ${ImageFragment} },
      "aspectRatio": image.asset->metadata.dimensions.aspectRatio,
      "best": best == true
    }
  }
`);

type ProjectImage = {
  image: ImageFragmentResult | null;
  aspectRatio: number | null;
  best: boolean;
};

type ProjectResult = {
  _id: string;
  title: string | null;
  // biome-ignore lint/suspicious/noExplicitAny: portable text payload rendered by PortableText.
  description: any;
  slug: string | null;
  category: "Projects" | "Commissions" | null;
  client: string | null;
  role: string | null;
  status: string | null;
  availability: string | null;
  credits: string | null;
  date: string | null;
  images: ProjectImage[] | null;
} | null;

const ProjectSlugsQ = defineQuery(`
  *[_type == "${SANITY_PROJECT_DOCUMENT_TYPE}" && defined(slug.current)]{"slug": slug.current}
`);

/**
 * The "Best" images fill this fixed 10-row collage (up to 16), in their CMS order. Missing trailing
 * images just leave their slot empty. Every non-best image drops into the scrolling series gallery.
 */
const SECTION_LAYOUT: Array<{ className: string; slots: string[] }> = [
  { className: "portfolio_section-1", slots: ["work_image", "work_image is-smaller"] },
  { className: "portfolio_section-2", slots: ["work_image is-large"] },
  { className: "portfolio_section-3", slots: ["work_image is-smaller", "work_image is-medium"] },
  { className: "portfolio_section-4", slots: ["work_image is-full"] },
  { className: "portfolio_section-5", slots: ["work_image is-smaller is-alt", "work_image", "work_image is-smaller"] },
  { className: "portfolio_section-6", slots: ["work_image is-large"] },
  { className: "portfolio_section-7", slots: ["work_image is-full"] },
  { className: "portfolio_section-8", slots: ["work_image is-smaller", "work_image is-medium"] },
  { className: "portfolio_section-9", slots: ["work_image is-large"] },
  { className: "portfolio_section-10 section-padding-bottom", slots: ["work_image is-smaller", "work_image is-medium"] },
];

const MAX_BEST = 16;

async function fetchProject(slug: string) {
  return sanityFetch<ProjectResult>({
    query: ProjectQ,
    params: { slug },
    options: { next: { tags: [SANITY_PROJECT_DOCUMENT_TYPE] } },
  });
}

export async function generateStaticParams() {
  const slugs = await sanityFetch<Array<{ slug: string }>>({
    query: ProjectSlugsQ,
    live: false,
  });

  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await props.params;
  const project = await fetchProject(slug);

  if (!project) {
    return await seo({ title: "Not Found" });
  }

  const ogImage = project.images?.find((i) => i.best && i.image?._id)?.image ?? project.images?.find((i) => i.image?._id)?.image;

  return await seo({
    title: project.title ?? undefined,
    description: project.description ? createExcerptFromPortableText(project.description, 160) : undefined,
    image: ogImage ?? undefined,
    canonical: `${env.NEXT_PUBLIC_URL}/project/${slug}`,
  });
}

export default async function ProjectPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const project = await fetchProject(slug);

  if (!project) {
    notFound();
  }

  const allImages = (project.images ?? []).filter((i) => i.image?._id);
  // Best images fill the top collage (in CMS order); everything else flows into the series gallery.
  const bestImages = allImages
    .filter((i) => i.best)
    .slice(0, MAX_BEST)
    .map((i) => i.image);
  const restImages = allImages.filter((i) => !i.best);
  let slotIndex = 0;

  // stegaClean before comparing: draft/preview strings carry invisible click-to-edit payload.
  const isCommission = stegaClean(project.category ?? "") === "Commissions";
  const year = project.date ? project.date.slice(0, 4) : null;

  // Editorial meta by kind — commissions lead with the client/role, personal projects with year/status.
  const metaRows = (
    isCommission
      ? [
          { label: "Client", value: project.client },
          { label: "Year", value: year },
          { label: "Role", value: project.role },
        ]
      : [{ label: project.status ? "Status" : "Year", value: project.status || year }]
  ).filter((row) => row.value);

  if (project.availability) {
    metaRows.push({ label: "Availability", value: project.availability });
  }

  const category = stegaClean(project.category ?? "");
  const backHref = isCommission ? "/work#commissions" : "/work#projects";

  return (
    <SiteShell>
      <DevelopLens />
      <div className="section_work section_work--project">
        <div className="container">
          <div className="portfolio_wrapper">
            <div className="project_description-wrapper">
              <div className="project_name-wrapper">
                <div>
                  <h1 className="project_name-text">{project.title}</h1>
                </div>
              </div>
              {metaRows.length > 0 && (
                <dl className="project_meta">
                  {metaRows.map((row) => (
                    <div key={row.label} className="project_meta-row">
                      <dt className="project_meta-label">{row.label}</dt>
                      <dd className="project_meta-value">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
              <div className="w-richtext">{project.description && <PortableText value={project.description} />}</div>
            </div>
            <div className="portfolio_images">
              {SECTION_LAYOUT.map((section) => (
                <div key={section.className} className={section.className}>
                  {section.slots.map((slotClassName) => {
                    const image = bestImages[slotIndex];
                    slotIndex += 1;

                    if (!image) {
                      return null;
                    }

                    return (
                      <KaijoImage
                        key={image._id}
                        image={image}
                        className={slotClassName}
                        sizes="(max-width: 767px) 100vw, (max-width: 991px) 62vw"
                      />
                    );
                  })}
                </div>
              ))}

              {isCommission && project.credits && (
                <div className="project_credits">
                  <h2 className="section-eyebrow">Credits</h2>
                  <p className="project_credits-text">{project.credits}</p>
                </div>
              )}
            </div>
          </div>

          <ProjectSeriesGallery images={restImages} />

          <ProjectCategoryGallery category={category} currentSlug={slug} backHref={backHref} />
        </div>
      </div>
    </SiteShell>
  );
}
