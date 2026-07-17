import type * as React from "react";
import { Slot } from "~/components/slot/slot";
import { Slottable } from "~/components/slot/slottable";
import { cva, type VariantProps } from "~/features/style/utils";

const styles = cva({
  base: [
    "inline-flex w-fit min-w-0 shrink-0 cursor-pointer items-center justify-center gap-8 whitespace-nowrap",
    "font-pixel-square text-cta uppercase",
    "transition-[colors_transform] duration-200 ease-out",
    "active:scale-[0.97]",
    "motion-reduce:transition-none motion-reduce:active:scale-100",
    "disabled:pointer-events-none disabled:opacity-50 disabled:grayscale",
  ],
  variants: {
    variant: {
      primary: "h-44 rounded-4 bg-white px-24 text-black hover:bg-white/80",
      underline: "text-white underline underline-offset-4",
    },
  },
  defaultVariants: {
    variant: "primary",
  },
});

export function Button({
  children,
  className,
  asChild,
  leftIcon,
  rightIcon,
  variant,
  disabled,
  // Don't apply default type if we don't know what kind of component we will render.
  type = asChild ? undefined : "button",
  ...props
}: Omit<React.ComponentProps<"button">, "size"> &
  VariantProps<typeof styles> & {
    asChild?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
  }) {
  const Component = asChild ? Slot : "button";

  return (
    <Component disabled={disabled} type={type} className={styles({ variant, className })} {...props}>
      <Slottable asChild={asChild} child={children}>
        {(child) => (
          <>
            {leftIcon}
            {child}
            {rightIcon}
          </>
        )}
      </Slottable>
    </Component>
  );
}
