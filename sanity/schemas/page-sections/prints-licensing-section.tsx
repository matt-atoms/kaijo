import { defineField } from "sanity";
import { createLinkField } from "../fields/create-link";

export const printsLicensingSection = defineField({
  type: "object",
  name: "printsLicensingSection",
  title: "Prints Licensing",
  description: "Licensing note + a link (and optional thumbnails) to the Stills collection.",
  icon: () => <>©️</>,
  fields: [
    defineField({ name: "heading", type: "string", title: "Heading" }),
    defineField({ name: "text", type: "text", rows: 4, title: "Text" }),
    createLinkField({ name: "link", title: "Collection link", description: "Link to the Stills collection." }),
    defineField({
      name: "images",
      type: "array",
      title: "Thumbnails",
      description: "Optional images; each links to the collection.",
      of: [{ type: "image" }],
    }),
  ],
  preview: {
    select: { title: "heading" },
    prepare({ title }) {
      return { title: title || "Prints Licensing", subtitle: "Prints Licensing" };
    },
  },
});
