import { defineField } from "sanity";
import { createLinkField } from "../fields/create-link";

export const aboutSection = defineField({
  type: "object",
  name: "aboutSection",
  title: "About",
  icon: () => <>👋</>,
  fields: [
    defineField({
      name: "title",
      type: "string",
      title: "Title",
      description: "Optional heading. Leave empty to use this section as a hero (image + intro, no header).",
    }),
    defineField({
      name: "text",
      type: "text",
      rows: 5,
      title: "Text",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "image",
      type: "image",
      title: "Image",
      description: "Optional. Leave empty for a text-only hero (e.g. the homepage intro).",
    }),
    defineField({
      name: "secondText",
      type: "text",
      rows: 5,
      title: "Second text",
      description: "Shown below the image.",
    }),
    createLinkField({
      title: "Read more link",
      description: "Optional link shown under the intro text (e.g. Read more → /info).",
    }),
  ],
  preview: {
    select: { title: "title", media: "image" },
    prepare({ title, media }) {
      return { title: title ?? "About", media };
    },
  },
});
