import { defineArrayMember, defineField } from "sanity";

export const printsShowcaseSection = defineField({
  type: "object",
  name: "printsShowcaseSection",
  title: "Prints Showcase",
  description:
    "The unified prints carousel. Pulls print images from every Project's Prints tab, numbered per project. Edit the prints themselves on the Project documents.",
  icon: () => <>🖼</>,
  fields: [
    defineField({ name: "heading", type: "string", title: "Heading", initialValue: "Prints" }),
    defineField({ name: "intro", type: "text", rows: 3, title: "Intro" }),
    defineField({ name: "optionsHeading", type: "string", title: "Options heading", initialValue: "Editions & sizes" }),
    defineField({
      name: "editions",
      type: "array",
      title: "Editions & sizes",
      description: "The available sizes. Also populate the size dropdown in the print enquiry form.",
      of: [
        defineArrayMember({
          type: "object",
          name: "edition",
          fields: [
            defineField({ name: "size", type: "string", title: "Size", validation: (R) => R.required() }),
            defineField({ name: "edition", type: "string", title: "Edition" }),
          ],
          preview: {
            select: { title: "size", subtitle: "edition" },
          },
        }),
      ],
    }),
    defineField({ name: "priceNote", type: "string", title: "Price note", initialValue: "Prints from €1,250" }),
  ],
  preview: {
    select: { title: "heading" },
    prepare({ title }) {
      return { title: title || "Prints", subtitle: "Prints Showcase" };
    },
  },
});
