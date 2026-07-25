"use client";

import * as React from "react";
import { Link } from "~/components/link";
import type { WorkTileResult } from "~/features/kaijo/fragments";
import { KaijoImage } from "~/features/kaijo/kaijo-image";

/**
 * A single work-page tile. Shows a random one of the project's images each page load (picked in a
 * mount effect so SSR/hydration stay in sync), sized to that image's natural aspect ratio, with the
 * brand + year beneath.
 */
export function WorkTile({ project }: { project: WorkTileResult }) {
  const images = project.images ?? [];
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    if (images.length > 1) {
      setIndex(Math.floor(Math.random() * images.length));
    }
  }, [images.length]);

  const image = images[index] ?? images[0];

  if (!image) {
    return null;
  }

  const ratio =
    image.aspectRatio ??
    (image.dimensions?.width && image.dimensions?.height ? image.dimensions.width / image.dimensions.height : undefined);
  const year = project.date?.slice(0, 4);

  return (
    <Link href={`/project/${project.slug}`} className="work-tile">
      <div className="work-tile_media" style={{ aspectRatio: ratio ?? undefined }}>
        <KaijoImage image={image} className="work-tile_image" sizes="(max-width: 767px) 90vw, (max-width: 991px) 45vw, 30vw" />
      </div>
      <div className="work-tile_meta">
        {project.client && <span className="work-tile_brand">{project.client}</span>}
        {year && <span className="work-tile_year">{year}</span>}
      </div>
    </Link>
  );
}
