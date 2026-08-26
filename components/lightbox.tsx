"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { KaijoImage } from "~/features/kaijo/kaijo-image";
import { usePrefersReducedMotion } from "~/features/motion/use-prefers-reduced-motion";
import type { ImageFragmentResult } from "~/features/sanity/media/fragment";
import { getImageSrc } from "~/features/sanity/media/image/utils";

type LightboxContextValue = {
  open: (image: ImageFragmentResult, thumb: HTMLImageElement) => void;
};

const LightboxContext = React.createContext<LightboxContextValue | null>(null);

const EASE = "cubic-bezier(0.22, 0.61, 0.19, 1)";
const DURATION = 360;
const FIT_W = 0.92; // fraction of the viewport the expanded image may fill
const FIT_H = 0.9;

/**
 * Backdrop = the opposite of the current theme's tone: a light fill over dark themes, a dark fill
 * over light ones (per Joep's "white if it was black, black if it was white"). Derived from the live
 * page background's luminance so every accent theme resolves correctly.
 */
function oppositeBackdrop(): string {
  const bg = getComputedStyle(document.body).backgroundColor;
  const parts = bg.match(/\d+(\.\d+)?/g)?.map(Number);
  if (!parts || parts.length < 3) {
    return "#0e0e0e";
  }
  const [r, g, b] = parts as [number, number, number];
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance < 0.5 ? "#f5f5f4" : "#0e0e0e";
}

/** Centre-anchored FLIP delta: the transform that makes `img` sit exactly over `rect`. */
function flipTransform(img: HTMLImageElement, rect: DOMRect): string {
  const box = img.getBoundingClientRect();
  const dx = rect.left + rect.width / 2 - (box.left + box.width / 2);
  const dy = rect.top + rect.height / 2 - (box.top + box.height / 2);
  const scale = box.width > 0 ? rect.width / box.width : 1;
  return `translate(${dx}px, ${dy}px) scale(${scale})`;
}

export function LightboxProvider({ children }: { children: React.ReactNode }) {
  const [image, setImage] = React.useState<ImageFragmentResult | null>(null);
  const [backdrop, setBackdrop] = React.useState("#0e0e0e");
  const [portalReady, setPortalReady] = React.useState(false);
  const thumbRef = React.useRef<HTMLImageElement | null>(null);
  const overlayRef = React.useRef<HTMLDivElement | null>(null);
  const imgRef = React.useRef<HTMLImageElement | null>(null);
  const closingRef = React.useRef(false);
  const reduceMotion = usePrefersReducedMotion();

  React.useEffect(() => setPortalReady(true), []);

  const open = React.useCallback((next: ImageFragmentResult, thumb: HTMLImageElement) => {
    thumbRef.current = thumb;
    closingRef.current = false;
    setBackdrop(oppositeBackdrop());
    setImage(next);
  }, []);

  // Fit-to-screen box, sized from the image's own aspect ratio so it is never cropped.
  const fit = React.useMemo(() => {
    const ratio =
      image?.dimensions?.aspectRatio ??
      (image?.dimensions?.width && image?.dimensions?.height ? image.dimensions.width / image.dimensions.height : 1);
    if (typeof window === "undefined") {
      return { width: 0, height: 0 };
    }
    const maxW = window.innerWidth * FIT_W;
    const maxH = window.innerHeight * FIT_H;
    let width = maxW;
    let height = maxW / ratio;
    if (height > maxH) {
      height = maxH;
      width = maxH * ratio;
    }
    return { width: Math.round(width), height: Math.round(height) };
  }, [image]);

  const close = React.useCallback(() => {
    const overlay = overlayRef.current;
    const img = imgRef.current;
    const thumb = thumbRef.current;
    if (closingRef.current) {
      return;
    }
    if (!overlay || !img) {
      setImage(null);
      return;
    }
    closingRef.current = true;

    let finished = false;
    const finish = () => {
      if (!finished) {
        finished = true;
        setImage(null);
      }
    };

    const rect = thumb?.getBoundingClientRect();
    const animate = !reduceMotion && rect && rect.width > 0;
    if (animate) {
      img.animate([{ transform: "translate(0,0) scale(1)" }, { transform: flipTransform(img, rect) }], {
        duration: DURATION,
        easing: EASE,
      });
    }
    const fadeDuration = reduceMotion ? 0 : animate ? DURATION : 180;
    overlay.animate([{ opacity: 1 }, { opacity: 0 }], { duration: fadeDuration, easing: "ease" }).finished.then(finish, finish);
    // Fallback: unmount even if the tab is hidden (Web Animations stalls its finished promise there).
    setTimeout(finish, fadeDuration + 80);
  }, [reduceMotion]);

  // FLIP the expanded image out of the thumbnail on open.
  React.useLayoutEffect(() => {
    const img = imgRef.current;
    const thumb = thumbRef.current;
    if (!image || !img || !thumb) {
      return;
    }
    const rect = thumb.getBoundingClientRect();
    if (reduceMotion || rect.width === 0) {
      return;
    }
    img.animate([{ transform: flipTransform(img, rect) }, { transform: "translate(0,0) scale(1)" }], {
      duration: DURATION,
      easing: EASE,
    });
    const overlay = overlayRef.current;
    overlay?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: DURATION, easing: "ease" });
  }, [image, reduceMotion]);

  // Escape closes; lock body scroll while open.
  React.useEffect(() => {
    if (!image) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
      }
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [image, close]);

  // Upgrade to a high-resolution source once open (the thumbnail's srcset tops out well below a
  // full-screen size). The fixed fit box means the swap causes no layout shift.
  const hiResSrc = image ? getImageSrc(image, { width: 2560 }) : undefined;

  return (
    <LightboxContext.Provider value={{ open }}>
      {children}
      {portalReady &&
        image &&
        createPortal(
          // biome-ignore lint/a11y/useKeyWithClickEvents: this dialog closes on Escape (keydown handler above); the click just adds a click-anywhere-to-close affordance.
          <div
            ref={overlayRef}
            className="lightbox"
            data-no-cycle
            role="dialog"
            aria-modal="true"
            aria-label={image.altText ?? "Expanded image"}
            style={{ background: backdrop }}
            onClick={close}
          >
            <img
              ref={imgRef}
              className="lightbox_image"
              src={hiResSrc}
              alt={image.altText ?? ""}
              style={{ width: fit.width, height: fit.height }}
              draggable={false}
            />
          </div>,
          document.body
        )}
    </LightboxContext.Provider>
  );
}

/**
 * An image that expands into the lightbox on click (seamless FLIP zoom). Renders the same `<img>` as
 * KaijoImage inside a button; the click reads the rendered thumbnail for the zoom origin and hands the
 * full image fragment to the overlay. Shared by the project collage/series and the client portfolios.
 */
export function LightboxImage(props: {
  image: ImageFragmentResult | null | undefined;
  className?: string;
  sizes?: string;
  loading?: "lazy" | "eager";
}) {
  const ctx = React.useContext(LightboxContext);
  const { image } = props;

  if (!image?._id) {
    return null;
  }

  return (
    <button
      type="button"
      className="lightbox-thumb"
      aria-label={image.altText ? `Expand image: ${image.altText}` : "Expand image"}
      onClick={(e) => {
        const img = e.currentTarget.querySelector("img");
        if (img) {
          ctx?.open(image, img);
        }
      }}
    >
      <KaijoImage image={image} className={props.className} sizes={props.sizes} loading={props.loading} />
    </button>
  );
}
