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
