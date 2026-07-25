import { ImageFragment, type ImageFragmentResult } from "~/features/sanity/media/fragment";

/** Fields needed to render a project tile (homepage hero rows and portfolio grids). */
export const ProjectTileFragment = `
  _id,
  title,
  category,
  type,
  client,
  date,
  "slug": slug.current,
  "gridStyle": coalesce(gridStyle, "normal"),
  thumbnail{${ImageFragment}}
`;

export type ProjectTileResult = {
  _id: string;
  title: string | null;
  category: string | null;
  type: string | null;
  client: string | null;
  date: string | null;
  slug: string | null;
  gridStyle: string;
  thumbnail: ImageFragmentResult | null;
};

/**
 * Work-page tile: brand + year, plus every candidate image (thumbnail + collage slots) with its
 * aspect ratio, so the client tile can pick a random one per load and size to its natural ratio.
 */
export const WorkTileFragment = `
  _id,
  title,
  client,
  date,
  "slug": slug.current,
  "images": select(
    count(overviewImages[defined(asset)]) > 0 => overviewImages[defined(asset)],
    [thumbnail, image1, image2, image3, image4, image5, image6, image7, image8, image9, image10, image11, image12, image13, image14, image15, image16][defined(@.asset)]
  )[]{
    ${ImageFragment}
    "aspectRatio": asset->metadata.dimensions.aspectRatio,
  }`;

export type WorkTileImage = ImageFragmentResult & { aspectRatio: number | null };

export type WorkTileResult = {
  _id: string;
  title: string | null;
  client: string | null;
  date: string | null;
  slug: string | null;
  images: WorkTileImage[];
};
