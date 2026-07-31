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

type Tile = {
  key: string;
  slide: HomeShowcaseSlide;
  h: number; // desktop tile height, vh
  dy: number; // desktop vertical drift, vh
  w: number; // mobile tile width, %
  side: "start" | "center" | "end"; // mobile horizontal alignment
};

type Batch = { id: number; tiles: Tile[] };

/** One reshuffle happens per batch, so a batch is the "every 36 images" unit on desktop. */
const BATCH = 36;
const MOBILE_COUNT = 18;
const MAX_BATCHES = 6; // bound the DOM on an endless desktop scroll (~216 tiles)
const EDGE_PX = 1600; // grow the strip this far before reaching either end

const H_TIERS = [30, 44, 58, 72];
const W_TIERS = [66, 76, 86, 94];
const MAX_DRIFT = 7;
const SIDES = ["start", "center", "end"] as const;

const useIsoLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)] as T;
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j] as T, out[i] as T];
  }
  return out;
}

/** Deterministic first batch for SSR / first paint (no Math.random → no hydration mismatch). */
function seedBatch(pool: HomeShowcaseSlide[], count: number): Batch {
  const tiles = pool.slice(0, count).map((slide, i) => ({
    key: `seed:${slide.key}:${i}`,
    slide,
    h: 52,
    dy: 0,
    w: 86,
    side: "center" as const,
  }));
  return { id: 0, tiles };
}

// Module-level so batch ids stay unique even across a Strict Mode dev remount (which resets refs);
// a per-instance ref could mint the same id twice and collide React keys.
let batchSeq = 0;

/** A reshuffled batch: new random selection (subset of the pool), order and per-tile sizes. */
function randomBatch(pool: HomeShowcaseSlide[], count: number): Batch {
  batchSeq += 1;
  const id = batchSeq;
  const chosen = shuffle(pool).slice(0, Math.min(count, pool.length));
  const tiles = chosen.map((slide, i) => ({
    key: `${id}:${slide.key}:${i}`,
    slide,
    h: pick(H_TIERS),
    dy: Math.round((Math.random() * 2 - 1) * MAX_DRIFT),
    w: pick(W_TIERS),
    side: pick(SIDES),
  }));
  return { id, tiles };
}

export function HomeShowcaseScroll({ slides }: { slides: HomeShowcaseSlide[] }) {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const batchEls = React.useRef(new Map<number, HTMLDivElement>());
  const pendingPrune = React.useRef(0);
  const pendingPrependId = React.useRef<number | null>(null);
  const rafPending = React.useRef(false);
  const didInitScroll = React.useRef(false);

  const [batches, setBatches] = React.useState<Batch[]>(() => [seedBatch(slides, Math.min(BATCH, slides.length))]);
  // Mirror of `batches` so append/prune can compute the next array without a functional updater
  // (updaters are double-invoked under Strict Mode, which would double our id/scroll side effects).
  const batchesRef = React.useRef(batches);
  const commitBatches = React.useCallback((next: Batch[]) => {
    batchesRef.current = next;
    setBatches(next);
  }, []);

  const [canHover, setCanHover] = React.useState(true);
  const [activeKey, setActiveKey] = React.useState<string | null>(null);

  // On mount: detect pointer type, then reshuffle. Desktop gets two batches (runway for the endless
  // scroll); touch gets a single finite, vertical selection.
  React.useEffect(() => {
    const hover = window.matchMedia("(hover: hover)").matches;
    setCanHover(hover);
    commitBatches(
      hover
        ? [randomBatch(slides, BATCH), randomBatch(slides, BATCH), randomBatch(slides, BATCH)]
        : [randomBatch(slides, MOBILE_COUNT)]
    );
  }, [slides, commitBatches]);

  const drag = React.useRef({ active: false, moved: false, startX: 0, startLeft: 0 });

  // Reaching the right end: add a batch on the right, prune the (off-screen) leftmost.
  const appendBatch = React.useCallback(() => {
    const track = trackRef.current;
    let next = [...batchesRef.current, randomBatch(slides, BATCH)];
    // Prune from the front to bound the DOM, but never mid-drag (it would jump the grab).
    if (next.length > MAX_BATCHES && track && !drag.current.active) {
      const removed = next[0] as Batch;
      const el = batchEls.current.get(removed.id);
      const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
      pendingPrune.current += (el?.offsetWidth ?? 0) + gap;
      next = next.slice(1);
    }
    commitBatches(next);
  }, [slides, commitBatches]);

  // Reaching the left end: add a batch on the left (compensated so nothing jumps), prune the right.
  const prependBatch = React.useCallback(() => {
    const batch = randomBatch(slides, BATCH);
    let next = [batch, ...batchesRef.current];
    if (next.length > MAX_BATCHES && !drag.current.active) {
      next = next.slice(0, MAX_BATCHES); // drop from the (off-screen) right
    }
    pendingPrependId.current = batch.id;
    commitBatches(next);
  }, [slides, commitBatches]);

  // Keep the viewport visually stable when the strip grows: a right-append that pruned the left
  // pulls scrollLeft back; a left-prepend pushes it forward by the newly added batch's width.
  useIsoLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) {
      return;
    }
    if (pendingPrune.current) {
      track.scrollLeft -= pendingPrune.current;
      pendingPrune.current = 0;
    }
    if (pendingPrependId.current != null) {
      const el = batchEls.current.get(pendingPrependId.current);
      if (el) {
        const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
        track.scrollLeft += el.offsetWidth + gap;
      }
      pendingPrependId.current = null;
    }
  }, [batches]);

  // Desktop: start one full batch in (left runway for the endless left-scroll) with the first
  // visible image half off the left edge, so it's obvious the strip scrolls both ways.
  useIsoLayoutEffect(() => {
    if (didInitScroll.current || !canHover) {
      return;
    }
    const track = trackRef.current;
    const wraps = track?.querySelectorAll<HTMLElement>(".home-showcase_batch");
    if (track && wraps && wraps.length >= 2) {
      const firstVisibleTile = wraps[1]?.querySelector<HTMLElement>(".home-showcase_tile");
      if (firstVisibleTile) {
        const tileRect = firstVisibleTile.getBoundingClientRect();
        const contentX = tileRect.left - track.getBoundingClientRect().left + track.scrollLeft;
        track.scrollLeft = contentX + tileRect.width * 0.5;
        didInitScroll.current = true;
      }
    }
  }, [canHover, batches]);

  const onScroll = React.useCallback(() => {
    if (!canHover || rafPending.current) {
      return;
    }
    rafPending.current = true;
    requestAnimationFrame(() => {
      rafPending.current = false;
      const track = trackRef.current;
      if (!track) {
        return;
      }
      if (track.scrollLeft + track.clientWidth >= track.scrollWidth - EDGE_PX) {
        appendBatch();
      } else if (track.scrollLeft <= EDGE_PX) {
        prependBatch();
      }
    });
  }, [canHover, appendBatch, prependBatch]);

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
      onScroll={onScroll}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
    >
      {batches.map((batch) => (
        <div
          key={batch.id}
          className="home-showcase_batch"
          ref={(el) => {
            if (el) {
              batchEls.current.set(batch.id, el);
            } else {
              batchEls.current.delete(batch.id);
            }
          }}
        >
          {batch.tiles.map((tile) => {
            const isActive = activeKey === tile.key;
            return (
              <Link
                key={tile.key}
                href={`/project/${tile.slide.slug}`}
                role="listitem"
                className="home-showcase_tile"
                data-active={isActive ? "true" : undefined}
                style={
                  {
                    "--h": `${tile.h}vh`,
                    "--dy": `${tile.dy}vh`,
                    "--w": `${tile.w}%`,
                    "--ratio": tile.slide.aspectRatio ?? 1,
                    "--side": tile.side,
                  } as React.CSSProperties
                }
                onClick={(e) => onTileClick(e, tile.key)}
              >
                <div className="home-showcase_media">
                  <KaijoImage image={tile.slide.image} className="home-showcase_image" sizes="(max-width: 767px) 90vw, 44vh" />
                </div>
                <div className="home-showcase_caption">
                  <span className="home-showcase_meta">
                    <span className="home-showcase_project">{tile.slide.project}</span>
                    {tile.slide.type && <span className="home-showcase_type">{tile.slide.type}</span>}
                    {tile.slide.year && <span className="home-showcase_year">{tile.slide.year}</span>}
                  </span>
                  <span className="home-showcase_go" aria-hidden="true">
                    View project ↗
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ))}
    </div>
  );
}
