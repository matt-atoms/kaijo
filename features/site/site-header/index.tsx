import { sanityFetch } from "~/features/sanity/client";
import { SiteHeaderQ } from "~/features/site/site-header/query";
import { SiteNavLink } from "~/features/site/site-nav-link";
import { SANITY_SINGLETON_SITE_ID } from "~/sanity/constants";
import type { SiteHeaderQResult } from "~/sanity/types";

export async function SiteHeader() {
  const siteHeader = await sanityFetch<SiteHeaderQResult>({
    query: SiteHeaderQ,
    options: { next: { tags: [SANITY_SINGLETON_SITE_ID] } },
  });

  if (!siteHeader?.header?.links) {
    return null;
  }

  return (
    <header>
      <nav className="mx-auto max-w-1200 px-16 pt-24 lg:gap-120 lg:px-48 lg:pt-96">
        <ul className="flex gap-24">
          {siteHeader.header.links.map((link, i) => (
            <li key={link.key}>
              <SiteNavLink link={link} animationDelay={i * 0.1} />
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
