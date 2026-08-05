"use client";

import * as React from "react";
import { DEVELOP_CLASS, setDevelop } from "~/features/site/develop-mode";

/**
 * The reveal loupe for "Develop" mode. `.develop-lens` is a full-viewport overlay whose
 * `backdrop-filter: invert(1)` is masked to a soft circle at the cursor — over the already-inverted
 * (negative) project images it double-inverts back to the true colours. `.develop-ring` is the thin
 * outline that reads as the cursor. Both follow the pointer; CSS gates their visibility on
 * `html.develop`. Rendered only on the project page, so leaving it clears the mode.
 */
export function DevelopLens() {
  const lensRef = React.useRef<HTMLDivElement>(null);
  const ringRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const lens = lensRef.current;
    const ring = ringRef.current;
    if (!lens || !ring) {
      return;
    }

    let raf = 0;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;

    const onMove = (event: MouseEvent) => {
      x = event.clientX;
      y = event.clientY;
      if (!raf) {
        raf = requestAnimationFrame(paint);
      }
    };

    const paint = () => {
      raf = 0;
      lens.style.setProperty("--cx", `${x}px`);
      lens.style.setProperty("--cy", `${y}px`);
      ring.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    };

    paint();
    window.addEventListener("mousemove", onMove);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      // Leaving the project page turns the easter egg off (it only exists here).
      if (document.documentElement.classList.contains(DEVELOP_CLASS)) {
        setDevelop(false);
      }
    };
  }, []);

  return (
    <>
      <div ref={lensRef} className="develop-lens" aria-hidden="true" />
      <div ref={ringRef} className="develop-ring" aria-hidden="true" />
    </>
  );
}
