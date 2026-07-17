import dynamic from "next/dynamic";
import { defineQuery } from "next-sanity";
import { sanityFetch } from "~/features/sanity/client";
import type { PageSectionsQResult } from "~/sanity/types";

const PageSectionsQ = defineQuery(`*[_id == $docId][0].pageBuilder.sectionsArray[]{
  _key,
  _type
}`);

const _sections = {
  mediaSectionField: dynamic(() => import("~/features/page-builder/sections/media-section").then((mod) => mod.MediaSection)),
  ctaSectionField: dynamic(() => import("~/features/page-builder/sections/cta-section").then((mod) => mod.CtaSection)),
  textSectionField: dynamic(() => import("~/features/page-builder/sections/text-section").then((mod) => mod.TextSection)),
  contactFormSectionField: dynamic(() =>
    import("~/features/page-builder/sections/contact-form-section").then((mod) => mod.ContactFormSection)
  ),
  // PLOP: Add Import
} as const;

function isValidSectionType(type: string): type is keyof typeof _sections {
  return type in _sections;
}

export async function PageSections({ docId }: { docId: string }) {
  const sections = await sanityFetch<PageSectionsQResult>({
    query: PageSectionsQ,
    params: {
      docId,
    },
    options: {
      next: {
        tags: [`doc:${docId}`],
      },
    },
  });

  if (!sections) {
    return null;
  }

  return (
    <div className="mx-auto flex w-full max-w-1200 flex-col gap-80 px-16 py-64 lg:gap-120 lg:px-48 lg:py-96">
      {sections.map((section) => {
        if (!isValidSectionType(section._type)) {
          return null;
        }

        const Component = _sections[section._type];

        if (!Component) {
          console.error(`Component not found for block type: ${section._type}`);
          return null;
        }

        return <Component key={section._key} sectionKey={section._key} docId={docId} />;
      })}
    </div>
  );
}
