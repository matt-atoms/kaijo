/**
 * "Develop" — a darkroom easter egg for the individual project pages. When on, the project images
 * render as negatives on a pitch-black page and a cursor-following loupe reveals the true colours.
 * The toggle lives in the footer background switcher (only on project pages); the lens lives on the
 * project page. Both stay in sync through the `develop` class on <html> + a window event.
 */
export const DEVELOP_CLASS = "develop";
const EVENT = "kaijo:develop";

export function isDevelopOn(): boolean {
  return typeof document !== "undefined" && document.documentElement.classList.contains(DEVELOP_CLASS);
}

export function setDevelop(on: boolean): void {
  document.documentElement.classList.toggle(DEVELOP_CLASS, on);
  window.dispatchEvent(new CustomEvent<boolean>(EVENT, { detail: on }));
}

export function onDevelopChange(cb: (on: boolean) => void): () => void {
  const handler = (event: Event) => cb((event as CustomEvent<boolean>).detail);
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}
