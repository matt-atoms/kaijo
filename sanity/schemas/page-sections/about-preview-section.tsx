import { defineArrayMember, defineField } from "sanity";
import { createLinkField } from "../fields/create-link";

export const aboutPreviewSection = defineField({
  type: "object",
  name: "aboutPreviewSection",
  title: "About Preview",
  icon: () => <>👤</>,
  fields: [
    defineField({
      name: "text",
      type: "text",
      rows: 4,
      title: "Text",
      description: "A short paragraph teasing the full About page.",
      validation: (R) => R.required(),
    }),
    createLinkField({ title: "Read more link", validation: (R) => R.required() }),
    defineField({
      name: "credentials",
      type: "array",
      title: "Credentials",
      description: "Short lines shown in a column beside the text (e.g. location, exhibitions, publications).",
      of: [defineArrayMember({ type: "string" })],
    }),
  ],
  preview: {
    select: { title: "text" },
    prepare({ title }) {
      return { title: title || "About Preview", subtitle: "About Preview" };
    },
  },
});
