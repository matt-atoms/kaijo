import { defineField } from "sanity";

export const booksStoreSection = defineField({
  type: "object",
  name: "booksStoreSection",
  title: "Books Store",
  description: "The Books page — lists every book document as a large visual entry.",
  icon: () => <>📚</>,
  fields: [
    defineField({ name: "heading", type: "string", title: "Heading" }),
    defineField({ name: "intro", type: "text", rows: 3, title: "Intro" }),
  ],
  preview: {
    select: { title: "heading" },
    prepare({ title }) {
      return { title: title || "Books Store", subtitle: "Books Store" };
    },
  },
});
