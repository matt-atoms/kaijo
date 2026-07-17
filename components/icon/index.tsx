import type * as React from "react";
import { cx } from "~/features/style/utils";
import IconArrowDown from "./icon-arrow-down.svg";
import IconArrowLeft from "./icon-arrow-left.svg";
import IconArrowRight from "./icon-arrow-right.svg";
import IconArrowUp from "./icon-arrow-up.svg";
import IconArrowUpRight from "./icon-arrow-up-right.svg";

export type IconName = keyof typeof icons;

const icons = {
  "arrow-right": IconArrowRight,
  "arrow-left": IconArrowLeft,
  "arrow-up": IconArrowUp,
  "arrow-down": IconArrowDown,
  "arrow-up-right": IconArrowUpRight,
} as const;

export const iconNames = Object.keys(icons) as IconName[];

export function Icon(
  props: React.ComponentProps<"svg"> & {
    name: IconName;
  }
) {
  const { name, className, ...rest } = props;
  const Component = icons[name];

  if (!Component) {
    return null;
  }

  return <Component aria-hidden className={cx("size-[1em] shrink-0", className)} {...rest} />;
}
