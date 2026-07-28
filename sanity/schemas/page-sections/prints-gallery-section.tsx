import { defineArrayMember, defineField } from "sanity";
import { createLinkField } from "../fields/create-link";

export const printsGallerySection = defineField({
  type: "object",
  name: "printsGallerySection",
  title: "Prints Gallery",
  description: "Per-series print galleries, each shown as a framed coverflow carousel.",
  icon: () => <>🖼️</>,
  fields: [
    defineField({ name: "heading", type: "string", title: "Heading" }),
    defineField({ name: "intro", type: "text", rows: 4, title: "Intro" }),
    createLinkField({ name: "enquiryLink", title: "Enquiry link", description: "Optional 'enquire about prints' CTA." }),
    defineField({ name: "optionsHeading", type: "string", title: "Options — heading" }),
    defineField({
      name: "editions",
      type: "array",
      title: "Options — editions",
      description: "Size / edition rows shown beside the intro.",
      of: [
        defineArrayMember({
          type: "object",
          name: "printEdition",
          fields: [
            defineField({ name: "size", type: "string", title: "Size", validation: (R) => R.required() }),
            defineField({ name: "edition", type: "string", title: "Edition" }),
          ],
          preview: { select: { title: "size", subtitle: "edition" } },
        }),
      ],
    }),
    defineField({
      name: "priceNote",
      type: "string",
      title: "Options — price note",
      description: "e.g. “Prints from €1,250”. Deliberately no full price list.",
    }),
    defineField({
      name: "categories",
      type: "array",
      title: "Series",
      validation: (R) => R.min(1),
      of: [
        defineArrayMember({
          type: "object",
          name: "printsCategory",
          fields: [
            defineField({ name: "title", type: "string", title: "Title", validation: (R) => R.required() }),
            defineField({ name: "description", type: "string", title: "Description" }),
            defineField({
              name: "images",
              type: "array",
              title: "Images",
              validation: (R) => R.min(1),
              of: [{ type: "image" }],
            }),
          ],
          preview: {
            select: { title: "title", images: "images" },
            prepare({ title, images }) {
              const count = Array.isArray(images) ? images.length : 0;
              return { title: title || "Series", subtitle: `${count} image${count === 1 ? "" : "s"}` };
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: "heading" },
    prepare({ title }) {
      return { title: title || "Prints Gallery", subtitle: "Prints Gallery" };
    },
  },
});
