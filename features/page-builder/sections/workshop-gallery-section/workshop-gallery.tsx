"use client";

import * as React from "react";
import { KaijoImage } from "~/features/kaijo/kaijo-image";
import type { ImageFragmentResult } from "~/features/sanity/media/fragment";

export type WorkshopGalleryImage = {
  key: string;
  image: ImageFragmentResult | null;
  aspectRatio: number | null;
};

// A narrow, centred set of heights — the same restrained feel as the work wall.
const H_TIERS = [46, 52, 58];

function heightsFor(n: number, random: boolean): number[] {
  if (!random) {
    return Array.from({ length: n }, () => 52); // deterministic for SSR / first paint
  }
  return Array.from({ length: n }, () => H_TIERS[Math.floor(Math.random() * H_TIERS.length)] as number);
}

/**
 * A finite, side-scrolling wall of example images for a workshop. Mouse-wheel turns into horizontal
 * scroll while the pointer is over the wall (handing back to the page at either end), plus
 * drag-to-scroll on pointer devices — mirroring the work gallery, minus the index and per-image links.
 */
export function WorkshopGallery({ images }: { images: WorkshopGalleryImage[] }) {
  const wallRef = React.useRef<HTMLDivElement>(null);
  const drag = React.useRef({ active: false, startX: 0, startLeft: 0 });
  const [heights, setHeights] = React.useState<number[]>(() => heightsFor(images.length, false));

  // Subtle per-load height variance, applied after mount so SSR and first render match.
  React.useEffect(() => {
    setHeights(heightsFor(images.length, true));
  }, [images.length]);

  // Wheel → horizontal while there's room; hand off to the page at the edges. Native
  // (passive:false) listener so we can preventDefault.
  React.useEffect(() => {
    const wall = wallRef.current;
    if (!wall) {
      return;
    }
    const onWheel = (event: WheelEvent) => {
      const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      const max = wall.scrollWidth - wall.clientWidth;
      if (!delta || max <= 0) {
        return;
      }
      const atStart = wall.scrollLeft <= 0;
      const atEnd = wall.scrollLeft >= max - 1;
      if ((delta > 0 && !atEnd) || (delta < 0 && !atStart)) {
        event.preventDefault();
        wall.scrollLeft += delta;
      }
    };
    wall.addEventListener("wheel", onWheel, { passive: false });
    return () => wall.removeEventListener("wheel", onWheel);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    const wall = wallRef.current;
    if (!wall || e.pointerType === "touch") {
      return;
    }
    drag.current = { active: true, startX: e.clientX, startLeft: wall.scrollLeft };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const wall = wallRef.current;
    if (!wall || !drag.current.active) {
      return;
    }
    wall.scrollLeft = drag.current.startLeft - (e.clientX - drag.current.startX);
  };

  const endDrag = () => {
    drag.current.active = false;
  };

  return (
    <div
      ref={wallRef}
      className="workshop-gallery_wall"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
    >
      {images.map((item, index) => (
        <div
          key={item.key}
          className="workshop-gallery_tile"
          style={{ "--h": `${heights[index]}vh`, "--ratio": item.aspectRatio ?? 1 } as React.CSSProperties}
        >
          <KaijoImage image={item.image} className="workshop-gallery_image" sizes="(max-width: 767px) 80vw, 40vh" />
        </div>
      ))}
    </div>
  );
}
