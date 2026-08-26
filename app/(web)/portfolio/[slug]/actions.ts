"use server";

import { redirect } from "next/navigation";
import { grantPortfolioAccess } from "~/features/portfolio/access";

/** Verify the entered password; on success set the unlock cookie and reload into the lookbook. */
export async function unlockPortfolio(_prev: { error?: string }, formData: FormData): Promise<{ error?: string }> {
  const slug = String(formData.get("slug") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!slug) {
    return { error: "Something went wrong — please reload the page." };
  }

  const ok = await grantPortfolioAccess(slug, password);
  if (!ok) {
    return { error: "That password isn’t right." };
  }

  // Re-enter the route; the cookie is now set, so the server renders the lookbook.
  redirect(`/portfolio/${slug}`);
}
