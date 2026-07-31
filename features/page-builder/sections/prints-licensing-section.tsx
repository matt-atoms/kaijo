import { defineQuery, stegaClean } from "next-sanity";
import { KaijoImage } from "~/features/kaijo/kaijo-image";
import { sanityFetch } from "~/features/sanity/client";
import { SanityLink } from "~/features/sanity/link";
import { LinkFragment } from "~/features/sanity/link/fragment";
import { ImageFragment } from "~/features/sanity/media/fragment";
import type { PrintsLicensingSectionQResult } from "~/sanity/types";

const PrintsLicensingSectionQ =
  defineQuery(`*[_id == $docId][0].pageBuilder.sectionsArray[_type == "printsLicensingSectionField" && _key == $sectionKey][0]{
    "content": sectionContent{
      heading,
      text,
      "link": link{${LinkFragment}},
      images[]{${ImageFragment}}
    },
    "hash": sectionSettings.sectionHash.current
}`);

export async function PrintsLicensingSection({ docId, sectionKey }: { docId: string; sectionKey: string }) {
  const section = await sanityFetch<PrintsLicensingSectionQResult>({
    query: PrintsLicensingSectionQ,
    params: { docId, sectionKey },
    options: { next: { tags: [`doc:${docId}`] } },
  });

  const content = section?.content;

  if (!content) {
    return null;
  }

  const link = content.link;
  const images = (content.images ?? []).filter((image) => image?._id);

  return (
    <div
      id={stegaClean(section?.hash) || undefined}
      className="section_prints-licensing section-padding-top section-padding-bottom"
    >
      <div className="container">
        <div className="prints-licensing_inner">
          <div className="prints-licensing_text">
            {content.heading && (
              <h2 data-scramble="scroll" className="section_title">
                {content.heading}
              </h2>
            )}
            {content.text && <p className="prints-licensing_body">{content.text}</p>}
            {link?.href && (
              <SanityLink link={link} className="prints-licensing_cta">
                {link.text || "View my collection at Stills"} →
              </SanityLink>
            )}
          </div>
          {images.length > 0 && link?.href && (
            <div className="prints-licensing_thumbs">
              {images.map((image) => (
                <SanityLink key={image._id} link={link} className="prints-licensing_thumb">
                  <KaijoImage image={image} className="prints-licensing_thumb-img" sizes="(max-width: 767px) 40vw, 16vw" />
                </SanityLink>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
