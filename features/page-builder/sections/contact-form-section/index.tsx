import { defineQuery, stegaClean } from "next-sanity";
import { ContactForm } from "~/features/page-builder/sections/contact-form-section/contact-form";
import { AnimatedSanityRichText } from "~/features/rich-text";
import { RichTextFragment } from "~/features/rich-text/fragment";
import { sanityFetch } from "~/features/sanity/client";
import type { ContactFormSectionQResult } from "~/sanity/types";

const ContactFormSectionQ =
  defineQuery(`*[_id == $docId][0].pageBuilder.sectionsArray[_type == "contactFormSectionField" && _key == $sectionKey][0]{
    "content": sectionContent{
      headline,
      "text": appRichText[]{${RichTextFragment}},
    },
    "settings": sectionSettings{
      "hash": coalesce(sectionHash.current, _key),
    },
}`);

export async function ContactFormSection({ docId, sectionKey }: { docId: string; sectionKey: string }) {
  const section = await sanityFetch<ContactFormSectionQResult>({
    query: ContactFormSectionQ,
    params: { docId, sectionKey },
    options: { next: { tags: [`doc:${docId}`] } },
  });

  if (!section?.content) {
    return null;
  }

  const { headline, text } = section.content;

  return (
    <div id={stegaClean(section.settings?.hash)} data-page-builder-section="contactFormSection" className="flex flex-col gap-32">
      {headline && <h2 className="whitespace-pre-line text-balance text-headline-10">{headline}</h2>}
      <AnimatedSanityRichText value={text} className="text-body-10" />
      <ContactForm />
    </div>
  );
}
