"use client";

import * as React from "react";
import { AvailabilityLabel } from "./availability";
import { useCart } from "./cart-context";

export type BuyVariant = { key: string; name: string; price: number; availability?: string | null };

export function AddToCart({
  bookId,
  slug,
  title,
  coverUrl,
  variants,
}: {
  bookId: string;
  slug: string;
  title: string;
  coverUrl: string;
  variants: BuyVariant[];
}) {
  const { add } = useCart();
  const firstAvailable = variants.find((v) => v.availability !== "soldOut") ?? variants[0];
  const [selectedKey, setSelectedKey] = React.useState(firstAvailable?.key);

  const variant = variants.find((v) => v.key === selectedKey) ?? variants[0];
  const soldOut = variant?.availability === "soldOut";

  if (!variant) {
    return null;
  }

  return (
    <div className="book-buy">
      {variants.length > 1 && (
        <div className="book-buy_variants" role="radiogroup" aria-label="Edition">
          {variants.map((v) => (
            <button
              key={v.key}
              type="button"
              className="book-variant"
              data-active={v.key === selectedKey || undefined}
              aria-pressed={v.key === selectedKey}
              disabled={v.availability === "soldOut"}
              onClick={() => setSelectedKey(v.key)}
            >
              <span className="book-variant_name">{v.name}</span>
              <span className="book-variant_price">€{v.price}</span>
            </button>
          ))}
        </div>
      )}

      <div className="book-buy_row">
        <span className="book-buy_price">€{variant.price}</span>
        <AvailabilityLabel status={variant.availability} />
      </div>

      <button
        type="button"
        className="book-buy_button"
        disabled={soldOut}
        onClick={() =>
          add({
            id: `${bookId}:${variant.key}`,
            bookId,
            slug,
            title,
            variantName: variant.name,
            price: variant.price,
            coverUrl,
          })
        }
      >
        {soldOut ? "Sold out" : "Add to cart"}
      </button>
    </div>
  );
}
