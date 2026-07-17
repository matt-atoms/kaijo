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
      <html lang="en" className={cx([fonts.map((f) => f.variable)])}>
        <body>
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
