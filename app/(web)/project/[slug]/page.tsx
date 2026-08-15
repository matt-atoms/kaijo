import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { defineQuery, PortableText, stegaClean } from "next-sanity";
import { env } from "~/env";
import { sanityFetch } from "~/features/sanity/client";
import { ImageFragment, type ImageFragmentResult } from "~/features/sanity/media/fragment";
import { DevelopLens } from "~/features/site/develop-lens";
import { seo } from "~/features/site/seo/utils";
import { SiteShell } from "~/features/site/site-shell";
import { SANITY_PROJECT_DOCUMENT_TYPE } from "~/sanity/constants";
import { createExcerptFromPortableText } from "~/sanity/utils";
import { ProjectCategoryGallery } from "./category-gallery";
import { LightboxProvider } from "./lightbox";
import { ProjectCollage } from "./project-collage";
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
  // Best images fill the full-width collage (in CMS order); everything else flows into the series gallery.
  const bestImages = allImages.filter((i) => i.best).slice(0, MAX_BEST);
  const restImages = allImages.filter((i) => !i.best);

  // stegaClean before comparing: draft/preview strings carry invisible click-to-edit payload.
  const isCommission = stegaClean(project.category ?? "") === "Commissions";
  const year = project.date ? project.date.slice(0, 4) : null;

  // Beside the title at the top: a quick-glance status + starting year (small, light).
  const topMeta = [project.status, year].filter(Boolean).join(" · ") || null;

  // The fuller meta stays at the foot with the description — minus the year/status already shown up top.
  const metaRows: Array<{ label: string; value: string | null | undefined }> = [];
  if (isCommission) {
    metaRows.push({ label: "Client", value: project.client }, { label: "Role", value: project.role });
  }
  metaRows.push({ label: "Availability", value: project.availability });
  const bottomRows = metaRows.filter((row) => row.value);

  const category = stegaClean(project.category ?? "");
  const backHref = isCommission ? "/work#commissions" : "/work#projects";

  return (
    <SiteShell>
      <DevelopLens />
      <div className="section_work section_work--project">
        <div className="container">
          {/* Title at the top, with a small light status · year beside it. */}
          <header className="project_top">
            <h1 className="project_name-text">{project.title}</h1>
            {topMeta && <p className="project_top-meta">{topMeta}</p>}
          </header>

          <LightboxProvider>
            {/* Full-bleed, flowing collage of the Best images. */}
            <ProjectCollage images={bestImages} />

            {/* The rest of the editorial text sits between the Best collage and the full series. */}
            <div className="project_bottom">
              {bottomRows.length > 0 && (
                <dl className="project_meta">
                  {bottomRows.map((row) => (
                    <div key={row.label} className="project_meta-row">
                      <dt className="project_meta-label">{row.label}</dt>
                      <dd className="project_meta-value">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
              <div className="project_bottom-copy w-richtext">
                {project.description && <PortableText value={project.description} />}
              </div>
              {isCommission && project.credits && (
                <div className="project_credits">
                  <h2 className="section-eyebrow">Credits</h2>
                  <p className="project_credits-text">{project.credits}</p>
                </div>
              )}
            </div>

            <ProjectSeriesGallery images={restImages} />
          </LightboxProvider>

          <ProjectCategoryGallery category={category} currentSlug={slug} backHref={backHref} />
        </div>
      </div>
    </SiteShell>
  );
}
