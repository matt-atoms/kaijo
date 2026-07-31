"use client";

import * as React from "react";
import { Link } from "~/components/link";
import { KaijoImage } from "~/features/kaijo/kaijo-image";
import type { ImageFragmentResult } from "~/features/sanity/media/fragment";

export type HomeShowcaseSlide = {
  key: string;
  image: ImageFragmentResult | null;
  aspectRatio: number | null;
  project: string;
  type: string | null;
  year: string | null;
  slug: string;
};

/** Per-slide scatter, recomputed on every load: desktop uses height + vertical drift, mobile width + side. */
type Layout = {
  order: number[];
  h: number[]; // desktop tile height, vh
  dy: number[]; // desktop vertical drift, vh
  w: number[]; // mobile tile width, %
  side: ("start" | "center" | "end")[]; // mobile horizontal alignment
};

const H_TIERS = [36, 44, 52, 60];
const W_TIERS = [66, 76, 86, 94];
const MAX_DRIFT = 6;
const SIDES = ["start", "center", "end"] as const;

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)] as T;
}

/** A deterministic identity layout for SSR / first paint; the mount effect swaps in the random one. */
function identityLayout(n: number): Layout {
  return {
    order: Array.from({ length: n }, (_, i) => i),
    h: Array.from({ length: n }, () => 62),
    dy: Array.from({ length: n }, () => 0),
    w: Array.from({ length: n }, () => 86),
    side: Array.from({ length: n }, () => "center"),
  };
}

function randomLayout(n: number): Layout {
  const order = Array.from({ length: n }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j] as number, order[i] as number];
  }
  return {
    order,
    h: Array.from({ length: n }, () => pick(H_TIERS)),
    dy: Array.from({ length: n }, () => Math.round((Math.random() * 2 - 1) * MAX_DRIFT)),
    w: Array.from({ length: n }, () => pick(W_TIERS)),
    side: Array.from({ length: n }, () => pick(SIDES)),
  };
}

export function HomeShowcaseScroll({ slides }: { slides: HomeShowcaseSlide[] }) {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [layout, setLayout] = React.useState<Layout>(() => identityLayout(slides.length));
  const [canHover, setCanHover] = React.useState(true);
  const [activeKey, setActiveKey] = React.useState<string | null>(null);

  // Reshuffle sizes/positions/order once per load, and detect pointer type (touch → two-tap).
  React.useEffect(() => {
    setLayout(randomLayout(slides.length));
    setCanHover(window.matchMedia("(hover: hover)").matches);
  }, [slides.length]);

  // Drag-to-scroll for the horizontal (desktop) track — the primary affordance for mouse users. A
  // real drag cancels the click that would otherwise open the project.
  const drag = React.useRef({ active: false, moved: false, startX: 0, startLeft: 0 });

  const onPointerDown = (e: React.PointerEvent) => {
    const track = trackRef.current;
    if (!track || e.pointerType === "touch") {
      return;
    }
    drag.current = { active: true, moved: false, startX: e.clientX, startLeft: track.scrollLeft };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const track = trackRef.current;
    if (!track || !drag.current.active) {
      return;
    }
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 4) {
      drag.current.moved = true;
    }
    track.scrollLeft = drag.current.startLeft - dx;
  };

  const endDrag = () => {
    drag.current.active = false;
  };

  const onTileClick = (e: React.MouseEvent, key: string) => {
    // A drag that scrolled the track shouldn't also open a project.
    if (drag.current.moved) {
      e.preventDefault();
      drag.current.moved = false;
      return;
    }
    // Touch: first tap reveals the label + arrow, second tap navigates.
    if (!canHover && activeKey !== key) {
      e.preventDefault();
      setActiveKey(key);
    }
  };

  return (
    // biome-ignore lint/a11y/useSemanticElements: horizontal scroller of links, not a listbox.
    <div
      ref={trackRef}
      role="list"
      className="home-showcase_track"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
    >
      {layout.order.map((slideIndex, position) => {
        const slide = slides[slideIndex];
        if (!slide) {
          return null;
        }
        const ratio = slide.aspectRatio ?? 1;
        const isActive = activeKey === slide.key;
        return (
          <Link
            key={slide.key}
            href={`/project/${slide.slug}`}
            role="listitem"
            className="home-showcase_tile"
            data-active={isActive ? "true" : undefined}
            style={
              {
                "--h": `${layout.h[position]}vh`,
                "--dy": `${layout.dy[position]}vh`,
                "--w": `${layout.w[position]}%`,
                "--ratio": ratio,
                "--side": layout.side[position],
              } as React.CSSProperties
            }
            onClick={(e) => onTileClick(e, slide.key)}
          >
            <div className="home-showcase_media">
              <KaijoImage image={slide.image} className="home-showcase_image" sizes="(max-width: 767px) 90vw, 44vh" />
            </div>
            <div className="home-showcase_caption">
              <span className="home-showcase_project">{slide.project}</span>
              <span className="home-showcase_sub">
                {slide.type && <span className="home-showcase_type">{slide.type}</span>}
                {slide.year && <span className="home-showcase_year">{slide.year}</span>}
              </span>
              <span className="home-showcase_go" aria-hidden="true">
                View project ↗
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
