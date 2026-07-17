"use client";

import * as React from "react";

type ViewTransitionContextValue = {
  /** True when no route view transition is running. Gate intro animations on this (see `useContentReady`). */
  isViewTransitionComplete: boolean;
  /**
   * Mark a transition as pending before manually calling `document.startViewTransition` (e.g. a
   * theme sweep). Contract: the `startViewTransition` call MUST follow unconditionally; its
   * `finished` handler is the only thing that flips the state back to complete.
   */
  beginViewTransition: () => void;
};

/**
 * Safe default so consumers work outside the provider (Studio, isolated previews):
 * content reads as ready and `beginViewTransition` is a no-op.
 */
const DEFAULT_VALUE: ViewTransitionContextValue = {
  isViewTransitionComplete: true,
  beginViewTransition: () => {},
};

const ViewTransitionContext = React.createContext<ViewTransitionContextValue>(DEFAULT_VALUE);

export function useViewTransition(): ViewTransitionContextValue {
  return React.useContext(ViewTransitionContext);
}

/**
 * Tracks whether a route view transition is in flight so in-page intros can wait for the cross-fade
 * (see `~/features/use-content-ready`). Patches `document.startViewTransition` to observe start/finish;
 * composes with `useViewTransitionLoadingCursor`, which owns `data-vt-loading` and is not duplicated here.
 */
export function ViewTransitionProvider({ children }: { children: React.ReactNode }) {
  const [isViewTransitionComplete, setIsViewTransitionComplete] = React.useState(true);

  const setTransitionPending = React.useCallback(() => {
    setIsViewTransitionComplete((prev) => (prev ? false : prev));
  }, []);

  const setTransitionComplete = React.useCallback(() => {
    setIsViewTransitionComplete((prev) => (prev ? prev : true));
  }, []);

  // Pending is set ONLY by the `startViewTransition` patch below (completed by its `finished`
  // handler); navigations that never start a transition must not gate content, so no pathname tracking.

  // bfcache restore skips the transition machinery entirely; never leave the page gated.
  React.useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        setTransitionComplete();
      }
    };

    window.addEventListener("pageshow", onPageShow);

    return () => {
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [setTransitionComplete]);

  React.useEffect(() => {
    if (!("startViewTransition" in document)) {
      return;
    }

    const original = document.startViewTransition.bind(document);

    document.startViewTransition = (...args: Parameters<typeof document.startViewTransition>) => {
      setTransitionPending();

      const transition = original(...args);

      void transition.finished.finally(() => {
        setTransitionComplete();
      });

      return transition;
    };

    return () => {
      document.startViewTransition = original;
    };
  }, [setTransitionComplete, setTransitionPending]);

  const beginViewTransition = React.useCallback(() => {
    if (!("startViewTransition" in document)) {
      return;
    }

    setTransitionPending();
  }, [setTransitionPending]);

  const value = React.useMemo(
    () => ({ isViewTransitionComplete, beginViewTransition }),
    [isViewTransitionComplete, beginViewTransition]
  );

  return <ViewTransitionContext.Provider value={value}>{children}</ViewTransitionContext.Provider>;
}
