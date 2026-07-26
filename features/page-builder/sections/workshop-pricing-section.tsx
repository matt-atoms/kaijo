import { defineQuery } from "next-sanity";
import { sanityFetch } from "~/features/sanity/client";
import type { WorkshopPricingSectionQResult } from "~/sanity/types";

const WorkshopPricingSectionQ =
  defineQuery(`*[_id == $docId][0].pageBuilder.sectionsArray[_type == "workshopPricingSectionField" && _key == $sectionKey][0]{
    "content": sectionContent{
      heading,
      lead,
      tiers[]{ "key": _key, title, price, description },
      note
    }
}`);

export async function WorkshopPricingSection({ docId, sectionKey }: { docId: string; sectionKey: string }) {
  const section = await sanityFetch<WorkshopPricingSectionQResult>({
    query: WorkshopPricingSectionQ,
    params: { docId, sectionKey },
    options: { next: { tags: [`doc:${docId}`] } },
  });

  const content = section?.content;

  if (!content?.tiers?.length) {
    return null;
  }

  return (
    <div className="section_workshop-pricing section-padding-top">
      <div className="container">
        <div className="workshop-pricing_head">
          {content.heading && (
            <h2 data-scramble="scroll" className="section_title">
              {content.heading}
            </h2>
          )}
          {content.lead && <p className="workshop-pricing_lead">{content.lead}</p>}
        </div>
        <div className="workshop-pricing_grid">
          {content.tiers.map((tier) => (
            <div key={tier.key} className="workshop-pricing_tier">
              <span className="workshop-pricing_tier-price">{tier.price || "On request"}</span>
              <span className="workshop-pricing_tier-title">{tier.title}</span>
              {tier.description && <p className="workshop-pricing_tier-desc">{tier.description}</p>}
            </div>
          ))}
        </div>
        {content.note && <p className="workshop-pricing_note">{content.note}</p>}
      </div>
    </div>
  );
}
