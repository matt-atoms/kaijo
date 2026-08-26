import type * as React from "react";
import { LightboxImage } from "~/components/lightbox";
import type { ImageFragmentResult } from "~/features/sanity/media/fragment";
import { cx } from "~/features/style/utils";

export type CollageImage = {
  image: ImageFragmentResult | null;
  aspectRatio: number | null;
};

// Landscape thresholds for promoting an image to a full-bleed / two-thirds feature.
const WIDE_ASPECT = 1.6;
const MID_ASPECT = 1.3;
// Minimum plain images between features (both columns filled), so they punctuate rather than
// dominate — and so a full-width feature never leaves a single lonely image in the other column.
const FEATURE_SPACING = 3;

// Per-image variation for the plain (non-feature) images, so they don't all share a column edge:
// a spread of widths (fraction of the column) and small top offsets that break the horizontal lines.
const WIDTHS = [1, 0.72, 0.9, 0.63, 0.84, 0.78, 0.95, 0.68];
const OFFSETS = [0, 0, 2.6, 0.8, 3.4, 1.4, 0, 2]; // vw

/**
 * Deterministic per-position hash with good avalanche (xmur3 finalizer) — varied-looking but
 * identical on server and client (no flash). A plain multiplicative hash degenerates when bucketed
 * with `% length` for a power-of-two length, so all bits are mixed here.
 */
function hash(n: number): number {
  let x = n + 1;
  x = Math.imul(x ^ (x >>> 16), 2246822507);
  x = Math.imul(x ^ (x >>> 13), 3266489909);
  x ^= x >>> 16;
  return x >>> 0;
}

/**
 * The project's "Best" images as a full-width, flowing collage in two masonry columns. Images keep
 * their own aspect ratios (never cropped); size + placement vary per image — a spread of widths,
 * alternating which side each narrower image hugs, and small vertical offsets — so they FLOW past
 * each other rather than lining up in rigid lanes. Wide landscapes are promoted to full-bleed /
 * two-thirds features (throttled) for rhythm. Every image expands in the lightbox on click.
 */
export function ProjectCollage({ images }: { images: CollageImage[] }) {
  const items = images.filter((item) => item.image?._id);
  if (items.length === 0) {
    return null;
  }

  // Count of plain (non-feature) images since the last feature. A feature is only allowed as the very
  // first image (a clean full-width lead) or once at least FEATURE_SPACING plain images have filled
  // both columns — otherwise a full-width break would strand a single image in the other column.
  let colSinceFeature = 0;
  let narrowCount = 0;

  return (
    <div className="project-collage">
      {items.map((item, index) => {
        const aspect = item.aspectRatio ?? 1;

        // A wide landscape becomes a feature — as a lead (index 0) or once both columns are filled.
        const isFeature = aspect >= MID_ASPECT && (index === 0 || colSinceFeature >= FEATURE_SPACING);
        const tier = isFeature ? (aspect >= WIDE_ASPECT ? "wide" : "mid") : "col";
        if (isFeature) {
          colSinceFeature = 0;
        } else {
          colSinceFeature++;
        }

        // Plain images get a varied width + offset; narrower ones alternate the side they hug.
        const width = tier === "col" ? (WIDTHS[hash(index) % WIDTHS.length] ?? 1) : 1;
        const offset = tier === "col" ? (OFFSETS[hash(index + 101) % OFFSETS.length] ?? 0) : 0;
        const narrow = tier === "mid" || (tier === "col" && width < 1);
        const side = narrow ? (narrowCount++ % 2 === 0 ? "is-left" : "is-right") : null;

        const sizes =
          tier === "wide"
            ? "(max-width: 767px) 100vw, 92vw"
            : tier === "mid"
              ? "(max-width: 767px) 100vw, 60vw"
              : "(max-width: 767px) 100vw, 44vw";

        const style = tier === "col" ? ({ "--w": width, "--mt": `${offset}vw` } as React.CSSProperties) : undefined;

        return (
          <figure
            // biome-ignore lint/suspicious/noArrayIndexKey: stable order; asset ids can repeat if an image is reused across slots.
            key={`${item.image?._id}-${index}`}
            className={cx("project-collage_item", tier === "wide" && "is-wide", tier === "mid" && "is-mid", side)}
            style={style}
          >
            <LightboxImage image={item.image} sizes={sizes} />
          </figure>
        );
      })}
    </div>
  );
}
