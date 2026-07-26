import { defineField } from "sanity";
import { createRichTextField } from "../fields/create-rich-text";

export const aboutIdentitySection = defineField({
  type: "object",
  name: "aboutIdentitySection",
  title: "About Intro",
  description: "Opening block: heading + biography text on the left, portrait on the right.",
  icon: () => <>🪪</>,
  fields: [
    defineField({ name: "heading", type: "string", title: "Heading", initialValue: "About" }),
    createRichTextField({ title: "Text", validation: (R) => R.required() }),
    defineField({ name: "portrait", type: "image", title: "Portrait" }),
  ],
  preview: {
    select: { title: "heading", media: "portrait" },
    prepare({ title, media }) {
      return { title: title || "About Intro", subtitle: "About Intro", media };
    },
  },
});
