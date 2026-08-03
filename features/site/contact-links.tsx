import { defineQuery } from "next-sanity";
import { sanityFetch } from "~/features/sanity/client";
import { cx } from "~/features/style/utils";
import type { ContactLinksQResult } from "~/sanity/types";

const ContactLinksQ = defineQuery(`*[_id == "site"][0]{ email, instagram }`);

/** Build a full Instagram URL + display handle from either an @handle or a URL. */
function instagram(value: string | null | undefined) {
  if (!value) {
    return null;
  }
  const handle = value
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/^@/, "")
    .replace(/\/$/, "");
  return { url: value.startsWith("http") ? value : `https://instagram.com/${handle}`, label: `@${handle}` };
}

/**
 * Email + Instagram, pulled once from the Site document so the same details render identically on
 * the home hero and the info page. Reuses the `.about-contact_*` styles.
 */
export async function ContactLinks({ className }: { className?: string }) {
  const site = await sanityFetch<ContactLinksQResult>({
    query: ContactLinksQ,
    options: { next: { tags: ["doc:site"] } },
  });

  const email = site?.email;
  const ig = instagram(site?.instagram);

  if (!email && !ig) {
    return null;
  }

  return (
    <div className={cx("about-contact_details", className)}>
      {email && (
        <a href={`mailto:${email}`} className="about-contact_link">
          {email}
        </a>
      )}
      {email && ig && (
        <span className="about-contact_sep" aria-hidden="true">
          /
        </span>
      )}
      {ig && (
        <a href={ig.url} target="_blank" rel="noopener noreferrer" className="about-contact_link">
          {ig.label}
        </a>
      )}
    </div>
  );
}
