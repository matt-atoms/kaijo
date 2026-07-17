"use client";

import gsap from "gsap";
import * as React from "react";

/**
 * Ports the site's Slater "Hero Hover" script: scales a hero project tile's image wrapper
 * up on hover, back down on leave.
 */
export function HeroHover() {
  React.useEffect(() => {
    const cleanups: Array<() => void> = [];

    for (const item of document.querySelectorAll(".project_item")) {
      const imageWrapper = item.querySelector(".project_image-wrapper");

      if (!imageWrapper) {
        continue;
      }

      const onEnter = () => {
        item.classList.add("active");
        imageWrapper.classList.add("active");

        gsap.to(imageWrapper, {
          scale: 1.1,
          duration: 0.5,
          ease: "power2.out",
        });
      };

      const onLeave = (event: Event) => {
        const related = (event as MouseEvent).relatedTarget as Node | null;

        if (!related || !item.contains(related)) {
          item.classList.remove("active");
          imageWrapper.classList.remove("active");

          gsap.to(imageWrapper, {
            scale: 1,
            duration: 0.5,
            ease: "power2.out",
          });
        }
      };

      item.addEventListener("mouseenter", onEnter);
      item.addEventListener("mouseleave", onLeave);
      cleanups.push(() => {
        item.removeEventListener("mouseenter", onEnter);
        item.removeEventListener("mouseleave", onLeave);
        gsap.killTweensOf(imageWrapper);
      });
    }

    return () => {
      for (const cleanup of cleanups) {
        cleanup();
      }
    };
  }, []);

  return null;
}
