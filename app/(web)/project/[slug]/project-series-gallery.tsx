import { KaijoImage } from "~/features/kaijo/kaijo-image";
import type { ImageFragmentResult } from "~/features/sanity/media/fragment";

export type SeriesImage = {
  image: ImageFragmentResult | null;
  aspectRatio: number | null;
};

/** Tile height (vh) the side-scroll is constrained to — mirrored in the `.project-series` CSS. */
const TILE_VH = 56;

/**
 * The rest of a project's images (everything not flagged "Best") shown as a horizontal, natively
 * scrolling strip at the foot of the page. Tiles are height-constrained and carry each image's own
 * aspect ratio, so the `sizes` hint is height × ratio (sharp on landscape, no waste on portrait).
 */
export function ProjectSeriesGallery({ images }: { images: SeriesImage[] }) {
  const items = images.filter((i) => i.image?._id);
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="project-series" aria-label="Full series">
      <h2 className="section-eyebrow project-series_head">Full series</h2>
      <div className="project-series_track">
        {items.map((item) => {
          const ratio = item.aspectRatio ?? 1;
          return (
            <div key={item.image?._id} className="project-series_tile" style={{ aspectRatio: `${ratio}` }}>
              <KaijoImage
                image={item.image}
                className="project-series_image"
                sizes={`(max-width: 767px) 80vw, ${Math.round(TILE_VH * ratio)}vh`}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
