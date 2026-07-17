import type { ImageFragmentResult } from "~/features/sanity/media/fragment";
import { getImageSrc, getImageSrcSet } from "~/features/sanity/media/image/utils";

/**
 * Plain `<img>` renderer for Sanity images, mirroring the Webflow output (src + srcset + sizes
 * with the original class names) instead of the boilerplate's aspect-ratio-wrapped media component.
 */
export function KaijoImage(props: {
  image: ImageFragmentResult | null | undefined;
  className?: string;
  sizes?: string;
  loading?: "lazy" | "eager";
}) {
  const { image, className, sizes, loading = "lazy" } = props;

  if (!image?._id) {
    return null;
  }

  return (
    <img
      src={getImageSrc(image)}
      srcSet={getImageSrcSet(image)}
      sizes={sizes}
      loading={loading}
      alt={image.altText ?? ""}
      className={className}
    />
  );
}
