import { defineArrayMember, defineField } from "sanity";

export const aboutCredentialsSection = defineField({
  type: "object",
  name: "aboutCredentialsSection",
  title: "About Credentials",
  description: "Side-by-side credential columns (Publications / Exhibitions / Awards / Clients …).",
  icon: () => <>🏅</>,
  fields: [
    defineField({ name: "heading", type: "string", title: "Heading" }),
    defineField({
      name: "columns",
      type: "array",
      title: "Columns",
      validation: (R) => R.min(1),
      of: [
        defineArrayMember({
          type: "object",
          name: "credentialColumn",
          fields: [
            defineField({ name: "title", type: "string", title: "Title", validation: (R) => R.required() }),
            defineField({
              name: "flow",
              type: "boolean",
              title: "Flowing layout",
              description:
                "Render this column's entries as a flowing block with alternating bold/thin weight (good for a long client roster) instead of a stacked list. Years are ignored.",
              initialValue: false,
            }),
            defineField({
              name: "entries",
              type: "array",
              title: "Entries",
              of: [
                defineArrayMember({
                  type: "object",
                  name: "credentialEntry",
                  fields: [
                    defineField({ name: "name", type: "string", title: "Name", validation: (R) => R.required() }),
                    defineField({ name: "year", type: "string", title: "Year" }),
                  ],
                  preview: { select: { title: "name", subtitle: "year" } },
                }),
              ],
            }),
          ],
          preview: { select: { title: "title" } },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: "heading" },
    prepare({ title }) {
      return { title: title || "About Credentials", subtitle: "About Credentials" };
    },
  },
});
