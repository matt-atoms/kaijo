/** Formats a Sanity date (YYYY-MM-DD) as the Webflow CMS did: "July 2023". */
export function formatProjectDate(date: string | null | undefined) {
  if (!date) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${date}T00:00:00Z`)
  );
}
