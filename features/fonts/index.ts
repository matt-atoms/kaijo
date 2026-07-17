import { GeistMono } from "geist/font/mono";
import { GeistPixelCircle, GeistPixelGrid, GeistPixelLine, GeistPixelSquare, GeistPixelTriangle } from "geist/font/pixel";
import { GeistSans } from "geist/font/sans";

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
];
