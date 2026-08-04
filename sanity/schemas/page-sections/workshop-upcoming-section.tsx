import { defineArrayMember, defineField } from "sanity";
import { createLinkField } from "../fields/create-link";

export const workshopUpcomingSection = defineField({
  type: "object",
  name: "workshopUpcomingSection",
  title: "Workshop Upcoming",
  description: "Scheduled workshops as cards. Falls back to an enquiry prompt when there are none.",
  icon: () => <>📅</>,
  fields: [
    defineField({ name: "heading", type: "string", title: "Heading" }),
    defineField({ name: "lead", type: "text", rows: 2, title: "Lead" }),
    defineField({
      name: "events",
      type: "array",
      title: "Scheduled workshops",
      of: [
        defineArrayMember({
          type: "object",
          name: "workshopEvent",
          fields: [
            defineField({ name: "title", type: "string", title: "Workshop name" }),
            defineField({ name: "date", type: "string", title: "Date", validation: (R) => R.required() }),
            defineField({ name: "time", type: "string", title: "Time", description: "e.g. 10:00–14:30" }),
            defineField({ name: "location", type: "string", title: "Location" }),
            defineField({ name: "language", type: "string", title: "Language" }),
            defineField({
              name: "availability",
              type: "string",
              title: "Availability",
              description: "Capacity or genuine remaining places — avoid false scarcity.",
            }),
            defineField({ name: "price", type: "string", title: "Price" }),
            defineField({ name: "deadline", type: "string", title: "Booking deadline" }),
            createLinkField({ title: "Booking / details link" }),
          ],
          preview: {
            select: { title: "title", date: "date", subtitle: "location" },
            prepare({ title, date, subtitle }) {
              return { title: title || date || "Workshop", subtitle: [date, subtitle].filter(Boolean).join(" · ") };
            },
          },
        }),
      ],
    }),
    defineField({
      name: "emptyMessage",
      type: "text",
      rows: 2,
      title: "Empty state — message",
      description: "Shown when there are no scheduled workshops.",
      initialValue: "New dates are currently being planned.",
    }),
    defineField({ name: "emptyCtaLabel", type: "string", title: "Empty state — CTA label" }),
    createLinkField({ name: "emptyCtaLink", title: "Empty state — CTA link" }),
  ],
  preview: {
    select: { title: "heading" },
    prepare({ title }) {
      return { title: title || "Workshop Upcoming", subtitle: "Workshop Upcoming" };
    },
  },
});
