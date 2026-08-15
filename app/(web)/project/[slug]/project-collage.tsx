import type { ImageFragmentResult } from "~/features/sanity/media/fragment";
import { cx } from "~/features/style/utils";
import { LightboxImage } from "./lightbox";

export type CollageImage = {
  image: ImageFragmentResult | null;
  aspectRatio: number | null;
};

type Tier = "col" | "inset" | "mid" | "wide";

/**
 * The base rhythm for non-feature images: mostly plain column width, with a periodic "inset" (a
 * narrower, side-hugging scale). Deterministic per position so the layout never flashes between the
 * server and client render. Feature tiers (wide/mid) are chosen from image shape, not position.
 */
const PATTERN: Tier[] = ["col", "inset", "col", "col", "inset", "col", "inset", "col"];

// Landscape thresholds for promoting an image to a full-bleed / two-thirds feature.
const WIDE_ASPECT = 1.6;
const MID_ASPECT = 1.3;
// Minimum plain images between features, so they punctuate rather than dominate.
const FEATURE_SPACING = 2;

/**
 * The project's "Best" images as a full-width, flowing collage. Uses CSS multi-column masonry so
 * images sit beside each other WITHOUT lining up on shared top/bottom edges, at their own natural
 * aspect ratios (never cropped). Size variation is content-aware: wide landscapes become full-bleed
 * or two-thirds features (throttled so they punctuate), while everything else flows in the columns
 * at plain or inset scale — so portrait-heavy and landscape-heavy series both stay dynamic. Every
 * image expands in the lightbox on click.
 */
export function ProjectCollage({ images }: { images: CollageImage[] }) {
  const items = images.filter((item) => item.image?._id);
  if (items.length === 0) {
    return null;
  }

  let sinceFeature = FEATURE_SPACING; // allow a feature early
  let offsetCount = 0;

  return (
    <div className="project-collage">
      {items.map((item, index) => {
        const aspect = item.aspectRatio ?? 1;

        // A wide landscape becomes a feature — but only if we're not right after another one.
        let tier: Tier;
        if (aspect >= MID_ASPECT && sinceFeature >= FEATURE_SPACING) {
          tier = aspect >= WIDE_ASPECT ? "wide" : "mid";
          sinceFeature = 0;
        } else {
          tier = PATTERN[index % PATTERN.length] ?? "col";
          sinceFeature++;
        }

        // Inset + mid features alternate which side they hug, for a looser, less centred rhythm.
        const offset = tier === "inset" || tier === "mid";
        const side = offset ? (offsetCount++ % 2 === 0 ? "is-left" : "is-right") : null;

        const sizes =
          tier === "wide"
            ? "(max-width: 767px) 100vw, 92vw"
            : tier === "mid"
              ? "(max-width: 767px) 100vw, 60vw"
              : "(max-width: 767px) 100vw, (max-width: 991px) 40vw, 24vw";

        return (
          <figure
            // biome-ignore lint/suspicious/noArrayIndexKey: stable order; asset ids can repeat if an image is reused across slots.
            key={`${item.image?._id}-${index}`}
            className={cx(
              "project-collage_item",
              tier === "wide" && "is-wide",
              tier === "mid" && "is-mid",
              tier === "inset" && "is-inset",
              side
            )}
          >
            <LightboxImage image={item.image} sizes={sizes} />
          </figure>
        );
      })}
    </div>
  );
}
