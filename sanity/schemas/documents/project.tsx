import { defineArrayMember, defineField, defineType } from "sanity";
import { WORK_CATEGORY_OPTIONS } from "../../constants";
import { requiredIf, visibleIf } from "../../utils";

/** Source of truth for a project's kind — drives conditional fields, the /work grouping, and nav. */
const isCommission = "Commissions";

/** Ceiling on how many images can be flagged "Best" — the fixed collage has 16 slots. */
const MAX_BEST = 16;

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
        "The kind of work — the source of truth that drives the /work grouping and nav, and which fields below are required (Commissions require a client, role and year; personal Projects never require a client).",
      options: {
        list: [...WORK_CATEGORY_OPTIONS],
        layout: "radio",
      },
      validation: (R) => R.required(),
    }),
    defineField({
      group: "details",
      name: "type",
      type: "string",
      title: "Type",
      description: "The individual label shown on the Selected Work tile (Project or Commission).",
      options: {
        list: [
          { title: "Project", value: "Project" },
          { title: "Commission", value: "Commission" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      group: "details",
      name: "client",
      type: "string",
      title: "Client",
      description:
        "The commissioning client, shown on commission pages. Required for commissions; personal projects don't use it.",
      ...requiredIf("category")(isCommission),
    }),
    defineField({
      group: "details",
      name: "role",
      type: "string",
      title: "Role",
      description: "Joep's role on the commission (e.g. Photographer, Director). Shown on commission pages.",
      ...visibleIf("category")(isCommission),
      ...requiredIf("category")(isCommission),
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
      name: "status",
      type: "string",
      title: "Status",
      description:
        "Optional — shown in place of the year on a project page when the work is ongoing (e.g. “Ongoing”, “In progress”). Leave empty to show the year.",
    }),
    defineField({
      group: "details",
      name: "availability",
      type: "string",
      title: "Availability",
      description: "Optional availability note (e.g. “Prints available”, “Available for commissions”, “Archive”).",
    }),
    defineField({
      group: "details",
      name: "description",
      type: "array",
      title: "Description",
      description:
        "The intro shown on the project page. Aim for ~40–100 words for a personal project, ~60–140 words of context for a commission.",
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
      name: "credits",
      type: "text",
      rows: 3,
      title: "Credits",
      description:
        "Optional production credits shown at the foot of a commission page (e.g. “Styling — …”, “Set — …”). One per line.",
      ...visibleIf("category")(isCommission),
    }),
    defineField({
      group: "details",
      name: "hidden",
      type: "boolean",
      title: "Archived (hidden)",
      description:
        "Hide this project from the Work galleries, the homepage scroll and the sitemap. The project doc is kept but unlisted — untick to bring it back.",
      initialValue: false,
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
      name: "images",
      type: "array",
      title: "Images",
      description:
        "All images for this project. Tick “Best” on up to 16 to feature them in the main layout at the top of the page — these are also the only images eligible as hero images on Work and the homepage. Every other image appears in the scrolling gallery at the foot of the page. Drag to reorder; the Best images fill the collage in this order.",
      of: [
        defineArrayMember({
          type: "object",
          name: "projectImage",
          fields: [
            defineField({ name: "image", type: "image", title: "Image", validation: (R) => R.required() }),
            defineField({
              name: "best",
              type: "boolean",
              title: "Best 16",
              description: "Feature in the main layout at the top of the page (max 16).",
              initialValue: false,
            }),
            defineField({
              name: "home",
              type: "boolean",
              title: "Show on home",
              description: "Include in the homepage scroll. Only “Best” images can be used here.",
              initialValue: false,
            }),
            defineField({
              name: "inPortfolio",
              type: "boolean",
              title: "In portfolio",
              description: "Add this photo to one or more private client lookbooks (works for archived projects too).",
              initialValue: false,
            }),
            defineField({
              name: "portfolios",
              type: "array",
              title: "Portfolios",
              description: "Which client lookbook(s) this photo appears in.",
              of: [{ type: "reference", to: [{ type: "portfolio" }] }],
              // Only relevant once the photo is flagged for a portfolio.
              hidden: ({ parent }) => !(parent as { inPortfolio?: boolean } | undefined)?.inPortfolio,
              validation: (R) =>
                R.custom((refs, ctx) => {
                  const parent = ctx.parent as { inPortfolio?: boolean } | undefined;
                  if (parent?.inPortfolio && (!refs || (refs as unknown[]).length === 0)) {
                    return "Pick at least one portfolio, or untick “In portfolio”.";
                  }
                  return true;
                }),
            }),
          ],
          preview: {
            select: { media: "image", best: "best", home: "home", inPortfolio: "inPortfolio" },
            prepare({ media, best, home, inPortfolio }) {
              const tags = [best ? "★ Best" : null, home ? "Home" : null, inPortfolio ? "🔒 Portfolio" : null]
                .filter(Boolean)
                .join(" · ");
              return { title: tags || "Image", media };
            },
          },
        }),
      ],
      validation: (R) =>
        R.custom((items) => {
          const list = (items ?? []) as Array<{ best?: boolean; home?: boolean }>;
          if (list.filter((i) => i?.best).length > MAX_BEST) {
            return `Mark at most ${MAX_BEST} images as “Best”.`;
          }
          if (list.some((i) => i?.home && !i?.best)) {
            return "Only “Best” images can be shown on the homepage.";
          }
          return true;
        }),
    }),
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
