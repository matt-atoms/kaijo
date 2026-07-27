"use client";

import * as React from "react";
import { KaijoImage } from "~/features/kaijo/kaijo-image";
import type { ImageFragmentResult } from "~/features/sanity/media/fragment";

/** How many slides either side of the centre are mounted/visible. */
const WINDOW = 2;

export function PrintsCarousel({ images, label }: { images: ImageFragmentResult[]; label: string }) {
  const [active, setActive] = React.useState(0);
  const dragX = React.useRef<number | null>(null);
  const n = images.length;

  /** Signed shortest distance from active to i (wraps for a seamless loop). */
  const offsetOf = React.useCallback(
    (i: number) => {
      let d = i - active;
      if (d > n / 2) {
        d -= n;
      }
      if (d < -n / 2) {
        d += n;
      }
      return d;
    },
    [active, n]
  );

  const go = React.useCallback((dir: number) => setActive((a) => (a + dir + n) % n), [n]);

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      go(1);
    }
  }

  function onPointerDown(event: React.PointerEvent) {
    dragX.current = event.clientX;
  }
  function onPointerUp(event: React.PointerEvent) {
    if (dragX.current === null) {
      return;
    }
    const dx = event.clientX - dragX.current;
    dragX.current = null;
    if (Math.abs(dx) > 40) {
      go(dx < 0 ? 1 : -1);
    }
  }

  return (
    // biome-ignore lint/a11y/useSemanticElements: a labelled group with arrow-key control is the right pattern here.
    <div className="prints-carousel" role="group" aria-roledescription="carousel" aria-label={label} onKeyDown={onKeyDown}>
      <div
        className="prints-carousel_stage"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          dragX.current = null;
        }}
      >
        {images.map((image, i) => {
          const off = offsetOf(i);
          if (Math.abs(off) > WINDOW) {
            return null;
          }
          const isActive = off === 0;
          return (
            <button
              type="button"
              // biome-ignore lint/suspicious/noArrayIndexKey: slide identity is its stable position in the series.
              key={i}
              className="prints-slide"
              data-pos={Math.abs(off)}
              style={{ "--off": off } as React.CSSProperties}
              tabIndex={isActive ? 0 : -1}
              aria-hidden={!isActive}
              aria-label={isActive ? `${label} — print ${i + 1} of ${n}` : `Go to print ${i + 1}`}
              onClick={() => setActive(i)}
            >
              <span className="prints-frame">
                <span className="prints-mat">
                  <KaijoImage
                    image={image}
                    className="prints-photo"
                    sizes="(max-width: 767px) 80vw, 34vw"
                    loading={isActive ? "eager" : "lazy"}
                  />
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="prints-carousel_controls">
        <button type="button" className="prints-nav" aria-label="Previous print" onClick={() => go(-1)}>
          ←
        </button>
        <span className="prints-counter" aria-live="polite">
          {active + 1} / {n}
        </span>
        <button type="button" className="prints-nav" aria-label="Next print" onClick={() => go(1)}>
          →
        </button>
      </div>
    </div>
  );
}
