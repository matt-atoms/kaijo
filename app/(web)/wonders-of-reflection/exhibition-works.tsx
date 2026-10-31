"use client";

import * as React from "react";
import { useCart } from "~/features/store/cart-context";
import { cx } from "~/features/style/utils";
import { EDITION, PRICE_SET, PRICE_SINGLE, type ReflectionWork, WORKS } from "./works";

function WorkCard({ work, onAdd }: { work: ReflectionWork; onAdd: (w: ReflectionWork) => void }) {
  // Desktop reveals the print mockup on hover; touch devices toggle it on tap (no hover).
  const [active, setActive] = React.useState(false);

  return (
    <figure className={cx("wor-card", active && "is-active")}>
      <button
        type="button"
        className="wor-card_frame"
        onClick={() => setActive((a) => !a)}
        aria-label={`${work.cocktail} — preview the print`}
      >
        {/* biome-ignore lint/performance/noImgElement: static public image on a bespoke page. */}
        <img className="wor-card_photo" src={work.src} alt={`${work.cocktail} — ${work.place}`} loading="lazy" />
      </button>
      <figcaption className="wor-card_foot">
        <span className="wor-card_meta">
          <span className="wor-card_title">
            <span className="wor-card_no">{work.id}</span>
            {work.cocktail}
          </span>
          <span className="wor-card_place">{work.place}</span>
        </span>
        <span className="wor-card_buy">
          <span className="wor-card_price">€{PRICE_SINGLE}</span>
          <button type="button" className="wor-buy" onClick={() => onAdd(work)}>
            Add to cart
          </button>
        </span>
      </figcaption>
    </figure>
  );
}

export function ExhibitionWorks() {
  const { add } = useCart();

  const addPrint = (work: ReflectionWork) =>
    add({
      id: `print:wor:${work.id}`,
      kind: "print",
      bookId: "print:wor",
      slug: `wonders-of-reflection-${work.id}`,
      title: `Wonders of Reflection — ${work.cocktail}`,
      variantName: `16.7 × 25 cm print, edition of ${EDITION} · incl. book`,
      price: PRICE_SINGLE,
      coverUrl: work.src,
    });

  const addSet = () =>
    add({
      id: "print:wor:set",
      kind: "print",
      bookId: "print:wor",
      slug: "wonders-of-reflection-set",
      title: "Wonders of Reflection — complete set",
      variantName: `All eight prints, edition of ${EDITION} · incl. book`,
      price: PRICE_SET,
      coverUrl: WORKS[0]?.src,
    });

  return (
    <div className="wor-works">
      <div className="wor-grid">
        {WORKS.map((work) => (
          <WorkCard key={work.id} work={work} onAdd={addPrint} />
        ))}
      </div>

      <div className="wor-set">
        <div className="wor-set_text">
          <span className="wor-set_title">The complete set</span>
          <span className="wor-set_desc">
            All eight prints, each in an edition of {EDITION}, with a copy of Controlled Coincidence.
          </span>
        </div>
        <div className="wor-set_buy">
          <span className="wor-set_price">€{PRICE_SET}</span>
          <button type="button" className="wor-buy wor-buy--solid" onClick={addSet}>
            Add set to cart
          </button>
        </div>
      </div>
    </div>
  );
}
