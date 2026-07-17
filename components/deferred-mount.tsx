"use client";

import { useIntersection } from "@mantine/hooks";
import * as React from "react";
import { cx } from "~/features/style/utils";

/**
 * Run `cb` when the main thread next goes idle, capped by `timeout` so it always fires. Returns a
 * cleanup fn. `requestIdleCallback` is missing on Safari before 17.4; there we fall back to a short
 * `setTimeout` so the work still lands after the initial paint / hydration settles rather than on the
 * very next macrotask.
 */
export function onIdle(cb: () => void): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(cb, { timeout: 2000 });
    return () => window.cancelIdleCallback(id);
  }

  const id = window.setTimeout(cb, 200);
  return () => window.clearTimeout(id);
}

export type DeferredMountProps = {
  children: React.ReactNode;
  /** Shown until `children` mounts so the surface stays stable. */
  placeholder?: React.ReactNode;
  className?: string;
  /** Mount once the wrapper scrolls within this margin of the viewport. */
  rootMargin?: string;
  /**
   * Also wait for the main thread to go idle before mounting. Use for above-the-fold work (e.g. a
   * hero canvas) that is in view immediately but should not compete with hydration / LCP.
   */
  idle?: boolean;
  /**
   * Mount immediately, ignoring the viewport gate. Use to warm an expensive subtree ahead of time
   * (e.g. once its shared chunk is cached) so it is ready before it scrolls into view.
   */
  eager?: boolean;
};

/**
 * Defers mounting an expensive client subtree (WebGL canvases, heavy embeds) until it is near the
 * viewport, and optionally until the main thread is idle. This keeps the heavy chunk and its setup
 * cost off the initial-load critical path. Once mounted it stays mounted.
 */
export function DeferredMount({
  children,
  placeholder = null,
  className,
  rootMargin = "400px",
  idle = false,
  eager = false,
}: DeferredMountProps) {
  const { ref, entry } = useIntersection<HTMLDivElement>({ rootMargin });
  const [mounted, setMounted] = React.useState(false);
  const near = entry?.isIntersecting ?? false;

  React.useEffect(() => {
    if (mounted) {
      return;
    }

    if (eager) {
      setMounted(true);
      return;
    }

    if (!near) {
      return;
    }

    if (!idle) {
      setMounted(true);
      return;
    }

    return onIdle(() => setMounted(true));
  }, [mounted, near, idle, eager]);

  return (
    <div ref={ref} className={cx("size-full", className)}>
      {mounted ? children : placeholder}
    </div>
  );
}
