"use client";

import { useClickOutside, useDisclosure } from "@mantine/hooks";
import { usePathname } from "next/navigation";
import * as React from "react";
import { KaijoNavLink } from "~/features/kaijo/nav-link";
import type { SiteHeaderQResult } from "~/sanity/types";

type HeaderLinks = NonNullable<NonNullable<NonNullable<SiteHeaderQResult>["header"]>["links"]>;
type HeaderItem = HeaderLinks[number];

/**
 * Primary navigation. Flat items render as plain links; an item with `children` renders its top
 * link plus an accessible dropdown (Work → its sub-categories). The dropdown opens on hover/focus
 * for pointer + keyboard users and via the caret button for touch, and closes on outside click,
 * Escape, focus-out, or navigation.
 */
export function HeaderNav({ links }: { links: HeaderLinks }) {
  return (
    <nav className="nav_link-row" aria-label="Primary">
      {links.map((item) =>
        item.children && item.children.length > 0 ? (
          <NavGroup key={item.key} item={item} />
        ) : item.link?.href ? (
          <KaijoNavLink key={item.key} href={item.link.href} className="nav_link w-inline-block">
            <div className="nav_link-text">{item.link.text}</div>
          </KaijoNavLink>
        ) : null
      )}
    </nav>
  );
}

function NavGroup({ item }: { item: HeaderItem }) {
  const [opened, { open, close, toggle }] = useDisclosure(false);
  const ref = useClickOutside<HTMLDivElement>(close);
  const pathname = usePathname();
  const menuId = React.useId();

  // Close the menu after a navigation (the destination link was clicked).
  React.useEffect(() => {
    close();
  }, [pathname, close]);

  const label = item.link?.text ?? "";

  return (
    // biome-ignore lint/a11y/useKeyWithMouseEvents: hover is a progressive enhancement; keyboard users get focus + the caret button.
    // biome-ignore lint/a11y/noStaticElementInteractions: the group is a non-interactive wrapper; its interactive children (link + caret button) carry the real semantics, and these handlers only enhance open/close.
    <div
      ref={ref}
      className="nav_dropdown"
      data-open={opened || undefined}
      onMouseEnter={open}
      onMouseLeave={close}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          close();
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          close();
        }
      }}
    >
      {item.link?.href ? (
        <KaijoNavLink href={item.link.href} className="nav_link nav_dropdown-label w-inline-block">
          <div className="nav_link-text">{label}</div>
        </KaijoNavLink>
      ) : (
        <span className="nav_link nav_dropdown-label">
          <div className="nav_link-text">{label}</div>
        </span>
      )}
      <button
        type="button"
        className="nav_dropdown-toggle"
        aria-haspopup="true"
        aria-expanded={opened}
        aria-controls={menuId}
        aria-label={`${label} submenu`}
        onClick={toggle}
      >
        <span aria-hidden="true">▾</span>
      </button>
      <div id={menuId} className="nav_dropdown-menu" hidden={!opened}>
        {item.children?.map((child) =>
          child.href ? (
            <KaijoNavLink key={child.key} href={child.href} className="nav_dropdown-link">
              {child.text}
            </KaijoNavLink>
          ) : null
        )}
      </div>
    </div>
  );
}
