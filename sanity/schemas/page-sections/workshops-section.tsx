import { defineField } from "sanity";
import { createLinkField } from "../fields/create-link";

export const workshopsSection = defineField({
  type: "object",
  name: "workshopsSection",
  title: "Workshops",
  icon: () => <>📸</>,
  fields: [
    defineField({ name: "image", type: "image", title: "Image", validation: (R) => R.required() }),
    defineField({ name: "headline", type: "string", title: "Headline" }),
    defineField({
      name: "text",
      type: "text",
      rows: 4,
      title: "Text",
      validation: (R) => R.required(),
    }),
    createLinkField({ title: "Button link", validation: (R) => R.required() }),
  ],
  preview: {
    select: { title: "headline", media: "image" },
    prepare({ title, media }) {
      return { title: title || "Workshops", subtitle: "Workshops", media };
    },
  },
});
