import { defineField } from "sanity";

export const aboutSection = defineField({
  type: "object",
  name: "aboutSection",
  title: "About",
  icon: () => <>👋</>,
  fields: [
    defineField({
      name: "title",
      type: "string",
      title: "Title",
      initialValue: "About",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "text",
      type: "text",
      rows: 5,
      title: "Text",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "image",
      type: "image",
      title: "Image",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "secondText",
      type: "text",
      rows: 5,
      title: "Second text",
      description: "Shown below the image.",
    }),
  ],
  preview: {
    select: { title: "title", media: "image" },
    prepare({ title, media }) {
      return { title: title ?? "About", media };
    },
  },
});
