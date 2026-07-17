import { KaijoLogo } from "~/features/kaijo/logo";
import { KaijoNavLink } from "~/features/kaijo/nav-link";
import { sanityFetch } from "~/features/sanity/client";
import { SiteHeaderQ } from "~/features/site/site-header/query";
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
            {/* "kajio" typo is original Webflow class naming */}
            <div className="kajio_logo w-embed">
              <KaijoLogo />
            </div>
          </KaijoNavLink>
          <div className="nav_link-row">
            {links.map((link) => (
              <KaijoNavLink key={link.key} href={link.href} className="nav_link w-inline-block">
                <div className="nav_link-text">{link.text}</div>
              </KaijoNavLink>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
