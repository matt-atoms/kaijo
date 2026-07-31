"use client";

import * as React from "react";

/**
 * Background themes, in cycle order. "green" is the CSS default (no `data-theme` attribute →
 * limegreen), so applying it clears the attribute. White is the initial default (set by the
 * bootstrap script in shared-web-layout). Clicking empty space advances to the next theme.
 */
const THEMES = ["white", "red", "blue", "dark", "green"] as const;
const STORAGE_KEY = "kaijo-theme";

// Elements that should NOT cycle the theme when clicked (interactive controls + media/content).
const NON_EMPTY =
  "a, button, input, textarea, select, label, summary, img, video, [role='button'], [contenteditable='true'], [data-no-cycle]";

function currentTheme(): (typeof THEMES)[number] {
  const t = document.documentElement.getAttribute("data-theme");
  return (THEMES as readonly string[]).includes(t ?? "") ? (t as (typeof THEMES)[number]) : "green";
}

function applyTheme(name: (typeof THEMES)[number]) {
  const root = document.documentElement;
  if (name === "green") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", name);
  }
  try {
    localStorage.setItem(STORAGE_KEY, name);
  } catch {
    // Private mode / storage disabled — theming still works for the session.
  }
}

export function ThemeCursor() {
  const dotRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const dot = dotRef.current;
    if (!dot) {
      return;
    }

    const root = document.documentElement;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    let raf = 0;
    let downX = 0;
    let downY = 0;
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let x = targetX;
    let y = targetY;

    const onPointerDown = (e: PointerEvent) => {
      downX = e.clientX;
      downY = e.clientY;
    };

    // A genuine click on empty space (not a drag, not an interactive/content element) cycles theme.
    const onClick = (e: MouseEvent) => {
      if (Math.hypot(e.clientX - downX, e.clientY - downY) > 8) {
        return;
      }
      const target = e.target as Element | null;
      if (target?.closest(NON_EMPTY)) {
        return;
      }
      const idx = THEMES.indexOf(currentTheme());
      applyTheme(THEMES[(idx + 1) % THEMES.length] ?? "white");
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("click", onClick);

    // Following dot: fine-pointer devices only (touch gets the tap-to-cycle behaviour, no follower).
    const onMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      dot.style.opacity = "1";
    };

    const tick = () => {
      x += (targetX - x) * 0.2;
      y += (targetY - y) * 0.2;
      dot.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };

    if (finePointer) {
      root.classList.add("has-theme-cursor");
      window.addEventListener("mousemove", onMouseMove);
      raf = requestAnimationFrame(tick);
    }

    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("click", onClick);
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(raf);
      root.classList.remove("has-theme-cursor");
    };
  }, []);

  return <div ref={dotRef} className="theme-cursor" aria-hidden="true" />;
}
