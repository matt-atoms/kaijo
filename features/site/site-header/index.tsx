import { KaijoNavLink } from "~/features/kaijo/nav-link";
import { sanityFetch } from "~/features/sanity/client";
import { HeaderNav } from "~/features/site/site-header/header-nav";
import { SiteHeaderQ } from "~/features/site/site-header/query";
import { Wordmark } from "~/features/site/site-header/wordmark";
import { SANITY_SINGLETON_SITE_ID } from "~/sanity/constants";
import type { SiteHeaderQResult } from "~/sanity/types";

export async function SiteHeader() {
  const siteHeader = await sanityFetch<SiteHeaderQResult>({
    query: SiteHeaderQ,
    options: { next: { tags: [SANITY_SINGLETON_SITE_ID] } },
  });

  const links = siteHeader?.header?.links ?? [];

  return (
    <header className="nav_wrapper">
      <div className="container">
        <div className="nav_inner">
          <KaijoNavLink href="/" className="kaijo_link w-inline-block">
            <Wordmark />
          </KaijoNavLink>
          <HeaderNav links={links} />
        </div>
      </div>
    </header>
  );
}
