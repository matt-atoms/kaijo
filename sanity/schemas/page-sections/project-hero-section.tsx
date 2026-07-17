import { defineField } from "sanity";

export const projectHeroSection = defineField({
  type: "object",
  name: "projectHeroSection",
  title: "Project Hero",
  icon: () => <>🎞</>,
  fields: [
    defineField({
      type: "string",
      name: "note",
      title: "Note",
      description: "This section automatically lists all projects (ordered by date) in rows of three. Nothing to configure.",
      readOnly: true,
    }),
  ],
  preview: {
    prepare() {
      return { title: "Project Hero" };
    },
  },
});
