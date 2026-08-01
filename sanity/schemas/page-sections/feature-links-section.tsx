import { defineArrayMember, defineField } from "sanity";
import { createLinkField } from "../fields/create-link";

export const featureLinksSection = defineField({
  type: "object",
  name: "featureLinksSection",
  title: "Feature Links",
  description: "A minimal row of text links (e.g. Books, Prints, Workshops) — title, caption and link.",
  icon: () => <>🔗</>,
  fields: [
    defineField({ name: "title", type: "string", title: "Title" }),
    defineField({
      name: "items",
      type: "array",
      title: "Items",
      validation: (R) => R.min(1),
      of: [
        defineArrayMember({
          type: "object",
          name: "featureLinkItem",
          fields: [
            defineField({ name: "title", type: "string", title: "Title", validation: (R) => R.required() }),
            defineField({
              name: "caption",
              type: "string",
              title: "Caption",
              description: "Optional one-line intro shown under the title (e.g. “Signed photobooks & limited editions”).",
            }),
            createLinkField({ title: "Link", validation: (R) => R.required() }),
          ],
          preview: { select: { title: "title", subtitle: "caption" } },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: "title" },
    prepare({ title }) {
      return { title: title || "Feature Links", subtitle: "Feature Links" };
    },
  },
});
