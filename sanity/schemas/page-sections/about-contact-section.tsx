import { defineArrayMember, defineField } from "sanity";
import { createLinkField } from "../fields/create-link";

export const aboutContactSection = defineField({
  type: "object",
  name: "aboutContactSection",
  title: "About Contact",
  description: "A contact card (email / Instagram) plus inquiry buttons.",
  icon: () => <>✉️</>,
  fields: [
    defineField({ name: "heading", type: "string", title: "Heading" }),
    defineField({ name: "email", type: "string", title: "Email" }),
    defineField({ name: "instagram", type: "string", title: "Instagram", description: "Handle (@name) or full URL." }),
    defineField({ name: "location", type: "string", title: "Location" }),
    defineField({
      name: "inquiries",
      type: "array",
      title: "Inquiry buttons",
      of: [
        defineArrayMember({
          type: "object",
          name: "inquiryButton",
          fields: [
            defineField({ name: "label", type: "string", title: "Label", validation: (R) => R.required() }),
            createLinkField({ title: "Link", validation: (R) => R.required() }),
          ],
          preview: { select: { title: "label" } },
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: "About Contact" };
    },
  },
});
