import { defineField } from "sanity";
import { WORK_CATEGORY_OPTIONS } from "../../constants";

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
        "Lists projects in a collage grid, ordered by each project's “Grid order” (Wide/normal tiles come from each project's “Grid style”). Leave the Category filter empty to show every project; set it to build a category listing page (e.g. /work).",
      readOnly: true,
    }),
    defineField({
      type: "string",
      name: "category",
      title: "Category filter",
      description: "Optional. When set, only projects in this Work category are shown. Leave empty to list all projects.",
      options: {
        list: [...WORK_CATEGORY_OPTIONS],
        layout: "radio",
      },
    }),
  ],
  preview: {
    prepare() {
      return { title: "Portfolio Grid" };
    },
  },
});
