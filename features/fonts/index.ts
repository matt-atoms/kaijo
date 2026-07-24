import { GeistMono } from "geist/font/mono";
import { GeistPixelCircle, GeistPixelGrid, GeistPixelLine, GeistPixelSquare, GeistPixelTriangle } from "geist/font/pixel";
import { GeistSans } from "geist/font/sans";
import { Big_Shoulders } from "next/font/google";

/**
 * Brand wordmark face (top-left "Joep Hijwegen"). A free, self-hosted stand-in for Edito Type's
 * "Arch": a condensed, architectural grotesque with vertical presence. Exposed as `--font-wordmark`
 * via the theme token in features/style/typography.css.
 */
const BigShoulders = Big_Shoulders({
  subsets: ["latin"],
  variable: "--font-big-shoulders",
  display: "swap",
});

/**
 * Loaded on `<html>` so `--font-geist-*` variables exist for Tailwind `font-sans`, `font-mono`,
 * and `font-pixel-*` utilities.
 */
export const fonts = [
  GeistSans,
  GeistMono,
  GeistPixelSquare,
  GeistPixelGrid,
  GeistPixelCircle,
  GeistPixelTriangle,
  GeistPixelLine,
  BigShoulders,
];
