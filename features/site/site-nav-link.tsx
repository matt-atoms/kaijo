"use client";

import { usePathname } from "next/navigation";
import { stegaClean } from "next-sanity";
import { AnimatedText } from "~/components/animated-text";
import type { MotionViewportInput } from "~/features/motion/viewport";
import { SanityLink } from "~/features/sanity/link";
import type { LinkFragmentResult } from "~/features/sanity/link/fragment";
import { cx } from "~/features/style/utils";

export function SiteNavLink({
  link,
  animationDelay,
  viewport,
}: {
  link: LinkFragmentResult;
  animationDelay?: number;
  viewport?: MotionViewportInput;
}) {
  const pathname = usePathname();
  // stegaClean: in preview, `link.href` carries invisible stega characters that break strict comparison.
  const isActive = pathname === stegaClean(link.href).split(/[?#]/)[0];

  return (
    <SanityLink
      link={link}
      aria-current={isActive ? "page" : undefined}
      className={cx(
        "text-body-10 text-white/75 transition-colors duration-200 ease-out hover:text-white",
        isActive && "text-white underline underline-offset-4"
      )}
    >
      <AnimatedText animationDelay={animationDelay} viewport={viewport}>
        {link.text}
      </AnimatedText>
    </SanityLink>
  );
}
