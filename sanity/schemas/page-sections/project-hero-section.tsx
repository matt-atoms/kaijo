import { defineField } from "sanity";

export const projectHeroSection = defineField({
  type: "object",
  name: "projectHeroSection",
  title: "Selected Work",
  icon: () => <>🎞</>,
  fields: [
    defineField({
      type: "string",
      name: "note",
      title: "Note",
      description:
        "Automatically lists all projects (ordered by date) as a 'Selected Work' grid: image + category + year, with the project name revealed on hover. Nothing to configure.",
      readOnly: true,
    }),
  ],
  preview: {
    prepare() {
      return { title: "Selected Work" };
    },
  },
});
