"use client";

import * as React from "react";

const STORAGE_KEY = "kaijo-theme";

/** id "green" is the default (no data-theme attribute). Swatches mirror the CSS in global.css. */
const THEMES = [
  { id: "white", label: "White", swatch: "#ffffff" },
  { id: "dark", label: "Dark", swatch: "#17181a" },
  { id: "red", label: "Deep red", swatch: "#b23a30" },
  { id: "blue", label: "Deep blue", swatch: "#173a5a" },
  { id: "green", label: "Bright green", swatch: "#32cd32" },
  { id: "green-dark", label: "Deep green", swatch: "#35664a" },
] as const;

function applyTheme(id: string) {
  const root = document.documentElement;
  if (id === "green") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", id);
  }
}

export function ThemeSwitcher() {
  const [active, setActive] = React.useState("green");

  React.useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    setActive(current || "green");
  }, []);

  function pick(id: string) {
    setActive(id);
    applyTheme(id);
    try {
      window.localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // ignore storage failures (private mode etc.)
    }
  }

  return (
    <div className="theme-switcher">
      <span className="theme-switcher_label">Background</span>
      {/* biome-ignore lint/a11y/useSemanticElements: a labelled group of colour buttons, not a form fieldset. */}
      <div className="theme-switcher_dots" role="group" aria-label="Background colour">
        {THEMES.map((theme) => (
          <button
            key={theme.id}
            type="button"
            className="theme-dot"
            data-active={active === theme.id || undefined}
            style={{ "--dot": theme.swatch } as React.CSSProperties}
            aria-label={theme.label}
            aria-pressed={active === theme.id}
            onClick={() => pick(theme.id)}
          />
        ))}
      </div>
    </div>
  );
}
