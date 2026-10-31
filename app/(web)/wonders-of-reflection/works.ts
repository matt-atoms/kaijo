/** The eight works, in the order of the LuminAir "Wonders of Reflection" menu, each with its
    paired cocktail. Images live in public/wonders-of-reflection/ (file number ≠ menu position). */
export type ReflectionWork = { id: string; src: string; cocktail: string; place: string };

export const WORKS: ReflectionWork[] = [
  { id: "01", src: "/wonders-of-reflection/07.jpg", cocktail: "Salar", place: "Uyuni, Bolivia" },
  { id: "02", src: "/wonders-of-reflection/04.jpg", cocktail: "Upside Down Fuji", place: "Lake Motosu, Japan" },
  { id: "03", src: "/wonders-of-reflection/08.jpg", cocktail: "Feather of Light", place: "Udaipur, India" },
  { id: "04", src: "/wonders-of-reflection/05.jpg", cocktail: "Opal", place: "Coober Pedy, Australia" },
  { id: "05", src: "/wonders-of-reflection/03.jpg", cocktail: "Hall of Mirrors", place: "Versailles, France" },
  { id: "06", src: "/wonders-of-reflection/06.jpg", cocktail: "Maraya", place: "AlUla, Saudi Arabia" },
  { id: "07", src: "/wonders-of-reflection/02.jpg", cocktail: "Disco Fever", place: "New York, USA" },
  { id: "08", src: "/wonders-of-reflection/01.jpg", cocktail: "Golden Bend", place: "Amsterdam, The Netherlands" },
];

export const PRICE_SINGLE = 149;
export const PRICE_SET = 795;
export const EDITION = 25;
