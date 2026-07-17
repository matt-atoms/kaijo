import { defineQuery, stegaClean } from "next-sanity";
import { AnimatedSanityRichText } from "~/features/rich-text";
import { RichTextFragment } from "~/features/rich-text/fragment";
import { sanityFetch } from "~/features/sanity/client";
import type { TextSectionQResult } from "~/sanity/types";

const TextSectionQ =
  defineQuery(`*[_id == $docId][0].pageBuilder.sectionsArray[_type == "textSectionField" && _key == $sectionKey][0]{
    "content": sectionContent{
      "text": appRichText[]{${RichTextFragment}}
    },
    "settings": sectionSettings{
      "hash": coalesce(sectionHash.current, _key),
    },
}`);

export async function TextSection({ docId, sectionKey }: { docId: string; sectionKey: string }) {
  const section = await sanityFetch<TextSectionQResult>({
    query: TextSectionQ,
    params: {
      docId,
      sectionKey,
    },
    options: {
      next: {
        tags: [`doc:${docId}`],
      },
    },
  });

  if (!section?.content) {
    return null;
  }

  const { text } = section.content;

  return (
    <div id={stegaClean(section.settings?.hash)} data-page-builder-section="textSection">
      <AnimatedSanityRichText value={text} className="text-body-10" />
    </div>
  );
}
