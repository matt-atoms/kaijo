import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { defineQuery } from "next-sanity";
import { hasPortfolioAccess } from "~/features/portfolio/access";
import { sanityFetch } from "~/features/sanity/client";
import { ImageFragment, type ImageFragmentResult } from "~/features/sanity/media/fragment";
import { seo } from "~/features/site/seo/utils";
import { SiteShell } from "~/features/site/site-shell";
import { SANITY_PORTFOLIO_DOCUMENT_TYPE, SANITY_PROJECT_DOCUMENT_TYPE } from "~/sanity/constants";
import { PortfolioLookbook } from "./portfolio-lookbook";
import { PortfolioUnlock } from "./unlock-screen";

// Cookie-gated per request; never statically rendered (the unlocked content must not be cached).
export const dynamic = "force-dynamic";

const MAX_IMAGES = 40;

// Portfolio metadata only — the password is read separately, server-side, in features/portfolio/access.
const PortfolioMetaQ = defineQuery(`
  *[_type == "${SANITY_PORTFOLIO_DOCUMENT_TYPE}" && slug.current == $slug][0]{
    _id,
    title,
    intro,
    "slug": slug.current
  }
`);

// Images opted into this portfolio, from any project (live or archived), newest project first.
const PortfolioImagesQ = defineQuery(`
  *[_type == "${SANITY_PROJECT_DOCUMENT_TYPE}" && count(images[inPortfolio == true && $pid in portfolios[]._ref]) > 0]
    | order(date desc){
      "items": images[inPortfolio == true && $pid in portfolios[]._ref]{
        "image": image{ ${ImageFragment} },
        "aspectRatio": image.asset->metadata.dimensions.aspectRatio
      }
    }
`);

type PortfolioMeta = {
  _id: string;
  title: string | null;
  intro: string | null;
  slug: string | null;
} | null;

type PortfolioImageRow = {
  items: Array<{ image: ImageFragmentResult | null; aspectRatio: number | null }> | null;
};

// Private lookbooks must never be indexed, whatever the environment.
export async function generateMetadata(): Promise<Metadata> {
  return await seo({ title: "Portfolio", robots: "noindex, nofollow" });
}

export default async function PortfolioPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;

  const portfolio = await sanityFetch<PortfolioMeta>({
    query: PortfolioMetaQ,
    params: { slug },
    live: false,
    options: { cache: "no-store" },
  });

  if (!portfolio?._id) {
    notFound();
  }

  const title = portfolio.title ?? "Portfolio";

  if (!(await hasPortfolioAccess(slug))) {
    return (
      <SiteShell showHeader={false} showFooter={false}>
        <PortfolioUnlock slug={slug} title={title} />
      </SiteShell>
    );
  }

  const rows = await sanityFetch<PortfolioImageRow[]>({
    query: PortfolioImagesQ,
    params: { pid: portfolio._id },
    live: false,
    options: { cache: "no-store" },
  });

  const images = (rows ?? [])
    .flatMap((row) => row.items ?? [])
    .filter((it) => it.image?._id)
    .slice(0, MAX_IMAGES);

  return (
    <SiteShell showHeader={false} showFooter={false}>
      <PortfolioLookbook title={title} intro={portfolio.intro} images={images} />
    </SiteShell>
  );
}
