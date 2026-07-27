import { defineArrayMember, defineField } from "sanity";

export const workshopNotesSection = defineField({
  type: "object",
  name: "workshopNotesSection",
  title: "Workshop Notes",
  description: "A single numbered list (e.g. Who it's for), styled like “What you'll learn”.",
  icon: () => <>📝</>,
  fields: [
    defineField({ name: "heading", type: "string", title: "Heading" }),
    defineField({ name: "intro", type: "text", rows: 3, title: "Intro" }),
    defineField({
      name: "items",
      type: "array",
      title: "Items",
      description: "Add a label to give an item a bold lead (e.g. “Equipment — …”).",
      validation: (R) => R.min(1),
      of: [
        defineArrayMember({
          type: "object",
          name: "noteItem",
          fields: [
            defineField({ name: "label", type: "string", title: "Label (optional)" }),
            defineField({ name: "text", type: "text", rows: 2, title: "Text", validation: (R) => R.required() }),
          ],
          preview: {
            select: { label: "label", text: "text" },
            prepare({ label, text }) {
              return { title: label || text };
            },
          },
        }),
      ],
    }),
    defineField({
      name: "note",
      type: "text",
      rows: 2,
      title: "Note",
      description: "Optional closing note (e.g. what the workshop is less focused on).",
    }),
  ],
  preview: {
    select: { title: "heading" },
    prepare({ title }) {
      return { title: title || "Workshop Notes", subtitle: "Workshop Notes" };
    },
  },
});
