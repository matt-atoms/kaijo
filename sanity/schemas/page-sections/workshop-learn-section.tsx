import { defineArrayMember, defineField } from "sanity";

export const workshopLearnSection = defineField({
  type: "object",
  name: "workshopLearnSection",
  title: "Workshop Learn",
  description: "A heading, a short lead and a list of things you'll work on.",
  icon: () => <>🎞️</>,
  fields: [
    defineField({ name: "heading", type: "string", title: "Heading" }),
    defineField({ name: "lead", type: "text", rows: 3, title: "Lead" }),
    defineField({
      name: "items",
      type: "array",
      title: "Items",
      validation: (R) => R.min(1),
      of: [
        defineArrayMember({
          type: "object",
          name: "learnItem",
          fields: [
            defineField({ name: "title", type: "string", title: "Title", validation: (R) => R.required() }),
            defineField({ name: "description", type: "text", rows: 2, title: "Description" }),
          ],
          preview: { select: { title: "title", subtitle: "description" } },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: "heading" },
    prepare({ title }) {
      return { title: title || "Workshop Learn", subtitle: "Workshop Learn" };
    },
  },
});
