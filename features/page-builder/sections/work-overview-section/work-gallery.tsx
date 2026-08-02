"use client";

import * as React from "react";
import { Link } from "~/components/link";
import { KaijoImage } from "~/features/kaijo/kaijo-image";
import { usePrefersReducedMotion } from "~/features/motion/use-prefers-reduced-motion";
import type { ImageFragmentResult } from "~/features/sanity/media/fragment";

export type WorkGalleryItem = {
  key: string;
  image: ImageFragmentResult | null;
  aspectRatio: number | null;
  project: string;
  type: string | null;
  year: string | null;
  slug: string;
};

// Smaller + tighter than the home wall: a narrow set of heights, centred, no vertical drift.
const H_TIERS = [46, 52, 58];

function heightsFor(n: number, random: boolean): number[] {
  if (!random) {
    return Array.from({ length: n }, () => 52); // deterministic for SSR / first paint
  }
  return Array.from({ length: n }, () => H_TIERS[Math.floor(Math.random() * H_TIERS.length)] as number);
}

/**
 * A finite, side-scrolling wall of one image per project, paired with a left-hand index of names.
 * Hovering a name or an image highlights that image (brighter) and dims the rest; hovering an image
 * also reveals its caption (like the home scroll).
 */
export function WorkGallery({ items }: { items: WorkGalleryItem[] }) {
  const wallRef = React.useRef<HTMLDivElement>(null);
  const drag = React.useRef({ active: false, moved: false, startX: 0, startLeft: 0 });
  const [heights, setHeights] = React.useState<number[]>(() => heightsFor(items.length, false));
  const [active, setActive] = React.useState<string | null>(null);
  const reduceMotion = usePrefersReducedMotion();

  // Subtle per-load height variance, applied after mount so SSR and first render match.
  React.useEffect(() => {
    setHeights(heightsFor(items.length, true));
  }, [items.length]);

  // Bring a tile into view within the wall (used when hovering the left-hand index) so the
  // highlighted image is always visible. Scrolls only the horizontal wall, never the page.
  const scrollToTile = (index: number) => {
    const wall = wallRef.current;
    const tile = wall?.children[index] as HTMLElement | undefined;
    if (!wall || !tile) {
      return;
    }
    const wallRect = wall.getBoundingClientRect();
    const tileRect = tile.getBoundingClientRect();
    const delta = tileRect.left - wallRect.left - (wall.clientWidth - tile.clientWidth) / 2;
    wall.scrollTo({ left: wall.scrollLeft + delta, behavior: reduceMotion ? "auto" : "smooth" });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    const wall = wallRef.current;
    if (!wall || e.pointerType === "touch") {
      return;
    }
    drag.current = { active: true, moved: false, startX: e.clientX, startLeft: wall.scrollLeft };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const wall = wallRef.current;
    if (!wall || !drag.current.active) {
      return;
    }
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 4) {
      drag.current.moved = true;
    }
    wall.scrollLeft = drag.current.startLeft - dx;
  };

  const endDrag = () => {
    drag.current.active = false;
  };

  const onTileClick = (e: React.MouseEvent) => {
    if (drag.current.moved) {
      e.preventDefault();
      drag.current.moved = false;
    }
  };

  return (
    <div className="work-gallery" data-has-active={active ? "true" : undefined} onPointerLeave={() => setActive(null)}>
      <nav className="work-gallery_index" aria-label="Projects">
        {items.map((item, index) => (
          <Link
            key={item.key}
            href={`/project/${item.slug}`}
            className="work-gallery_name"
            data-active={active === item.key ? "true" : undefined}
            onPointerEnter={() => {
              setActive(item.key);
              scrollToTile(index);
            }}
            onFocus={() => {
              setActive(item.key);
              scrollToTile(index);
            }}
            onBlur={() => setActive(null)}
          >
            {item.project}
          </Link>
        ))}
      </nav>
      <div
        ref={wallRef}
        className="work-gallery_wall"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
      >
        {items.map((item, index) => (
          <Link
            key={item.key}
            href={`/project/${item.slug}`}
            className="work-gallery_tile"
            data-active={active === item.key ? "true" : undefined}
            style={{ "--h": `${heights[index]}vh`, "--ratio": item.aspectRatio ?? 1 } as React.CSSProperties}
            onPointerEnter={() => setActive(item.key)}
            onFocus={() => setActive(item.key)}
            onBlur={() => setActive(null)}
            onClick={onTileClick}
          >
            <div className="work-gallery_media">
              <KaijoImage image={item.image} className="work-gallery_image" sizes="(max-width: 767px) 70vw, 30vh" />
            </div>
            <div className="work-gallery_caption">
              <span className="work-gallery_meta">
                <span className="work-gallery_project">{item.project}</span>
                {item.type && <span className="work-gallery_type">{item.type}</span>}
                {item.year && <span className="work-gallery_year">{item.year}</span>}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
