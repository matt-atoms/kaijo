/** The eight works in the "Wonders of Reflection" exhibition. Images live in public/. */
export type ReflectionWork = { id: string; src: string; ratio: number };

export const WORKS: ReflectionWork[] = [
  { id: "01", src: "/wonders-of-reflection/01.jpg", ratio: 1125 / 1500 },
  { id: "02", src: "/wonders-of-reflection/02.jpg", ratio: 1331 / 2000 },
  { id: "03", src: "/wonders-of-reflection/03.jpg", ratio: 1331 / 2000 },
  { id: "04", src: "/wonders-of-reflection/04.jpg", ratio: 1331 / 2000 },
  { id: "05", src: "/wonders-of-reflection/05.jpg", ratio: 1331 / 2000 },
  { id: "06", src: "/wonders-of-reflection/06.jpg", ratio: 1331 / 2000 },
  { id: "07", src: "/wonders-of-reflection/07.jpg", ratio: 1333 / 2000 },
  { id: "08", src: "/wonders-of-reflection/08.jpg", ratio: 1333 / 2000 },
];

export const PRICE_SINGLE = 149;
export const PRICE_VOUCHER = 119;
export const PRICE_SET = 795;
export const EDITION = 25;
