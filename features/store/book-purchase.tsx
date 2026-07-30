"use client";

import * as React from "react";
import { KaijoImage } from "~/features/kaijo/kaijo-image";
import type { ImageFragmentResult } from "~/features/sanity/media/fragment";
import { AvailabilityLabel } from "./availability";
import { useCart } from "./cart-context";

export type PurchaseVariant = {
  key: string;
  name: string;
  price: number;
  availability?: string | null;
  image?: ImageFragmentResult | null;
};

/**
 * Book header + purchase controls. Owns the selected edition so the top-left image swaps to the
 * edition's own photo (book only / with a print / both). `children` is the server-rendered title
 * and fact sheet, sitting above the edition picker.
 */
export function BookPurchase({
  bookId,
  slug,
  title,
  coverUrl,
  coverImage,
  variants,
  children,
}: {
  bookId: string;
  slug: string;
  title: string;
  coverUrl: string;
  coverImage?: ImageFragmentResult | null;
  variants: PurchaseVariant[];
  children?: React.ReactNode;
}) {
  const { add } = useCart();
  const firstAvailable = variants.find((v) => v.availability !== "soldOut") ?? variants[0];
  const [selectedKey, setSelectedKey] = React.useState(firstAvailable?.key);

  const variant = variants.find((v) => v.key === selectedKey) ?? variants[0];

  if (!variant) {
    return null;
  }

  const soldOut = variant.availability === "soldOut";
  const media = variant.image?._id ? variant.image : coverImage;

  return (
    <div className="book-header">
      <div className="book-header_media">
        {media && (
          <KaijoImage image={media} className="book-header_cover" sizes="(max-width: 991px) 100vw, 50vw" loading="eager" />
        )}
      </div>

      <div className="book-header_info">
        {children}

        <div className="book-buy">
          {variants.length > 1 && (
            <div className="book-buy_variants" role="radiogroup" aria-label="Edition">
              {variants.map((v) => (
                <button
                  key={v.key}
                  type="button"
                  className="book-variant"
                  data-active={v.key === selectedKey || undefined}
                  data-soldout={v.availability === "soldOut" || undefined}
                  aria-pressed={v.key === selectedKey}
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
      </div>
    </div>
  );
}
