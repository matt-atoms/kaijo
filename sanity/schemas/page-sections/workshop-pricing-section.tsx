import { defineArrayMember, defineField } from "sanity";

export const workshopPricingSection = defineField({
  type: "object",
  name: "workshopPricingSection",
  title: "Workshop Pricing",
  description: "Pricing tiers (with prices or 'on request') plus optional fine print.",
  icon: () => <>💶</>,
  fields: [
    defineField({ name: "heading", type: "string", title: "Heading" }),
    defineField({ name: "lead", type: "text", rows: 3, title: "Lead" }),
    defineField({
      name: "tiers",
      type: "array",
      title: "Tiers",
      validation: (R) => R.min(1),
      of: [
        defineArrayMember({
          type: "object",
          name: "pricingTier",
          fields: [
            defineField({ name: "title", type: "string", title: "Title", validation: (R) => R.required() }),
            defineField({
              name: "price",
              type: "string",
              title: "Price",
              description: "e.g. €250. Leave empty to show “On request”.",
            }),
            defineField({ name: "description", type: "text", rows: 2, title: "Description" }),
          ],
          preview: { select: { title: "title", subtitle: "price" } },
        }),
      ],
    }),
    defineField({
      name: "note",
      type: "text",
      rows: 2,
      title: "Fine print",
      description: "Optional note shown below the tiers (travel, vouchers, etc.).",
    }),
    defineField({
      name: "bookingHeading",
      type: "string",
      title: "Booking box — heading",
      description: "Heading of the enquiry box beside the tiers.",
    }),
    defineField({
      name: "bookingIntro",
      type: "text",
      rows: 2,
      title: "Booking box — intro",
    }),
    defineField({
      name: "bookingEmail",
      type: "string",
      title: "Booking box — email",
      description: "Where enquiries are sent (mailto). Falls back to me@joephijwegen.com.",
    }),
    defineField({
      name: "bookingInstagram",
      type: "string",
      title: "Booking box — Instagram",
      description: "Handle (@name) or full URL, shown under the form.",
    }),
    defineField({
      name: "bookingExtraOptions",
      type: "array",
      title: "Booking box — extra options",
      description: "Extra dropdown choices beyond the tiers above (e.g. Gift voucher).",
      of: [{ type: "string" }],
    }),
  ],
  preview: {
    select: { title: "heading" },
    prepare({ title }) {
      return { title: title || "Workshop Pricing", subtitle: "Workshop Pricing" };
    },
  },
});
