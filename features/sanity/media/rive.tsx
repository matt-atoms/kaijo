"use client";

import { useInViewport } from "@mantine/hooks";
import dynamic from "next/dynamic";
import type * as React from "react";
import type { RiveFragmentResult } from "~/features/sanity/media/fragment";
import type { CommonMediaProps } from "~/features/sanity/media/types";
import { createResponsiveRatios, parseAspectRatio } from "~/features/sanity/media/utils";
import { cx } from "~/features/style/utils";

// The Rive runtime is heavy; load it on demand like the Mux/Lottie players so pages without
// Rive media never fetch it.
const RiveCanvas = dynamic(() => import("~/features/sanity/media/rive-canvas").then((m) => m.RiveCanvas), {
  ssr: false,
});

type SanityRiveProps = CommonMediaProps & {
  rive?: RiveFragmentResult | null;
};

/**
 * Mirrors the Lottie layout wrapper so Rive respects shared media sizing/aspect-ratio behavior.
 */
export function SanityRive({
  rive,
  aspectRatio,
  width: widthProp,
  height: heightProp,
  className,
  style,
  loop: loopFromParent,
  autoPlay: autoPlayFromParent,
}: SanityRiveProps) {
  const { ref: viewportRef, inViewport } = useInViewport<HTMLDivElement>();
  const { url, dimensions } = rive ?? {};
  const effectiveWidth = widthProp ?? dimensions?.width;
  const naturalRatio = widthProp && heightProp ? widthProp / heightProp : undefined;
  const dimRatio = dimensions?.aspectRatio;
  const effectiveRatio = naturalRatio ?? aspectRatio ?? dimRatio ?? 16 / 9;
  const responsiveRatio = createResponsiveRatios(effectiveRatio);
  const loop = loopFromParent ?? false;
  const wantsAutoPlay = autoPlayFromParent ?? false;
  // Resource-saving policy: only autoplay while visible.
  const shouldAutoplayInView = inViewport && wantsAutoPlay;

  if (!url) {
    return null;
  }

  const ratioForCss = parseAspectRatio(String(effectiveRatio));
  const wrapperStyles = {
    ...responsiveRatio.styles,
    "--desired-width": heightProp ? "auto" : effectiveWidth != null ? `${effectiveWidth}px` : "auto",
    "--desired-height": heightProp ? `${heightProp}px` : "auto",
    ...style,
  } as React.CSSProperties;

  return (
    <div
      ref={viewportRef}
      style={wrapperStyles}
      className={cx(
        "relative isolate flex h-full min-h-0 w-full min-w-0 max-w-full items-center justify-center overflow-hidden",
        className
      )}
    >
      <div
        className={cx(
          "relative isolate h-(--desired-height,auto) max-h-full min-h-0 w-(--desired-width,auto) min-w-0 max-w-full overflow-hidden",
          responsiveRatio.className
        )}
      >
        <RiveCanvas
          url={url}
          loop={loop}
          shouldAutoplayInView={shouldAutoplayInView}
          className="absolute inset-0 z-1 size-full"
          style={{ aspectRatio: ratioForCss, background: "color-mix(in srgb, currentColor 6%, transparent)" }}
        />
      </div>
    </div>
  );
}
