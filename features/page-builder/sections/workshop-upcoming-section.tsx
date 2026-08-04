import { defineQuery } from "next-sanity";
import { sanityFetch } from "~/features/sanity/client";
import { SanityLink } from "~/features/sanity/link";
import { LinkFragment } from "~/features/sanity/link/fragment";
import type { WorkshopUpcomingSectionQResult } from "~/sanity/types";

const WorkshopUpcomingSectionQ =
  defineQuery(`*[_id == $docId][0].pageBuilder.sectionsArray[_type == "workshopUpcomingSectionField" && _key == $sectionKey][0]{
    "content": sectionContent{
      heading,
      lead,
      events[]{
        "key": _key,
        title,
        date,
        time,
        location,
        language,
        availability,
        price,
        deadline,
        "link": appLink{${LinkFragment}}
      },
      emptyMessage,
      emptyCtaLabel,
      "emptyCtaLink": emptyCtaLink{${LinkFragment}}
    }
}`);

export async function WorkshopUpcomingSection({ docId, sectionKey }: { docId: string; sectionKey: string }) {
  const section = await sanityFetch<WorkshopUpcomingSectionQResult>({
    query: WorkshopUpcomingSectionQ,
    params: { docId, sectionKey },
    options: { next: { tags: [`doc:${docId}`] } },
  });

  const content = section?.content;

  if (!content) {
    return null;
  }

  const events = content.events ?? [];

  return (
    <div className="section_workshop-upcoming section-padding-top">
      <div className="container">
        <div className="workshop-upcoming_head">
          {content.heading && (
            <h2 data-scramble="scroll" className="section-eyebrow">
              {content.heading}
            </h2>
          )}
          {content.lead && <p className="workshop-upcoming_lead">{content.lead}</p>}
        </div>
        {events.length > 0 ? (
          <div className="workshop-upcoming_grid">
            {events.map((event) => (
              <div key={event.key} className="workshop-upcoming_event">
                <div className="workshop-upcoming_event-head">
                  {event.title &&
                    (event.link?.href ? (
                      <SanityLink link={event.link} className="workshop-upcoming_title workshop-upcoming_title--link">
                        {event.title}
                      </SanityLink>
                    ) : (
                      <span className="workshop-upcoming_title">{event.title}</span>
                    ))}
                  <span className="workshop-upcoming_date">{event.date}</span>
                  {event.location && <span className="workshop-upcoming_location">{event.location}</span>}
                </div>
                <dl className="workshop-upcoming_meta">
                  {event.time && (
                    <div className="workshop-upcoming_meta-row">
                      <dt>Time</dt>
                      <dd>{event.time}</dd>
                    </div>
                  )}
                  {event.language && (
                    <div className="workshop-upcoming_meta-row">
                      <dt>Language</dt>
                      <dd>{event.language}</dd>
                    </div>
                  )}
                  {event.availability && (
                    <div className="workshop-upcoming_meta-row">
                      <dt>Places</dt>
                      <dd>{event.availability}</dd>
                    </div>
                  )}
                  {event.deadline && (
                    <div className="workshop-upcoming_meta-row">
                      <dt>Book by</dt>
                      <dd>{event.deadline}</dd>
                    </div>
                  )}
                </dl>
                <div className="workshop-upcoming_event-foot">
                  {event.price && <span className="workshop-upcoming_price">{event.price}</span>}
                  {event.link?.href && (
                    <SanityLink link={event.link} className="workshop-upcoming_book">
                      {event.link.text || "View details & book"} →
                    </SanityLink>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="workshop-upcoming_empty">
            {content.emptyMessage && <p className="workshop-upcoming_empty-text">{content.emptyMessage}</p>}
            {content.emptyCtaLink?.href && (
              <SanityLink link={content.emptyCtaLink} className="workshop-upcoming_empty-cta">
                {content.emptyCtaLabel || content.emptyCtaLink.text || "Get in touch"} →
              </SanityLink>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
