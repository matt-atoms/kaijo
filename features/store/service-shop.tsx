"use client";

import * as React from "react";
import { useCart } from "./cart-context";

export type ServiceShopItem = { name: string; price: number; note?: string | null };

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * The buyable grid on the hidden service-shop page: set-price workshops/services plus an optional
 * custom-amount card (the buyer types an agreed price). Everything flows into the same cart as books
 * — `kind: "workshop"` so it shows without a cover — and through the same checkout.
 */
export function ServiceShop({
  items,
  customEnabled,
  customLabel,
  customNote,
}: {
  items: ServiceShopItem[];
  customEnabled?: boolean;
  customLabel?: string | null;
  customNote?: string | null;
}) {
  const { add } = useCart();
  const [amount, setAmount] = React.useState("");

  const customAmount = Number.parseInt(amount, 10);
  const customValid = Number.isFinite(customAmount) && customAmount > 0;
  const label = customLabel || "Custom / other service";

  return (
    <div className="service-shop">
      {items.map((item) => {
        const key = slugify(item.name);
        return (
          <div key={key} className="service-shop_item">
            <div className="service-shop_item-head">
              <span className="service-shop_item-name">{item.name}</span>
              <span className="service-shop_item-price">€{item.price}</span>
            </div>
            {item.note && <p className="service-shop_item-note">{item.note}</p>}
            <button
              type="button"
              className="service-shop_add"
              onClick={() =>
                add({
                  id: `service:${key}`,
                  kind: "workshop",
                  bookId: `service:${key}`,
                  slug: key,
                  title: item.name,
                  variantName: item.note || "Workshop & services",
                  price: item.price,
                })
              }
            >
              Add to cart
            </button>
          </div>
        );
      })}

      {customEnabled && (
        <div className="service-shop_item service-shop_item--custom">
          <div className="service-shop_item-head">
            <span className="service-shop_item-name">{label}</span>
          </div>
          {customNote && <p className="service-shop_item-note">{customNote}</p>}
          <div className="service-shop_custom-row">
            <span className="service-shop_custom-euro" aria-hidden="true">
              €
            </span>
            <input
              type="number"
              min="1"
              inputMode="numeric"
              className="service-shop_custom-input"
              placeholder="Amount"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              aria-label="Custom amount in euros"
            />
          </div>
          <button
            type="button"
            className="service-shop_add"
            disabled={!customValid}
            onClick={() => {
              if (!customValid) {
                return;
              }
              add({
                id: `service:custom:${customAmount}`,
                kind: "workshop",
                bookId: "service:custom",
                slug: "custom",
                title: label,
                variantName: `Custom · €${customAmount}`,
                price: customAmount,
              });
              setAmount("");
            }}
          >
            Add to cart
          </button>
        </div>
      )}
    </div>
  );
}
