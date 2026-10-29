"use client";

import * as React from "react";

/** Force the dark theme while this standalone exhibition page is mounted; restore on leave. */
export function ExhibitionTheme() {
  React.useLayoutEffect(() => {
    const root = document.documentElement;
    const previous = root.getAttribute("data-theme");
    root.setAttribute("data-theme", "dark");
    return () => {
      if (previous === null) {
        root.removeAttribute("data-theme");
      } else {
        root.setAttribute("data-theme", previous);
      }
    };
  }, []);

  return null;
}
