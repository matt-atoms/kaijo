import { defineArrayMember, defineField } from "sanity";
import { createLinkField } from "../fields/create-link";

export const featureLinksSection = defineField({
  type: "object",
  name: "featureLinksSection",
  title: "Feature Links",
  description: "A small gallery of image tiles that each link out (e.g. Books, Prints).",
  icon: () => <>🖼️</>,
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
            defineField({ name: "image", type: "image", title: "Image" }),
            defineField({ name: "title", type: "string", title: "Title", validation: (R) => R.required() }),
            defineField({
              name: "caption",
              type: "string",
              title: "Caption",
              description: "Optional one-line intro shown under the title (e.g. “Signed photobooks & limited editions”).",
            }),
            createLinkField({ title: "Link", validation: (R) => R.required() }),
          ],
          preview: { select: { title: "title", media: "image" } },
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
