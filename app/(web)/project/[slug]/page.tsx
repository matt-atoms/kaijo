import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { defineQuery, PortableText } from "next-sanity";
import { env } from "~/env";
import { KaijoImage } from "~/features/kaijo/kaijo-image";
import { sanityFetch } from "~/features/sanity/client";
import { ImageFragment, type ImageFragmentResult } from "~/features/sanity/media/fragment";
import { seo } from "~/features/site/seo/utils";
import { SiteShell } from "~/features/site/site-shell";
import { SANITY_PROJECT_DOCUMENT_TYPE } from "~/sanity/constants";

const ProjectQ = defineQuery(`
  *[_type == "${SANITY_PROJECT_DOCUMENT_TYPE}" && slug.current == $slug][0]{
    _id,
    title,
    description,
    "slug": slug.current,
    image1{${ImageFragment}},
    image2{${ImageFragment}},
    image3{${ImageFragment}},
    image4{${ImageFragment}},
    image5{${ImageFragment}},
    image6{${ImageFragment}},
    image7{${ImageFragment}},
    image8{${ImageFragment}},
    image9{${ImageFragment}},
    image10{${ImageFragment}},
    image11{${ImageFragment}},
    image12{${ImageFragment}},
    image13{${ImageFragment}},
    image14{${ImageFragment}},
    image15{${ImageFragment}},
    image16{${ImageFragment}}
  }
`);

type ProjectResult =
  | ({
      _id: string;
      title: string | null;
      // biome-ignore lint/suspicious/noExplicitAny: portable text payload rendered by PortableText.
      description: any;
      slug: string | null;
    } & { [K in `image${number}`]?: ImageFragmentResult | null })
  | null;

const ProjectSlugsQ = defineQuery(`
  *[_type == "${SANITY_PROJECT_DOCUMENT_TYPE}" && defined(slug.current)]{"slug": slug.current}
`);

/**
 * The Webflow project page places up to 16 CMS image slots into 10 fixed collage rows.
 * Uploaded images fill the slots in order; missing trailing images leave their slots empty,
 * exactly like unbound Webflow CMS fields.
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

  // The original Webflow project pages use the site-wide title ("kaijo").
  return await seo({ canonical: `${env.NEXT_PUBLIC_URL}/project/${slug}` });
}

export default async function ProjectPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const project = await fetchProject(slug);

  if (!project) {
    notFound();
  }

  const images = Array.from({ length: 16 }, (_, i) => project[`image${i + 1}`] ?? null);
  let slotIndex = 0;

  return (
    <SiteShell>
      <div className="section_work">
        <div className="container">
          <div className="portfolio_wrapper">
            <div className="project_description-wrapper">
              <div className="project_name-wrapper">
                <div>
                  <div className="project_name-text">{project.title}</div>
                </div>
              </div>
              <div className="w-richtext">{project.description && <PortableText value={project.description} />}</div>
            </div>
            {SECTION_LAYOUT.map((section, sectionIndex) => (
              <div key={section.className} className={section.className}>
                {sectionIndex === 0 && <div className="project_description-wrapper" />}
                {section.slots.map((slotClassName) => {
                  const image = images[slotIndex];
                  slotIndex += 1;

                  if (!image) {
                    return null;
                  }

                  return (
                    <KaijoImage
                      key={image._id}
                      image={image}
                      className={slotClassName}
                      sizes="(max-width: 767px) 100vw, (max-width: 991px) 90vw, 84vw"
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
