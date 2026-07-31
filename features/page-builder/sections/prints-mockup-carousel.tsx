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
/** Number of procedural wall-mockup scenes; the centre print is shown in a random one on each move. */
const SCENES = 3;

/** Pad a per-project print number as 01, 02, … */
function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export function PrintsMockupCarousel({ slides, sizes }: { slides: PrintSlide[]; sizes: string[] }) {
  const [active, setActive] = React.useState(0);
  // Deterministic first paint (scene 0), then randomise the room on every move so people see the
  // work hung many different ways.
  const [scene, setScene] = React.useState(0);
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

  const shuffleScene = React.useCallback(() => {
    // Pick a different scene than the current one so the change is always visible.
    setScene((s) => (s + 1 + Math.floor(Math.random() * (SCENES - 1))) % SCENES);
  }, []);

  const go = React.useCallback(
    (dir: number) => {
      setActive((a) => (a + dir + n) % n);
      shuffleScene();
    },
    [n, shuffleScene]
  );

  const jumpTo = React.useCallback(
    (i: number) => {
      setActive(i);
      shuffleScene();
    },
    [shuffleScene]
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

  return (
    <div className="psc-wrap">
      {/* biome-ignore lint/a11y/useSemanticElements: a labelled group with arrow-key control is the right pattern here. */}
      <div className="psc" role="group" aria-roledescription="carousel" aria-label="Prints" onKeyDown={onKeyDown}>
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
                  <span className="psc-mockup" data-scene={scene}>
                    <span className="psc-mockup_room" aria-hidden="true" />
                    <span className="psc-mockup_frame">
                      <span className="psc-mockup_mat">
                        <KaijoImage
                          image={slide.image}
                          className="psc-mockup_photo"
                          sizes="(max-width: 767px) 70vw, 30vw"
                          loading="eager"
                        />
                      </span>
                    </span>
                  </span>
                ) : (
                  <span className="psc-plain">
                    <KaijoImage
                      image={slide.image}
                      className="psc-plain_photo"
                      sizes="(max-width: 767px) 40vw, 18vw"
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
          <span className="psc-counter" aria-live="polite">
            {active + 1} / {n}
          </span>
          <button type="button" className="psc-nav" aria-label="Next print" onClick={() => go(1)}>
            →
          </button>
        </div>
      </div>

      {current && (
        <div className="psc_meta">
          <div className="psc_meta-line">
            <span className="psc_meta-project">{current.project}</span>
            <span className="psc_meta-number">{pad(current.number)}</span>
            {current.title && <span className="psc_meta-title">{current.title}</span>}
          </div>
          <PrintInquiryForm
            key={current.key}
            reference={`${current.project} · ${pad(current.number)}${current.title ? ` · ${current.title}` : ""}`}
            sizes={sizes}
          />
        </div>
      )}
    </div>
  );
}
