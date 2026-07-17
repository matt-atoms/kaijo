import { Button } from "~/components/button";
import { AnimatedSanityRichText } from "~/features/rich-text";
import { sanityFetch } from "~/features/sanity/client";
import { SanityLink } from "~/features/sanity/link";
import { SiteErrorQ } from "~/features/site/site-error/query";
import { SiteShell } from "~/features/site/site-shell";
import { SANITY_SINGLETON_SITE_ID } from "~/sanity/constants";
import type { SiteErrorQResult } from "~/sanity/types";

export async function SiteError() {
  const site = await sanityFetch<SiteErrorQResult>({
    query: SiteErrorQ,
    options: { next: { tags: [SANITY_SINGLETON_SITE_ID] } },
  });

  const { text, link, showHeader, showFooter } = site?.notFound ?? {};

  return (
    <SiteShell showHeader={showHeader} showFooter={showFooter}>
      <div className="mx-auto flex w-full max-w-1200 overflow-hidden bg-black px-16 py-64 text-white lg:px-48 lg:py-96">
        <div className="flex max-w-600 flex-col gap-32">
          <AnimatedSanityRichText value={text} viewport={false} />
          {link?.href && (
            <Button asChild>
              <SanityLink link={link}>{link.text}</SanityLink>
            </Button>
          )}
        </div>
      </div>
    </SiteShell>
  );
}
