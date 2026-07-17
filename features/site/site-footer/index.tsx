import { sanityFetch } from "~/features/sanity/client";
import { SanityLink } from "~/features/sanity/link";
import { SiteFooterQ } from "~/features/site/site-footer/query";
import { SANITY_SINGLETON_SITE_ID } from "~/sanity/constants";
import type { SiteFooterQResult } from "~/sanity/types";

export async function SiteFooter() {
  const siteFooter = await sanityFetch<SiteFooterQResult>({
    query: SiteFooterQ,
    options: { next: { tags: [SANITY_SINGLETON_SITE_ID] } },
  });

  const links = [...(siteFooter?.footer?.links ?? []), ...(siteFooter?.footer?.legalLinks ?? [])];

  if (links.length === 0) {
    return null;
  }

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer_inner-wrapper">
          {links.map((link) => (
            <SanityLink key={link.key} link={link} className="footer_link w-inline-block">
              <div className="footer_link-text">{link.text}</div>
            </SanityLink>
          ))}
        </div>
      </div>
    </footer>
  );
}
