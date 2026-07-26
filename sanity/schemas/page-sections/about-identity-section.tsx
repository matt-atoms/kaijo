import { defineField } from "sanity";

export const aboutIdentitySection = defineField({
  type: "object",
  name: "aboutIdentitySection",
  title: "About Identity",
  icon: () => <>🪪</>,
  fields: [
    defineField({ name: "portrait", type: "image", title: "Portrait" }),
    defineField({ name: "name", type: "string", title: "Name", validation: (R) => R.required() }),
    defineField({
      name: "descriptor",
      type: "string",
      title: "Descriptor",
      description: "e.g. “Photographer based in Amsterdam”.",
    }),
    defineField({ name: "location", type: "string", title: "Location" }),
    defineField({
      name: "statement",
      type: "text",
      rows: 4,
      title: "Statement",
      description: "Short positioning paragraph (~40–80 words).",
    }),
  ],
  preview: {
    select: { title: "name", media: "portrait" },
    prepare({ title, media }) {
      return { title: title || "About Identity", subtitle: "About Identity", media };
    },
  },
});
