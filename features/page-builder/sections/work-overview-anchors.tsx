"use client";

import * as React from "react";
import { cx } from "~/features/style/utils";

type Anchor = { id: string; label: string };

/**
 * Sticky, centred section nav for the /work page. Underlines the section currently in view via an
 * IntersectionObserver whose trigger band sits near the top third of the viewport, so the active
 * tab updates as you scroll (Projects first, then Commissions).
 */
export function WorkAnchors({ anchors }: { anchors: Anchor[] }) {
  const [active, setActive] = React.useState(anchors[0]?.id);

  React.useEffect(() => {
    const els = anchors.map((a) => document.getElementById(a.id)).filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        }
      },
      { rootMargin: "-30% 0px -65% 0px" }
    );
    for (const el of els) {
      observer.observe(el);
    }
    return () => observer.disconnect();
  }, [anchors]);

  return (
    <nav className="work-anchors" aria-label="Work sections">
      {anchors.map((anchor) => (
        <a
          key={anchor.id}
          href={`#${anchor.id}`}
          className={cx("work-anchor", active === anchor.id && "is-active")}
          aria-current={active === anchor.id ? "true" : undefined}
        >
          {anchor.label}
        </a>
      ))}
    </nav>
  );
}
