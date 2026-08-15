"use client";

import * as React from "react";

/**
 * Adds `work-route` to <html> while the /work overview is mounted, and removes it on unmount (SPA
 * nav away). Mirrors the `home-route` class: it gates the one-screen "locked panels" CSS in
 * global.css so each group (Projects / Commissions) fills the viewport and the wheel drives the
 * filmstrip sideways. On a hard load the bootstrap script in app/shared-web-layout.tsx sets the
 * class before first paint (no flash); this keeps it in sync across client navigations.
 */
export function WorkRouteLock() {
  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.add("work-route");
    return () => root.classList.remove("work-route");
  }, []);

  return null;
}
