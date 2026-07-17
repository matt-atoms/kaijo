"use client";

import { stegaClean } from "@sanity/client/stega";
import gsap from "gsap";
import * as React from "react";

/**
 * Ports the site's Slater "Dynamic Hover" script: a floating label that follows the mouse and
 * shows the `data-cursor` text of the hovered portfolio tile. Visibility is CSS-driven
 * (`body:has([data-cursor]:hover) .cursor { opacity: 1 }` in webflow.css).
 */
export function DynamicCursor() {
  const cursorRef = React.useRef<HTMLDivElement>(null);
  const paragraphRef = React.useRef<HTMLParagraphElement>(null);

  React.useEffect(() => {
    const cursorItem = cursorRef.current;
    const cursorParagraph = paragraphRef.current;

    if (!cursorItem || !cursorParagraph) {
      return;
    }

    // Touch devices get static captions (kaijo-mobile.css) instead of the cursor follower.
    if (!window.matchMedia("(hover: hover)").matches) {
      return;
    }

    const targets = document.querySelectorAll("[data-cursor]");
    const xOffset = 6;
    const yOffset = 140;
    let currentTarget: Element | null = null;
    let lastText = "";

    gsap.set(cursorItem, { xPercent: xOffset, yPercent: yOffset });

    const xTo = gsap.quickTo(cursorItem, "x", { ease: "power3" });
    const yTo = gsap.quickTo(cursorItem, "y", { ease: "power3" });

    const getCursorEdgeThreshold = () => cursorItem.offsetWidth + 16;

    const onMouseMove = (e: MouseEvent) => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const scrollY = window.scrollY;
      const cursorX = e.clientX;
      const cursorY = e.clientY + scrollY;

      let xPercent = xOffset;
      let yPercent = yOffset;

      if (cursorX > windowWidth - getCursorEdgeThreshold()) {
        xPercent = -100;
      }

      if (cursorY > scrollY + windowHeight * 0.9) {
        yPercent = -120;
      }

      if (currentTarget) {
        const newText = stegaClean(currentTarget.getAttribute("data-cursor") ?? "");
        if (newText && newText !== lastText) {
          cursorParagraph.innerHTML = newText;
          lastText = newText;
        }
      }

      gsap.to(cursorItem, {
        xPercent,
        yPercent,
        duration: 0.9,
        ease: "power3",
      });
      xTo(cursorX);
      yTo(cursorY - scrollY);
    };

    const onEnters: Array<{ target: Element; handler: () => void }> = [];

    for (const target of targets) {
      const handler = () => {
        currentTarget = target;
        const newText = stegaClean(target.getAttribute("data-cursor") ?? "");

        if (newText && newText !== lastText) {
          cursorParagraph.innerHTML = newText;
          lastText = newText;
        }
      };

      target.addEventListener("mouseenter", handler);
      onEnters.push({ target, handler });
    }

    window.addEventListener("mousemove", onMouseMove);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      for (const { target, handler } of onEnters) {
        target.removeEventListener("mouseenter", handler);
      }
    };
  }, []);

  return (
    <div ref={cursorRef} className="cursor">
      <p ref={paragraphRef} className="cursor-paragraph">
        Learn more
      </p>
    </div>
  );
}
