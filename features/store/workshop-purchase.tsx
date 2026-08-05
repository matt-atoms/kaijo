"use client";

import { useCart } from "./cart-context";

/**
 * "Book" action on a workshop detail page: adds the workshop to the same cart as books (opening the
 * cart), so it flows through the same checkout. Shown only when the pricing section has a `purchase`
 * set in the CMS; otherwise the section stays enquiry-only.
 */
export function WorkshopPurchase({
  id,
  name,
  session,
  price,
}: {
  id: string;
  name: string;
  session?: string | null;
  price: number;
}) {
  const { add } = useCart();

  return (
    <div className="workshop-purchase">
      <button
        type="button"
        className="workshop-purchase_button"
        onClick={() =>
          add({
            id: `workshop:${id}`,
            kind: "workshop",
            bookId: id,
            slug: id,
            title: name,
            variantName: session ?? "Workshop",
            price,
          })
        }
      >
        <span className="workshop-purchase_label">Book & pay</span>
        <span className="workshop-purchase_price">€{price}</span>
      </button>
      {session && <span className="workshop-purchase_session">{session}</span>}
    </div>
  );
}
