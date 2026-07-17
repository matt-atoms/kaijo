"use client";

import gsap from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { usePathname } from "next/navigation";
import * as React from "react";

gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin, SplitText);

/**
 * Ports the site's Slater "Scramble Reveal" script: text elements tagged with
 * `data-scramble="load" | "scroll"` (and hover variants) scramble-reveal into place.
 * Re-runs on route changes; GSAP context + listener cleanup on unmount.
 */
export function ScrambleReveal() {
  const pathname = usePathname();

  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname re-triggers the reveal after route changes remount the page DOM.
  React.useEffect(() => {
    const cleanups: Array<() => void> = [];

    const ctx = gsap.context(() => {
      // Reveal on load
      for (const target of document.querySelectorAll('[data-scramble="load"]')) {
        const split = new SplitText(target, {
          type: "words, chars",
          wordsClass: "word",
          charsClass: "char",
        });

        gsap.to(split.words, {
          duration: 1.2,
          stagger: 0.01,
          scrambleText: {
            text: "{original}",
            chars: "upperCase",
            speed: 0.85,
          },
          onComplete: () => split.revert(),
        });
      }

      // Reveal on scroll
      for (const target of document.querySelectorAll('[data-scramble="scroll"]')) {
        const isAlternative = target.hasAttribute("data-scramble-alt");

        const split = new SplitText(target, {
          type: "words, chars",
          wordsClass: "word",
          charsClass: "char",
        });

        gsap.to(split.words, {
          duration: 2,
          stagger: 0.015,
          scrambleText: {
            text: "{original}",
            chars: isAlternative ? "▯|" : "upperCase",
            speed: 0.95,
          },
          scrollTrigger: {
            trigger: target,
            start: "top bottom",
            once: true,
          },
          onComplete: () => split.revert(),
        });
      }

      // Scramble on hover
      for (const target of document.querySelectorAll('[data-scramble-hover="link"]')) {
        const textEl = target.querySelector('[data-scramble-hover="target"]');

        if (!textEl) {
          continue;
        }

        const originalText = textEl.textContent ?? "";
        const customHoverText = textEl.getAttribute("data-scramble-text");

        new SplitText(textEl, {
          type: "words, chars",
          wordsClass: "word",
          charsClass: "char",
        });

        const onEnter = () => {
          gsap.to(textEl, {
            duration: 1,
            scrambleText: {
              text: customHoverText ? customHoverText : originalText,
              chars: "◊▯∆|",
            },
          });
        };

        const onLeave = () => {
          gsap.to(textEl, {
            duration: 0.6,
            scrambleText: {
              text: originalText,
              speed: 2,
              chars: "◊▯∆",
            },
          });
        };

        target.addEventListener("mouseenter", onEnter);
        target.addEventListener("mouseleave", onLeave);
        cleanups.push(() => {
          target.removeEventListener("mouseenter", onEnter);
          target.removeEventListener("mouseleave", onLeave);
        });
      }
    });

    return () => {
      for (const cleanup of cleanups) {
        cleanup();
      }
      ctx.revert();
    };
  }, [pathname]);

  return null;
}
