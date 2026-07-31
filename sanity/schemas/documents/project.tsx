import { defineArrayMember, defineField, defineType } from "sanity";
import { WORK_CATEGORY_OPTIONS } from "../../constants";

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
    { name: "prints", title: "Prints", icon: () => <>🏷</> },
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
      description:
        "Groups the project under a Work sub-category. Drives the /work sub-menu listing pages and nav (it is NOT shown on the tile — the Type field below is).",
      options: {
        list: [...WORK_CATEGORY_OPTIONS],
        layout: "radio",
      },
    }),
    defineField({
      group: "details",
      name: "type",
      type: "string",
      title: "Type",
      description:
        "The individual label shown on the Selected Work tile (e.g. a “Selected Commissions & Editorials” project is labelled either Commission or Editorial). May get its own portfolio-page approach later.",
      options: {
        list: [
          { title: "Personal Project", value: "Personal Project" },
          { title: "Commission", value: "Commission" },
          { title: "Editorial", value: "Editorial" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      group: "details",
      name: "client",
      type: "string",
      title: "Client",
      description: "Shown first on the Selected Work tile label (before Type and year). Defaults to the project name for now.",
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
    defineField({
      group: "media",
      name: "overviewImages",
      type: "array",
      title: "Overview images",
      description:
        "The images the /work gallery randomly cycles through for this project — curate just your strongest ones here. Leave empty to fall back to the thumbnail + all collage images.",
      of: [{ type: "image" }],
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
    defineField({
      group: "prints",
      name: "prints",
      type: "array",
      title: "Prints",
      description:
        "Images from this project available as fine-art prints. These feed the Prints & Books carousel, numbered per project. Add an image and (optionally) a title.",
      of: [
        defineArrayMember({
          type: "object",
          name: "printItem",
          fields: [
            defineField({ name: "image", type: "image", title: "Image", validation: (R) => R.required() }),
            defineField({
              name: "title",
              type: "string",
              title: "Title",
              description: "Shown under the print number in the carousel (e.g. “Reflections, Amsterdam”).",
            }),
          ],
          preview: {
            select: { title: "title", media: "image" },
            prepare({ title, media }) {
              return { title: title || "Untitled print", media };
            },
          },
        }),
      ],
    }),
  ],
  orderings: [
    { title: "Date, Old → New", name: "dateAsc", by: [{ field: "date", direction: "asc" }] },
    { title: "Grid order", name: "gridOrderAsc", by: [{ field: "gridOrder", direction: "asc" }] },
  ],
  preview: {
    select: { title: "title", subtitle: "category", media: "thumbnail" },
  },
});
