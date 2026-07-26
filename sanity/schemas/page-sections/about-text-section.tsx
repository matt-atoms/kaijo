import { defineField } from "sanity";
import { createLinkField } from "../fields/create-link";
import { createRichTextField } from "../fields/create-rich-text";

export const aboutTextSection = defineField({
  type: "object",
  name: "aboutTextSection",
  title: "About Text",
  description: "A titled editorial text block (biography, method, or a bridge with a CTA).",
  icon: () => <>📝</>,
  fields: [
    defineField({
      name: "heading",
      type: "string",
      title: "Heading",
      description: "Small metadata-style label shown above the text.",
    }),
    createRichTextField({ title: "Text", validation: (R) => R.required() }),
    defineField({
      name: "pullQuote",
      type: "text",
      rows: 2,
      title: "Pull quote",
      description: "Optional large pulled sentence.",
    }),
    defineField({
      name: "images",
      type: "array",
      title: "Supporting images",
      description: "Optional photos shown beside the text.",
      of: [{ type: "image" }],
    }),
    createLinkField({ title: "CTA link" }),
  ],
  preview: {
    select: { title: "heading" },
    prepare({ title }) {
      return { title: title || "About Text", subtitle: "About Text" };
    },
  },
});
