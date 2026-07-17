"use client";

import { LazyMotion } from "motion/react";
import type * as React from "react";

// Kick the fetch off at module evaluation (early in hydration) instead of first
// render, so first-paint animations start as close to hydration as possible.
const features = import("./motion-features").then((mod) => mod.default);

/**
 * App-wide `LazyMotion` with the `domAnimation` feature bundle (no layout or drag animations in this codebase), loaded
 * async so the renderer stays out of the initial chunks. Components must use
 * `m.*` instead of `motion.*`; `strict` throws if a full `motion.*` component
 * sneaks back in and silently reinflates the bundle.
 */
const loadFeatures = () => features;

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      {children}
    </LazyMotion>
  );
}
