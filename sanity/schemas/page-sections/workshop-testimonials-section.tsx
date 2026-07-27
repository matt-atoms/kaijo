import { defineArrayMember, defineField } from "sanity";

export const workshopTestimonialsSection = defineField({
  type: "object",
  name: "workshopTestimonialsSection",
  title: "Workshop Testimonials",
  description: "Three to five short, attributed testimonials shown in a grid.",
  icon: () => <>💬</>,
  fields: [
    defineField({ name: "heading", type: "string", title: "Heading" }),
    defineField({ name: "lead", type: "text", rows: 2, title: "Lead" }),
    defineField({
      name: "items",
      type: "array",
      title: "Testimonials",
      validation: (R) => R.min(1).max(6),
      of: [
        defineArrayMember({
          type: "object",
          name: "testimonial",
          fields: [
            defineField({ name: "quote", type: "text", rows: 3, title: "Quote", validation: (R) => R.required() }),
            defineField({ name: "name", type: "string", title: "Participant name", validation: (R) => R.required() }),
          ],
          preview: {
            select: { title: "name", subtitle: "quote" },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: "heading" },
    prepare({ title }) {
      return { title: title || "Workshop Testimonials", subtitle: "Workshop Testimonials" };
    },
  },
});
