import { defineArrayMember, defineField } from "sanity";

export const workshopNotesSection = defineField({
  type: "object",
  name: "workshopNotesSection",
  title: "Workshop Notes",
  description: "Two side-by-side panels (e.g. Who it's for / Equipment & experience).",
  icon: () => <>📝</>,
  fields: [
    defineField({ name: "heading", type: "string", title: "Heading", description: "Optional section heading." }),
    defineField({
      name: "columns",
      type: "array",
      title: "Panels",
      validation: (R) => R.min(1).max(2),
      of: [
        defineArrayMember({
          type: "object",
          name: "notesColumn",
          fields: [
            defineField({ name: "heading", type: "string", title: "Heading", validation: (R) => R.required() }),
            defineField({ name: "intro", type: "text", rows: 3, title: "Intro paragraph" }),
            defineField({
              name: "items",
              type: "array",
              title: "Items",
              description: "A list. Add a label to show a bold lead (e.g. “Equipment — …”).",
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
          preview: { select: { title: "heading" } },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: "heading" },
    prepare({ title }) {
      return { title: title || "Workshop Notes", subtitle: "Workshop Notes" };
    },
  },
});
