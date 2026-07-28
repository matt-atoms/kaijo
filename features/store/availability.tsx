/** Shared availability label (used on the Books overview and book pages). */

export const AVAILABILITY_LABELS: Record<string, string> = {
  available: "Available",
  limited: "Limited copies available",
  soldOut: "Sold out",
};

/** Roll several variant availabilities up to a single book-level status. */
export function overallAvailability(statuses: (string | null | undefined)[]): string | null {
  if (statuses.some((s) => s === "available")) {
    return "available";
  }
  if (statuses.some((s) => s === "limited")) {
    return "limited";
  }
  if (statuses.some(Boolean)) {
    return "soldOut";
  }
  return null;
}

export function AvailabilityLabel({ status }: { status?: string | null }) {
  const label = status ? AVAILABILITY_LABELS[status] : null;
  if (!label) {
    return null;
  }
  return (
    <span className="availability" data-status={status}>
      <span className="availability_dot" aria-hidden="true" />
      {label}
    </span>
  );
}
