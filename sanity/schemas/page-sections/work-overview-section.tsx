import { defineArrayMember, defineField } from "sanity";
import { WORK_CATEGORY_OPTIONS } from "../../constants";

export const workOverviewSection = defineField({
  type: "object",
  name: "workOverviewSection",
  title: "Work Overview",
  description: "The /work page: category groups, each a header band + a masonry gallery, with jump-to anchors at the top.",
  icon: () => <>🗂️</>,
  fields: [
    defineField({
      name: "groups",
      type: "array",
      title: "Groups",
      description: "One block per category (e.g. Projects, Commissions & Editorials), in display order.",
      validation: (R) => R.min(1),
      of: [
        defineArrayMember({
          type: "object",
          name: "workGroup",
          fields: [
            defineField({ name: "heading", type: "string", title: "Heading", validation: (R) => R.required() }),
            defineField({ name: "intro", type: "text", rows: 3, title: "Intro" }),
            defineField({
              name: "category",
              type: "string",
              title: "Category",
              description: "Which Work category's projects this group shows.",
              options: { list: [...WORK_CATEGORY_OPTIONS], layout: "radio" },
              validation: (R) => R.required(),
            }),
          ],
          preview: { select: { title: "heading", subtitle: "category" } },
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: "Work Overview" };
    },
  },
});
