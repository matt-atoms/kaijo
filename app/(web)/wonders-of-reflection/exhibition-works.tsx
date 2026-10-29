"use client";

import * as React from "react";
import { useCart } from "~/features/store/cart-context";
import { EDITION, PRICE_SET, PRICE_SINGLE, PRICE_VOUCHER, type ReflectionWork, WORKS } from "./works";

export function ExhibitionWorks() {
  const { add } = useCart();
  const [voucher, setVoucher] = React.useState(false);
  const [active, setActive] = React.useState<ReflectionWork | null>(null);

  const unit = voucher ? PRICE_VOUCHER : PRICE_SINGLE;

  // Lightbox: Escape closes, lock body scroll while open.
  React.useEffect(() => {
    if (!active) {
      return;
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setActive(null);
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [active]);

  const addPrint = (work: ReflectionWork) =>
    add({
      id: `print:wor:${work.id}${voucher ? ":v" : ""}`,
      kind: "print",
      bookId: "print:wor",
      slug: `wonders-of-reflection-${work.id}`,
      title: `Wonders of Reflection — № ${work.id}`,
      variantName: `12 × 18 cm print, edition of ${EDITION}${voucher ? " · with voucher" : ""} · incl. free book`,
      price: unit,
      coverUrl: work.src,
    });

  const addSet = () =>
    add({
      id: "print:wor:set",
      kind: "print",
      bookId: "print:wor",
      slug: "wonders-of-reflection-set",
      title: "Wonders of Reflection — complete set",
      variantName: `All eight prints, edition of ${EDITION} · incl. free book`,
      price: PRICE_SET,
      coverUrl: WORKS[0]?.src,
    });

  return (
    <div className="wor-works">
      <div className="wor-voucher">
        <label className="wor-voucher_toggle">
          <input type="checkbox" checked={voucher} onChange={(e) => setVoucher(e.target.checked)} />
          <span>I have a voucher from the exhibition</span>
        </label>
        <span className="wor-voucher_note">
          {voucher
            ? `€${PRICE_VOUCHER} per print — present your LuminAir receipt on collection.`
            : `€${PRICE_SINGLE} per print, or €${PRICE_VOUCHER} with a voucher from LuminAir.`}
        </span>
      </div>

      <div className="wor-grid">
        {WORKS.map((work) => (
          <figure key={work.id} className="wor-card">
            <button
              type="button"
              className="wor-card_image"
              style={{ aspectRatio: String(work.ratio) }}
              onClick={() => setActive(work)}
              aria-label={`View work № ${work.id}`}
            >
              {/* biome-ignore lint/performance/noImgElement: static public image on a bespoke page, not Sanity-served. */}
              <img src={work.src} alt={`Wonders of Reflection, work № ${work.id}`} loading="lazy" />
            </button>
            <figcaption className="wor-card_foot">
              <span className="wor-card_no">№ {work.id}</span>
              <span className="wor-card_price">€{unit}</span>
            </figcaption>
            <button type="button" className="wor-buy" onClick={() => addPrint(work)}>
              Add to cart
            </button>
          </figure>
        ))}
      </div>

      <div className="wor-set">
        <div className="wor-set_text">
          <span className="wor-set_title">The complete set</span>
          <span className="wor-set_desc">All eight prints, each in an edition of {EDITION}, with a free copy of the book.</span>
        </div>
        <div className="wor-set_buy">
          <span className="wor-set_price">€{PRICE_SET}</span>
          <button type="button" className="wor-buy wor-buy--solid" onClick={addSet}>
            Add set to cart
          </button>
        </div>
      </div>

      {active && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: Escape handled by the keydown listener above; click closes.
        <div
          className="wor-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`Work № ${active.id}`}
          onClick={() => setActive(null)}
        >
          {/* biome-ignore lint/performance/noImgElement: static public image. */}
          <img src={active.src} alt={`Wonders of Reflection, work № ${active.id}`} />
        </div>
      )}
    </div>
  );
}
