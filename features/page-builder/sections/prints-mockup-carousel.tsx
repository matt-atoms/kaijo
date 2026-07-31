"use client";

import * as React from "react";
import { KaijoImage } from "~/features/kaijo/kaijo-image";
import type { ImageFragmentResult } from "~/features/sanity/media/fragment";
import { PrintInquiryForm } from "./print-inquiry-form";

export type PrintSlide = {
  key: string;
  project: string;
  slug: string;
  number: number;
  title: string | null;
  image: ImageFragmentResult;
};

/** How many slides either side of the centre are mounted/visible. */
const WINDOW = 2;

/**
 * Real photographic room mockups (license-free, Unsplash). The print is composited into the frame's
 * opening (percentages measured off each photo) with a thin white mat, mirroring the anthracite
 * frame + small white border the prints actually ship in. A random room is picked on every move.
 */
const MOCKUPS = [
  // `spread` sets how far the bare side prints sit from centre — tuned per mockup so the overlap
  // stays consistent despite the very different frame widths (tall room vs wide cafe).
  { src: "/mockups/frame-room.jpg", art: { top: 21.5, left: 43, width: 43.5, height: 40 }, spread: "clamp(85px, 12vw, 140px)" },
  { src: "/mockups/frame-cafe.jpg", art: { top: 5, left: 8.5, width: 78, height: 70 }, spread: "clamp(160px, 22vw, 280px)" },
] as const;

/** Pad a per-project print number as 01, 02, … */
function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export function PrintsMockupCarousel({ slides, sizes }: { slides: PrintSlide[]; sizes: string[] }) {
  const [active, setActive] = React.useState(0);
  // Deterministic first paint (room 0), then a random room on every move.
  const [room, setRoom] = React.useState(0);
  const dragX = React.useRef<number | null>(null);
  const n = slides.length;

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

  const shuffleRoom = React.useCallback(() => {
    setRoom((r) => (r + 1 + Math.floor(Math.random() * (MOCKUPS.length - 1))) % MOCKUPS.length);
  }, []);

  const go = React.useCallback(
    (dir: number) => {
      setActive((a) => (a + dir + n) % n);
      shuffleRoom();
    },
    [n, shuffleRoom]
  );

  const jumpTo = React.useCallback(
    (i: number) => {
      setActive(i);
      shuffleRoom();
    },
    [shuffleRoom]
  );

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

  const current = slides[active];
  const mockup = MOCKUPS[room] ?? MOCKUPS[0];

  return (
    <div className="psc-wrap">
      {/* biome-ignore lint/a11y/useSemanticElements: a labelled group with arrow-key control is the right pattern here. */}
      <div
        className="psc"
        role="group"
        aria-roledescription="carousel"
        aria-label="Prints"
        onKeyDown={onKeyDown}
        style={{ "--spread": mockup.spread } as React.CSSProperties}
      >
        <div
          className="psc_stage"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => {
            dragX.current = null;
          }}
        >
          {slides.map((slide, i) => {
            const off = offsetOf(i);
            if (Math.abs(off) > WINDOW) {
              return null;
            }
            const isActive = off === 0;
            return (
              <button
                type="button"
                key={slide.key}
                className="psc-slide"
                data-pos={Math.abs(off)}
                style={{ "--off": off } as React.CSSProperties}
                tabIndex={isActive ? 0 : -1}
                aria-hidden={!isActive}
                aria-label={
                  isActive ? `${slide.project} — print ${pad(slide.number)}` : `Go to ${slide.project} print ${pad(slide.number)}`
                }
                onClick={() => jumpTo(i)}
              >
                {isActive ? (
                  <span className="psc-mockup" key={mockup.src}>
                    {/* biome-ignore lint/performance/noImgElement: static local mockup, not a Sanity asset. */}
                    <img className="psc-mockup_bg" src={mockup.src} alt="" />
                    <span
                      className="psc-mockup_art"
                      style={{
                        top: `${mockup.art.top}%`,
                        left: `${mockup.art.left}%`,
                        width: `${mockup.art.width}%`,
                        height: `${mockup.art.height}%`,
                      }}
                    >
                      <KaijoImage
                        image={slide.image}
                        className="psc-mockup_photo"
                        sizes="(max-width: 767px) 60vw, 26vw"
                        loading="eager"
                      />
                    </span>
                  </span>
                ) : (
                  <span className="psc-plain">
                    <KaijoImage
                      image={slide.image}
                      className="psc-plain_photo"
                      sizes="(max-width: 767px) 34vw, 15vw"
                      loading="lazy"
                    />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="psc_controls">
          <button type="button" className="psc-nav" aria-label="Previous print" onClick={() => go(-1)}>
            ←
          </button>
          {current && (
            <span className="psc_meta" aria-live="polite">
              <span className="psc_meta-project">{current.project}</span>
              <span className="psc_meta-number">{pad(current.number)}</span>
              {current.title && <span className="psc_meta-title">{current.title}</span>}
            </span>
          )}
          <button type="button" className="psc-nav" aria-label="Next print" onClick={() => go(1)}>
            →
          </button>
        </div>
      </div>

      {current && (
        <PrintInquiryForm
          key={current.key}
          reference={`${current.project} · ${pad(current.number)}${current.title ? ` · ${current.title}` : ""}`}
          sizes={sizes}
        />
      )}
    </div>
  );
}
