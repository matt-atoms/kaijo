import { defineField, defineType } from "sanity";

/**
 * A password-gated client lookbook, reachable at `/portfolio/<slug>`. It is never listed in the nav
 * or sitemap and is served `noindex`. Images are added from any project (live or archived) by ticking
 * "In portfolio" on the photo and selecting this portfolio there — see `project.images[].portfolios`.
 * The page fetches those images and arranges them into varied lookbook spreads automatically.
 */
export const portfolio = defineType({
  name: "portfolio",
  type: "document",
  title: "Portfolio",
  icon: () => <>🔒</>,
  fields: [
    defineField({
      name: "title",
      type: "string",
      title: "Title",
      description: "The client or organisation this lookbook is for (e.g. “Nike”, “Vogue NL”). Shown at the top of the page.",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      title: "Slug (the /portfolio/… address)",
      description: "The private URL: /portfolio/<slug>. Share this together with the password.",
      options: { source: "title" },
      validation: (R) => R.required(),
    }),
    defineField({
      name: "password",
      type: "string",
      title: "Password",
      description:
        "The access code the client types to open the lookbook. Note: this is a simple gate to keep the page unlisted and out of search engines — the photos themselves stay reachable by their direct image URLs, so don't treat it as strong secrecy. Change it to revoke access.",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "intro",
      type: "text",
      rows: 3,
      title: "Intro (optional)",
      description: "A short note shown above the images (e.g. “A selection for …”). Leave empty to show just the title.",
    }),
  ],
  preview: {
    select: { title: "title", slug: "slug.current" },
    prepare({ title, slug }) {
      return { title: title || "Untitled portfolio", subtitle: slug ? `/portfolio/${slug}` : "No slug yet" };
    },
  },
});
