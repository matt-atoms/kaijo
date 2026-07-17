import { defineField } from "sanity";

export const portfolioGridSection = defineField({
  type: "object",
  name: "portfolioGridSection",
  title: "Portfolio Grid",
  icon: () => <>🖼</>,
  fields: [
    defineField({
      type: "string",
      name: "note",
      title: "Note",
      description:
        "This section automatically lists all projects in a collage grid, ordered by each project's “Grid order”. Wide/normal tiles come from each project's “Grid style”. Nothing to configure.",
      readOnly: true,
    }),
  ],
  preview: {
    prepare() {
      return { title: "Portfolio Grid" };
    },
  },
});
