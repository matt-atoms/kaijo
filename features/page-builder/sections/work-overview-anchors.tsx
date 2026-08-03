"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cx } from "~/features/style/utils";

type Anchor = { id: string; label: string };

/**
 * Sticky, centred section nav. Underlines the section currently in view via an IntersectionObserver
 * whose trigger band sits near the top third of the viewport, so the active tab updates as you scroll.
 *
 * `spanMain`: on /work the anchors sit inside the single section and stick across it. The store is
 * three separate sections, so a sticky element there would only travel within the first one. When
 * `spanMain` is set, the nav is portaled into a `display: contents` holder at the top of `<main>` —
 * its sticky containing block becomes `<main>`, so it travels the whole page (all three sections).
 */
export function WorkAnchors({ anchors, spanMain = false }: { anchors: Anchor[]; spanMain?: boolean }) {
  const [active, setActive] = React.useState(anchors[0]?.id);
  const [mount, setMount] = React.useState<HTMLElement | null>(null);

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

  // Portal target: a display:contents holder prepended to <main> so the nav becomes main's first
  // flow child (top of the page) with main as its sticky containing block.
  React.useEffect(() => {
    if (!spanMain) {
      return;
    }
    const main = document.querySelector<HTMLElement>("main.main");
    if (!main) {
      return;
    }
    const holder = document.createElement("div");
    holder.style.display = "contents";
    main.prepend(holder);
    setMount(holder);
    return () => {
      holder.remove();
      setMount(null);
    };
  }, [spanMain]);

  const nav = (
    <nav className={cx("work-anchors", spanMain && "work-anchors--span")} aria-label="Sections">
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

  if (spanMain) {
    return mount ? createPortal(nav, mount) : null;
  }
  return nav;
}
