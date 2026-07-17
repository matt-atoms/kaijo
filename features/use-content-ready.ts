"use client";

import * as React from "react";
import { useViewTransition } from "~/features/view-transition/context";

/**
 * Gate for in-page intro animations (e.g. `AnimatedText`): `false` while a route view transition runs,
 * `true` once revealed so content animates in after the cross-fade. Defaults to ready outside a provider.
 *
 * Latched per consumer: only delays the FIRST reveal after mount. A later navigation flips the transition
 * back to pending, but revoking the gate there would cancel running intros and snap visible text away.
 *
 * Extend the condition for a site intro (loader, curtain), e.g. `view.isViewTransitionComplete && isSiteIntroComplete`.
 */
export function useContentReady() {
  const view = useViewTransition();
  const readyOnce = React.useRef(view.isViewTransitionComplete);

  if (view.isViewTransitionComplete) {
    readyOnce.current = true;
  }

  return {
    isComplete: readyOnce.current,
  };
}
