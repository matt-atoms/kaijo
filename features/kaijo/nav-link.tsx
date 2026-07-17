"use client";

import { usePathname } from "next/navigation";
import type * as React from "react";
import { Link } from "~/components/link";
import { cx } from "~/features/style/utils";

/**
 * Nav link with Webflow-style current-page state: adds `w--current` and `aria-current="page"`
 * when the pathname matches, mirroring how Webflow marks the active nav item.
 */
export function KaijoNavLink(props: { href: string; className?: string; children: React.ReactNode }) {
  const { href, className, children } = props;
  const pathname = usePathname();
  const isCurrent = pathname === href;

  return (
    <Link href={href} aria-current={isCurrent ? "page" : undefined} className={cx(className, isCurrent && "w--current")}>
      {children}
    </Link>
  );
}
