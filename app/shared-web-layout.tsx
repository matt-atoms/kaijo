import dynamic from "next/dynamic";
import Script from "next/script";
import * as React from "react";
import { preconnect, prefetchDNS } from "react-dom";
import { env } from "~/env";
import { KeyboardFocusMode } from "~/features/dom/keyboard-focus-mode";
import { DraftModeProvider } from "~/features/draft-mode/context";
import { fonts } from "~/features/fonts";
import { MotionProvider } from "~/features/motion/lazy-motion";
import { cx } from "~/features/style/utils";
import { ViewTransitions } from "~/features/view-transition/app-view-transitions";

const SanityLive = dynamic(() => import("~/features/sanity/client").then((mod) => mod.SanityLive));
const VisualEditing = dynamic(() => import("next-sanity/visual-editing").then((mod) => mod.VisualEditing));
const DisableDraftMode = dynamic(() => import("~/features/draft-mode").then((mod) => mod.DisableDraftMode));

/**
 * Restrict Umami to the public hostnames (apex + www) so preview visits neither send events nor log
 * gateway 400s; returns null on localhost setups so local prod builds skip the script entirely.
 */
function umamiDomains(): string | null {
  const apex = new URL(env.NEXT_PUBLIC_URL).hostname.replace(/^www\./, "");

  if (apex === "localhost" || apex === "127.0.0.1") {
    return null;
  }

  return `${apex},www.${apex}`;
}

export type SharedWebLayoutProps = {
  children: React.ReactNode;
  isDraft: boolean;
  bodyStart?: React.ReactNode;
  bodyEnd?: React.ReactNode;
};

export function SharedWebLayout(props: SharedWebLayoutProps) {
  const trackedDomains = umamiDomains();

  preconnect("https://cdn.sanity.io");
  if (env.NEXT_PUBLIC_UNAMI_WEBSITE_ID && trackedDomains) {
    prefetchDNS("https://cloud.umami.is");
  }

  return (
    <ViewTransitions>
      {/* suppressHydrationWarning: the reveal bootstrap script below stamps data-reveal on <html>
          before hydration; React 19 would otherwise warn about the attribute it didn't render. */}
      <html lang="en" className={cx([fonts.map((f) => f.variable)])} suppressHydrationWarning>
        <body>
          {/* Fades the page in once fonts are ready (max 1.2s), avoiding the fallback-font layout
              flash. The data-reveal attribute is owned entirely by this script (never rendered by
              React, so hydration ignores it); it runs synchronously before first paint. CSS lives
              in features/style/global.css. */}
          <script
            // biome-ignore lint/security/noDangerouslySetInnerHtml: static inline bootstrap script.
            dangerouslySetInnerHTML={{
              __html: `(function () {
  var d = document.documentElement;
  d.setAttribute("data-reveal", "pending");
  var fonts = document.fonts ? document.fonts.ready : Promise.resolve();
  Promise.race([fonts, new Promise(function (r) { setTimeout(r, 1200); })]).then(function () {
    requestAnimationFrame(function () {
      d.setAttribute("data-reveal", "done");
    });
  });
})();`,
            }}
          />
          <MotionProvider>
            <KeyboardFocusMode />
            {props.bodyStart}
            <DraftModeProvider isDraft={props.isDraft}>
              {props.isDraft && (
                <React.Suspense fallback={null}>
                  <SanityLive />
                  <VisualEditing />
                  <DisableDraftMode />
                </React.Suspense>
              )}
              {props.children}
            </DraftModeProvider>
            {env.NEXT_PUBLIC_UNAMI_WEBSITE_ID && trackedDomains && (
              <Script
                defer
                src="https://cloud.umami.is/script.js"
                data-website-id={env.NEXT_PUBLIC_UNAMI_WEBSITE_ID}
                data-domains={trackedDomains}
              />
            )}
            {props.bodyEnd}
          </MotionProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}
