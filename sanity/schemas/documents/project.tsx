import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * The Webflow project template lays 16 CMS image fields into 10 fixed collage rows.
 * Slot styles, in order (rows: 2-1-2-1-3-1-1-2-1-2 images).
 */
const PROJECT_IMAGE_SLOTS = [
  "normal",
  "smaller",
  "large",
  "smaller",
  "medium",
  "full",
  "smaller alt",
  "normal",
  "smaller",
  "large",
  "full",
  "smaller",
  "medium",
  "large",
  "smaller",
  "medium",
] as const;

export const project = defineType({
  __experimental_formPreviewTitle: false,
  name: "project",
  type: "document",
  title: "Project",
  icon: () => <>📷</>,
  groups: [
    { name: "details", title: "Details", icon: () => <>📄</>, default: true },
    { name: "media", title: "Media", icon: () => <>🖼</> },
  ],
  fields: [
    defineField({
      group: "details",
      name: "title",
      type: "string",
      title: "Title",
      validation: (R) => R.required(),
    }),
    defineField({
      group: "details",
      name: "slug",
      type: "slug",
      title: "Slug",
      description: "The project lives at /project/<slug>.",
      options: { source: "title" },
      validation: (R) => R.required(),
    }),
    defineField({
      group: "details",
      name: "category",
      type: "string",
      title: "Category",
      description: "E.g. “Assignment” or “Concept Work”. Shown under the project title in the homepage hero.",
    }),
    defineField({
      group: "details",
      name: "date",
      type: "date",
      title: "Date",
      description: "Displayed as month + year. Also defines the order of the homepage hero rows.",
      validation: (R) => R.required(),
    }),
    defineField({
      group: "details",
      name: "description",
      type: "array",
      title: "Description",
      description: "The project brief shown on the project page.",
      of: [
        defineArrayMember({
          type: "block",
          styles: [{ title: "Normal", value: "normal" }],
          lists: [],
          marks: {
            decorators: [
              { title: "Strong", value: "strong" },
              { title: "Emphasis", value: "em" },
            ],
            annotations: [],
          },
        }),
      ],
    }),
    defineField({
      group: "details",
      name: "gridStyle",
      type: "string",
      title: "Grid style",
      description: "How the project tile spans the portfolio grid (homepage bottom grid and /work).",
      options: {
        list: [
          { title: "Normal", value: "normal" },
          { title: "Wide", value: "wide" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      initialValue: "normal",
    }),
    defineField({
      group: "details",
      name: "gridOrder",
      type: "number",
      title: "Grid order",
      description: "Sort order in the portfolio grid (homepage bottom grid and /work). Lower comes first.",
    }),
    defineField({
      group: "media",
      name: "thumbnail",
      type: "image",
      title: "Thumbnail",
      description: "Used in the homepage hero and the portfolio grids.",
      validation: (R) => R.required(),
    }),
    ...PROJECT_IMAGE_SLOTS.map((slot, index) =>
      defineField({
        group: "media",
        name: `image${index + 1}`,
        type: "image",
        title: `Image ${index + 1} (${slot})`,
        description: `Collage slot ${index + 1}: ${slot}. Leave empty to skip this slot, exactly like an unbound Webflow CMS image.`,
      })
    ),
  ],
  orderings: [
    { title: "Date, Old → New", name: "dateAsc", by: [{ field: "date", direction: "asc" }] },
    { title: "Grid order", name: "gridOrderAsc", by: [{ field: "gridOrder", direction: "asc" }] },
  ],
  preview: {
    select: { title: "title", subtitle: "category", media: "thumbnail" },
  },
});
