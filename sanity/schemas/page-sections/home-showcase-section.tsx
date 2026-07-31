import { defineField } from "sanity";

export const homeShowcaseSection = defineField({
  type: "object",
  name: "homeShowcaseSection",
  title: "Home Showcase",
  description:
    "The homepage “Selected Work” scroll. Draws a scattered, reshuffled mix of every project image ticked “Show on home” (project → Media → Overview images). No images are configured here.",
  icon: () => <>🖼️</>,
  fields: [
    defineField({
      name: "title",
      type: "string",
      title: "Title",
      description: "Small heading above the scroll (e.g. “Selected Work”).",
    }),
    defineField({
      name: "intro",
      type: "text",
      rows: 2,
      title: "Intro",
      description: "Optional one-line intro shown beside the title.",
    }),
  ],
  preview: {
    select: { title: "title" },
    prepare({ title }) {
      return { title: title || "Selected Work", subtitle: "Home Showcase" };
    },
  },
});
