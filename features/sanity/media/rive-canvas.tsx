"use client";

import * as RiveReact from "@rive-app/react-canvas";
import * as React from "react";

export type RiveCanvasProps = {
  url: string;
  loop: boolean;
  /** Play/pause signal from the wrapper's viewport observer. */
  shouldAutoplayInView: boolean;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * The part of `SanityRive` that touches the Rive runtime. Loaded lazily (see `rive.tsx`) so the
 * runtime chunk stays out of pages that render no Rive media.
 */
export function RiveCanvas({ url, loop, shouldAutoplayInView, className, style }: RiveCanvasProps) {
  const shouldAutoplayInViewRef = React.useRef(shouldAutoplayInView);
  shouldAutoplayInViewRef.current = shouldAutoplayInView;

  const { rive: riveController, RiveComponent } = RiveReact.useRive(
    {
      src: url,
      autoplay: false,
      layout: new RiveReact.Layout({
        fit: RiveReact.Fit.Contain,
      }),
    },
    {
      useDevicePixelRatio: true,
    }
  );

  React.useEffect(() => {
    if (!riveController) {
      return;
    }

    if (shouldAutoplayInView) {
      riveController.play();
      return;
    }

    riveController.pause();
  }, [riveController, shouldAutoplayInView]);

  React.useEffect(() => {
    if (!riveController) {
      return;
    }

    if (loop) {
      const restartIfNeeded = () => {
        if (!shouldAutoplayInViewRef.current) {
          return;
        }

        riveController.play();
      };

      riveController.on(RiveReact.EventType.Stop, restartIfNeeded);
      return () => {
        riveController.off(RiveReact.EventType.Stop, restartIfNeeded);
      };
    }

    const stopAfterLoop = () => {
      riveController.stop();
    };

    riveController.on(RiveReact.EventType.Loop, stopAfterLoop);
    return () => {
      riveController.off(RiveReact.EventType.Loop, stopAfterLoop);
    };
  }, [riveController, loop]);

  return <RiveComponent className={className} style={style} />;
}
