"use client";

import * as React from "react";
import { HONEYPOT_FIELD_NAME, MIN_SUBMISSION_TIME, SUBMISSION_TIME_FIELD_NAME } from "~/features/spam-prevention/constants";

export type SpamPreventionOptions = {
  /**
   * Name of the honeypot field to check.
   * @default HONEYPOT_FIELD_NAME
   */
  honeypotField?: string;

  /**
   * Min ms before submit; faster is treated as spam.
   * @default 2000
   */
  honeypotDuration?: number;

  /** Scopes interaction detection to this form; without it, page-wide interactions count. */
  formRef?: React.RefObject<HTMLFormElement | null>;

  /**
   * Enable debug logging to console.
   * @default false
   */
  debug?: boolean;
};

export type SpamCheckResult =
  | { isSpam: false }
  | {
      isSpam: true;
      reason: "too_fast" | "honeypot_filled" | "no_interaction";
      message: string;
    };

export type SpamPreventionResult = {
  /** Check whether a form submission appears to be spam, with reason and user-facing message. */
  checkSpam: (form: HTMLFormElement) => SpamCheckResult;

  /**
   * Get metadata about the form submission for server-side validation.
   */
  getMetadata: () => {
    hasInteraction: boolean;
    fillTime: number;
    startTime: number;
  };

  /**
   * Enhance a manually built FormData (sent via fetch/XHR) with spam prevention metadata.
   * Does NOT work with `<form action={...}>` server actions: React snapshots the form itself,
   * so mutate a hidden `SUBMISSION_TIME_FIELD_NAME` input in `onSubmit` instead (see the example).
   */
  enhanceFormData: (formData: FormData) => FormData;

  /** Reset timing and interaction tracking; call when the form is reset. */
  reset: () => void;
};

/**
 * React hook for spam prevention in forms.
 *
 * Tracks user interactions and form timing to detect spam submissions.
 *
 * With a `<form action={...}>` server action, render a hidden `SUBMISSION_TIME_FIELD_NAME` input
 * and write `getMetadata().fillTime` into it in `onSubmit`, BEFORE React snapshots the form
 * (see `contact-form.tsx`). `enhanceFormData` only works for FormData you build and send yourself.
 *
 * @example
 * ```tsx
 * const { checkSpam, getMetadata } = useSpamPrevention({ formRef });
 *
 * const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
 *   const spamCheck = checkSpam(formRef.current!);
 *
 *   if (spamCheck.isSpam) {
 *     event.preventDefault();
 *     setSpamError(spamCheck.message);
 *     return;
 *   }
 *
 *   submissionTimeRef.current!.value = String(getMetadata().fillTime);
 * };
 * ```
 */
export function useSpamPrevention({
  honeypotField = HONEYPOT_FIELD_NAME,
  honeypotDuration = MIN_SUBMISSION_TIME,
  formRef,
  debug = false,
}: SpamPreventionOptions = {}): SpamPreventionResult {
  const startTime = React.useRef<number>(Date.now());
  const [hasInteraction, setHasInteraction] = React.useState(false);

  React.useEffect(() => {
    const handleInteraction = () => {
      if (debug) {
        console.log("[Spam Prevention] User interaction detected");
      }
      setHasInteraction(true);
    };

    const events: Array<keyof DocumentEventMap> = ["keydown", "mousemove", "touchstart", "click"];
    const target = formRef?.current ?? document;

    if (debug) {
      console.log("[Spam Prevention] Initialized", {
        honeypotField,
        honeypotDuration,
        target: formRef?.current ? "form" : "document",
      });
    }

    for (const event of events) {
      target.addEventListener(event, handleInteraction, { once: true });
    }

    return () => {
      for (const event of events) {
        target.removeEventListener(event, handleInteraction);
      }
    };
  }, [formRef, debug, honeypotField, honeypotDuration]);

  const checkSpam = React.useCallback(
    (form: HTMLFormElement): SpamCheckResult => {
      const fillTime = Date.now() - startTime.current;
      const isTooFast = fillTime < honeypotDuration;

      const honeypotInput = form.querySelector<HTMLInputElement>(`[name="${honeypotField}"]`);
      const hasHoneypotValue = !!honeypotInput?.value?.trim();

      const noInteraction = !hasInteraction;

      if (debug) {
        console.log("[Spam Prevention] Spam check:", {
          fillTime: `${fillTime}ms`,
          isTooFast,
          hasHoneypotValue,
          honeypotValue: honeypotInput?.value || "(empty)",
          noInteraction,
        });
      }

      // Honeypot first: most reliable indicator.
      if (hasHoneypotValue) {
        return {
          isSpam: true,
          reason: "honeypot_filled",
          message: "Invalid submission detected. Please refresh the page and try again.",
        };
      }

      // Timing can false-positive for fast typers.
      if (isTooFast) {
        return {
          isSpam: true,
          reason: "too_fast",
          message: "Please take your time filling out the form. Form submissions are processed after a brief delay.",
        };
      }

      // Interaction can false-positive for screen readers or programmatic fills.
      if (noInteraction) {
        return {
          isSpam: true,
          reason: "no_interaction",
          message: "Please interact with the form fields before submitting. Click or type in the fields to continue.",
        };
      }

      return { isSpam: false };
    },
    [honeypotField, honeypotDuration, hasInteraction, debug]
  );

  const getMetadata = React.useCallback(() => {
    const fillTime = Date.now() - startTime.current;

    return {
      hasInteraction,
      fillTime,
      startTime: startTime.current,
    };
  }, [hasInteraction]);

  const enhanceFormData = React.useCallback(
    (formData: FormData) => {
      const submissionTime = Date.now() - startTime.current;
      formData.append(SUBMISSION_TIME_FIELD_NAME, String(submissionTime));

      if (debug) {
        console.log("[Spam Prevention] Enhanced form data with submission time:", `${submissionTime}ms`);
      }

      return formData;
    },
    [debug]
  );

  const reset = React.useCallback(() => {
    startTime.current = Date.now();
    setHasInteraction(false);

    // The initial listeners were `once: true`, so a reset must attach fresh ones.
    const handleInteraction = () => {
      if (debug) {
        console.log("[Spam Prevention] User interaction detected");
      }
      setHasInteraction(true);
    };

    const events: Array<keyof DocumentEventMap> = ["keydown", "mousemove", "touchstart", "click"];
    const target = formRef?.current ?? document;

    for (const event of events) {
      target.addEventListener(event, handleInteraction, { once: true });
    }

    if (debug) {
      console.log("[Spam Prevention] Reset - timing and interaction tracking restarted");
    }
  }, [formRef, debug]);

  return {
    checkSpam,
    getMetadata,
    enhanceFormData,
    reset,
  };
}
