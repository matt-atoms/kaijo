import { defineField } from "sanity";
import { createLinkField } from "../fields/create-link";
import { createRichTextField } from "../fields/create-rich-text";

export const workshopIntroSection = defineField({
  type: "object",
  name: "workshopIntroSection",
  title: "Workshop Intro",
  description: "Opening title, a pulled quote, an editorial intro and a request CTA.",
  icon: () => <>📸</>,
  fields: [
    defineField({ name: "heading", type: "string", title: "Heading", validation: (R) => R.required() }),
    defineField({
      name: "quote",
      type: "text",
      rows: 3,
      title: "Pull quote",
      description: "A short quote in Joep's voice, shown large.",
    }),
    defineField({ name: "quoteAttribution", type: "string", title: "Quote attribution" }),
    createRichTextField({ title: "Intro", validation: (R) => R.required() }),
    createLinkField({ title: "CTA link" }),
  ],
  preview: {
    select: { title: "heading" },
    prepare({ title }) {
      return { title: title || "Workshop Intro", subtitle: "Workshop Intro" };
    },
  },
});
