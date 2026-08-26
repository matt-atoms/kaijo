import type * as React from "react";
import { LightboxImage, LightboxProvider } from "~/components/lightbox";
import type { ImageFragmentResult } from "~/features/sanity/media/fragment";
import { cx } from "~/features/style/utils";

export type LookbookImage = {
  image: ImageFragmentResult | null;
  aspectRatio: number | null;
};

// Aspect thresholds: wide landscapes lead a full-bleed spread; narrow images pair or triple up.
const WIDE_ASPECT = 1.45;
const NARROW_ASPECT = 1.2;

type SpreadType = "full" | "duo" | "offset" | "triptych" | "single";
type Spread = { type: SpreadType; images: LookbookImage[] };

/**
 * Group the (≤40) images into varied editorial spreads deterministically from their aspect ratios —
 * a wide shot leads a full-bleed page; runs of narrow shots pair into diptychs / offset pairs, and
 * occasionally a triptych, with lone shots centred. No image is ever cropped: each keeps its own
 * aspect ratio and is sized to a shared max-height within its spread.
 */
function planSpreads(items: LookbookImage[]): Spread[] {
  const spreads: Spread[] = [];
  const isNarrow = (it: LookbookImage) => (it.aspectRatio ?? 1) < NARROW_ASPECT;
  const isWide = (it: LookbookImage) => (it.aspectRatio ?? 1) >= WIDE_ASPECT;

  let i = 0;
  let n = 0; // spread counter, drives the alternation of duo/offset and the throttled triptych
  while (i < items.length) {
    const a = items[i];
    if (!a) {
      break;
    }
    const b = items[i + 1];
    const c = items[i + 2];

    if (isWide(a)) {
      spreads.push({ type: "full", images: [a] });
      i += 1;
    } else if (b && c && isNarrow(a) && isNarrow(b) && isNarrow(c) && n % 4 === 3) {
      spreads.push({ type: "triptych", images: [a, b, c] });
      i += 3;
    } else if (b && isNarrow(a) && isNarrow(b)) {
      spreads.push({ type: n % 2 === 0 ? "duo" : "offset", images: [a, b] });
      i += 2;
    } else {
      spreads.push({ type: "single", images: [a] });
      i += 1;
    }
    n++;
  }
  return spreads;
}

const SIZES_FULL = "(max-width: 767px) 100vw, 92vw";
const SIZES_SINGLE = "(max-width: 767px) 100vw, 68vw";
const SIZES_PAIR = "(max-width: 767px) 90vw, 46vw";
const SIZES_TRIPTYCH = "(max-width: 767px) 80vw, 31vw";

function sizesFor(type: SpreadType): string {
  if (type === "full") {
    return SIZES_FULL;
  }
  if (type === "single") {
    return SIZES_SINGLE;
  }
  if (type === "triptych") {
    return SIZES_TRIPTYCH;
  }
  return SIZES_PAIR;
}

/**
 * A scrollable client lookbook: a title/intro, then the images laid into varied full-bleed spreads.
 * Click any image to expand it (shared FLIP lightbox). Distraction-free — the page renders without
 * the site header/footer.
 */
export function PortfolioLookbook({ title, intro, images }: { title: string; intro: string | null; images: LookbookImage[] }) {
  const items = images.filter((it) => it.image?._id);
  const spreads = planSpreads(items);

  return (
    <LightboxProvider>
      <div className="pf-book">
        <header className="pf-book_head">
          <p className="pf-book_eyebrow">Selected work</p>
          <h1 className="pf-book_title">{title}</h1>
          {intro && <p className="pf-book_intro">{intro}</p>}
        </header>

        {items.length === 0 ? (
          <p className="pf-book_empty">This portfolio has no images yet.</p>
        ) : (
          <div className="pf-book_spreads">
            {spreads.map((spread, si) => {
              const sizes = sizesFor(spread.type);
              return (
                <section
                  // biome-ignore lint/suspicious/noArrayIndexKey: stable order; an asset can repeat across spreads.
                  key={`${spread.type}-${si}-${spread.images[0]?.image?._id}`}
                  className={cx("pf-spread", `pf-spread--${spread.type}`)}
                >
                  {spread.images.map((it, ii) => (
                    <figure
                      // biome-ignore lint/suspicious/noArrayIndexKey: stable order within a spread.
                      key={`${it.image?._id}-${ii}`}
                      className="pf-spread_item"
                      style={{ "--ratio": it.aspectRatio ?? 1 } as React.CSSProperties}
                    >
                      <LightboxImage image={it.image} sizes={sizes} />
                    </figure>
                  ))}
                </section>
              );
            })}
          </div>
        )}

        <footer className="pf-book_foot">
          <p className="pf-book_foot-text">Joep Hijwegen — prepared for {title}</p>
        </footer>
      </div>
    </LightboxProvider>
  );
}
