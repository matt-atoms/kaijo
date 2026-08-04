import { defineField } from "sanity";

export const workshopGallerySection = defineField({
  type: "object",
  name: "workshopGallerySection",
  title: "Workshop Gallery",
  description: "A side-scrolling gallery of example images, pulled from a project (its prints, else its overview images).",
  icon: () => <>🖼️</>,
  fields: [
    defineField({ name: "heading", type: "string", title: "Heading", description: 'e.g. "What we\'ll make".' }),
    defineField({
      name: "project",
      type: "reference",
      title: "Source project",
      description: "The gallery shows this project's prints (or, if it has none, its overview images).",
      to: [{ type: "project" }],
      validation: (R) => R.required(),
    }),
  ],
  preview: {
    select: { title: "heading", project: "project.title" },
    prepare({ title, project }) {
      return { title: title || "Workshop Gallery", subtitle: project ? `Gallery · ${project}` : "Workshop Gallery" };
    },
  },
});
