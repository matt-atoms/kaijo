"use client";

import { usePathname } from "next/navigation";
import * as React from "react";

/**
 * Cross-page hash links — the Work / Store nav sub-links (`/work#projects`, `/store#books`, …) —
 * navigate through the view-transition router, and Next's own `scroll: true` does not land on the
 * target inside a view transition, so the destination just opens at the top. This scrolls the hash
 * target into view after the route changes so those links actually reach their section.
 *
 * Same-page hash clicks keep their pathname (the browser handles them natively) and the very first
 * load is left to the browser's native anchor jump, so this only runs on client route changes.
 */
export function HashScroll() {
  const pathname = usePathname();
  const isFirstRender = React.useRef(true);

  React.useEffect(() => {
    // `pathname` is the intentional trigger: re-run on each client route change, then read the live
    // hash below. (Matches the `void hash` idiom in app-view-transitions.tsx.)
    void pathname;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const id = window.location.hash.slice(1);

    if (!id) {
      return;
    }

    const controller = new AbortController();
    let frame = 0;
    let timer = 0;

    const scrollToTarget = () => {
      // `scroll-margin-top` on the target clears the fixed header.
      document.getElementById(decodeURIComponent(id))?.scrollIntoView({ block: "start" });
    };

    // Re-align across a couple of settle points while the incoming page lays out: fonts reflow line
    // heights and images above the target load and shift it. Each call is idempotent once it's in place.
    document.fonts.ready.then(() => {
      if (controller.signal.aborted) {
        return;
      }

      scrollToTarget();
      frame = requestAnimationFrame(scrollToTarget);
      timer = window.setTimeout(scrollToTarget, 250);
    });

    return () => {
      controller.abort();
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [pathname]);

  return null;
}
