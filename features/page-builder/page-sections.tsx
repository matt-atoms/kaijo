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
  projectHeroSectionField: dynamic(() =>
    import("~/features/page-builder/sections/project-hero-section").then((mod) => mod.ProjectHeroSection)
  ),
  aboutSectionField: dynamic(() => import("~/features/page-builder/sections/about-section").then((mod) => mod.AboutSection)),
  portfolioGridSectionField: dynamic(() =>
    import("~/features/page-builder/sections/portfolio-grid-section").then((mod) => mod.PortfolioGridSection)
  ),
  aboutPreviewSectionField: dynamic(() =>
    import("~/features/page-builder/sections/about-preview-section").then((mod) => mod.AboutPreviewSection)
  ),
  featureLinksSectionField: dynamic(() =>
    import("~/features/page-builder/sections/feature-links-section").then((mod) => mod.FeatureLinksSection)
  ),
  workshopsSectionField: dynamic(() =>
    import("~/features/page-builder/sections/workshops-section").then((mod) => mod.WorkshopsSection)
  ),
  workOverviewSectionField: dynamic(() =>
    import("~/features/page-builder/sections/work-overview-section").then((mod) => mod.WorkOverviewSection)
  ),
  aboutIdentitySectionField: dynamic(() =>
    import("~/features/page-builder/sections/about-identity-section").then((mod) => mod.AboutIdentitySection)
  ),
  aboutTextSectionField: dynamic(() =>
    import("~/features/page-builder/sections/about-text-section").then((mod) => mod.AboutTextSection)
  ),
  aboutCredentialsSectionField: dynamic(() =>
    import("~/features/page-builder/sections/about-credentials-section").then((mod) => mod.AboutCredentialsSection)
  ),
  aboutContactSectionField: dynamic(() =>
    import("~/features/page-builder/sections/about-contact-section").then((mod) => mod.AboutContactSection)
  ),
  workshopIntroSectionField: dynamic(() =>
    import("~/features/page-builder/sections/workshop-intro-section").then((mod) => mod.WorkshopIntroSection)
  ),
  workshopLearnSectionField: dynamic(() =>
    import("~/features/page-builder/sections/workshop-learn-section").then((mod) => mod.WorkshopLearnSection)
  ),
  workshopPricingSectionField: dynamic(() =>
    import("~/features/page-builder/sections/workshop-pricing-section").then((mod) => mod.WorkshopPricingSection)
  ),
  workshopNotesSectionField: dynamic(() =>
    import("~/features/page-builder/sections/workshop-notes-section").then((mod) => mod.WorkshopNotesSection)
  ),
  workshopTestimonialsSectionField: dynamic(() =>
    import("~/features/page-builder/sections/workshop-testimonials-section").then((mod) => mod.WorkshopTestimonialsSection)
  ),
  workshopUpcomingSectionField: dynamic(() =>
    import("~/features/page-builder/sections/workshop-upcoming-section").then((mod) => mod.WorkshopUpcomingSection)
  ),
  printsGallerySectionField: dynamic(() =>
    import("~/features/page-builder/sections/prints-gallery-section").then((mod) => mod.PrintsGallerySection)
  ),
  printsLicensingSectionField: dynamic(() =>
    import("~/features/page-builder/sections/prints-licensing-section").then((mod) => mod.PrintsLicensingSection)
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
    <>
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
    </>
  );
}
