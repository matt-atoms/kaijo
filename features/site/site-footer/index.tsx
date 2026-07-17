import { sanityFetch } from "~/features/sanity/client";
import { SiteFooterQ } from "~/features/site/site-footer/query";
import { SiteNavLink } from "~/features/site/site-nav-link";
import { SANITY_SINGLETON_SITE_ID } from "~/sanity/constants";
import type { SiteFooterQResult } from "~/sanity/types";

export async function SiteFooter() {
  const siteFooter = await sanityFetch<SiteFooterQResult>({
    query: SiteFooterQ,
    options: { next: { tags: [SANITY_SINGLETON_SITE_ID] } },
  });

  if (!siteFooter?.footer?.links) {
    return null;
  }

  const { name, footer } = siteFooter;
  const year = new Date().getFullYear();

  return (
    <footer>
      <div className="mx-auto flex max-w-1200 flex-col gap-16 px-16 py-48 lg:flex-row lg:items-center lg:justify-between lg:px-48">
        <p className="text-body-10">
          © {year} {name}
        </p>
        <nav>
          <ul className="flex gap-24">
            {[...(footer.links ?? []), ...(footer.legalLinks ?? [])].map((link, i) => (
              <li key={link.key}>
                <SiteNavLink link={link} animationDelay={i * 0.1} viewport={{ margin: "0px" }} />
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
