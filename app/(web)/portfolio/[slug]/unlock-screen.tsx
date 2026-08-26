"use client";

import * as React from "react";
import { unlockPortfolio } from "./actions";

/** The password gate shown until a valid unlock cookie is held. Posts to the `unlockPortfolio` action. */
export function PortfolioUnlock({ slug, title }: { slug: string; title: string }) {
  const [state, action, pending] = React.useActionState(unlockPortfolio, {});

  return (
    <div className="pf-lock">
      <form className="pf-lock_card" action={action}>
        <input type="hidden" name="slug" value={slug} />
        <p className="pf-lock_eyebrow">Private portfolio</p>
        <h1 className="pf-lock_title">{title}</h1>
        <label className="pf-lock_label" htmlFor="pf-password">
          Password
        </label>
        <input
          id="pf-password"
          name="password"
          type="password"
          autoComplete="off"
          // biome-ignore lint/a11y/noAutofocus: single-purpose gate; focusing the only field is the expected behaviour.
          autoFocus
          className="pf-lock_input"
          required
        />
        <button type="submit" className="pf-lock_btn" disabled={pending}>
          {pending ? "Checking…" : "Enter"}
        </button>
        {state?.error && (
          <p className="pf-lock_error" role="alert">
            {state.error}
          </p>
        )}
      </form>
    </div>
  );
}
