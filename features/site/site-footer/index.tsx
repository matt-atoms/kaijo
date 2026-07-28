import { sanityFetch } from "~/features/sanity/client";
import { SanityLink } from "~/features/sanity/link";
import { SiteFooterQ } from "~/features/site/site-footer/query";
import { ThemeSwitcher } from "~/features/site/site-footer/theme-switcher";
import { SANITY_SINGLETON_SITE_ID } from "~/sanity/constants";
import type { SiteFooterQResult } from "~/sanity/types";

export async function SiteFooter() {
  const siteFooter = await sanityFetch<SiteFooterQResult>({
    query: SiteFooterQ,
    options: { next: { tags: [SANITY_SINGLETON_SITE_ID] } },
  });

  const links = [...(siteFooter?.footer?.links ?? []), ...(siteFooter?.footer?.legalLinks ?? [])];

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer_inner-wrapper">
          <div className="footer_links">
            {links.map((link) => (
              <SanityLink key={link.key} link={link} className="footer_link w-inline-block">
                <div className="footer_link-text">{link.text}</div>
              </SanityLink>
            ))}
          </div>
          {/* Newsletter placeholder — non-functional; wire up to an email provider later. */}
          <form className="footer_newsletter" aria-label="Newsletter sign-up" data-placeholder="true">
            <span className="footer_newsletter-label">Newsletter</span>
            <div className="footer_newsletter-row">
              <input type="email" className="footer_newsletter-input" placeholder="your@email.com" aria-label="Email address" />
              <button type="button" className="footer_newsletter-button">
                Subscribe
              </button>
            </div>
          </form>
        </div>
        <ThemeSwitcher />
      </div>
    </footer>
  );
}
