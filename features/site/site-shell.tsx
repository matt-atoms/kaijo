import type * as React from "react";
import { ScrambleReveal } from "~/features/kaijo/scramble-reveal";
import { SiteFooter } from "~/features/site/site-footer";
import { SiteHeader } from "~/features/site/site-header";

export type SiteShellProps = {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
};

export function SiteShell(props: SiteShellProps) {
  const { children, showHeader = true, showFooter = true } = props;

  return (
    <div className="page">
      {showHeader && <SiteHeader />}
      <main className="main">{children}</main>
      {showFooter && <SiteFooter />}
      <ScrambleReveal />
    </div>
  );
}
