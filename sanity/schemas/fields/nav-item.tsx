import { defineField, defineType } from "sanity";
import { createLinkField } from "./create-link";

/**
 * A top-level header navigation entry: a link plus optional dropdown sub-links. Used only by the
 * site header (`site.header.links`); the footer stays a flat list of plain links.
 */
export const headerNavItem = defineType({
  name: "headerNavItem",
  type: "object",
  title: "Nav Item",
  icon: () => <>🔗</>,
  fields: [
    createLinkField({ name: "link", title: "Link", validation: (R) => R.required() }),
    defineField({
      name: "children",
      type: "array",
      title: "Sub-links",
      description: "Optional dropdown items shown under this entry (e.g. Work → its sub-categories).",
      of: [createLinkField({ title: "Sub-link", validation: (R) => R.required() })],
    }),
  ],
  preview: {
    select: {
      customText: "link.customText",
      type: "link.type",
      children: "children",
    },
    prepare({ customText, type, children }) {
      const count = Array.isArray(children) ? children.length : 0;
      return {
        title: customText || "Nav Item",
        subtitle: count > 0 ? `${type ?? "link"} · ${count} sub-link${count === 1 ? "" : "s"}` : type,
      };
    },
  },
});
