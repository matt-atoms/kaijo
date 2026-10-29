import type { Metadata } from "next";
import { seo } from "~/features/site/seo/utils";
import { ExhibitionTheme } from "./exhibition-theme";
import { ExhibitionWorks } from "./exhibition-works";
import { EDITION } from "./works";

// Unlisted launch page — never indexed.
export async function generateMetadata(): Promise<Metadata> {
  return await seo({ title: "Wonders of Reflection", robots: "noindex, nofollow" });
}

export default function WondersOfReflectionPage() {
  return (
    <>
      <ExhibitionTheme />
      <div className="wor">
        <header className="wor-hero">
          <div className="wor-hero_media">
            {/* biome-ignore lint/performance/noImgElement: static public image on a bespoke page. */}
            <img
              src="/wonders-of-reflection/01.jpg"
              alt="Wonders of Reflection — a building reflected in a wet Amsterdam street"
            />
          </div>
          <div className="wor-hero_text">
            <p className="wor-eyebrow">Exhibition · LuminAir, Amsterdam</p>
            <h1 className="wor-title">Wonders of Reflection</h1>
            <p className="wor-lead">
              Eight photographs by Joep Hijwegen, each turning an everyday reflection — in water, glass or metal — into an
              abstract image. Shown at LuminAir around a central mirror, paired with a cocktail menu built on the same idea.
            </p>
            <p className="wor-meta">From 3 November 2026 · LuminAir, Amsterdam</p>
            <a className="wor-cta" href="#prints">
              Buy a print →
            </a>
          </div>
        </header>

        <section className="wor-section">
          <h2 className="wor-h2">The exhibition</h2>
          <div className="wor-prose">
            <p>
              <em>Wonders of Reflection</em> is a collaboration between Joep Hijwegen and LuminAir, the Amsterdam cocktail bar
              whose signature drinks are always drawn from light and air. This season the thread is reflection: images in which a
              passing reflection becomes something abstract — colour, pattern and texture loosened from the thing that cast it.
            </p>
            <p>
              At LuminAir the eight works hang around a central mirror, so guests find their own reflection among the photographs.
              Each image is paired with a cocktail built from the same starting point — a triangle of inspiration, photography and
              taste.
            </p>
            <p>
              One pairing sets the cocktail <em>Salar</em>, inspired by the Bolivian salt flats, beside a photograph of ice
              forming in Amsterdam's Sarphatipark. Though the places are opposites, the deep blue, the ice structure and the
              hexagonal patterns line up exactly — in the photograph, in the drink and in the salt tuile in the glass. The menu is
              an invitation to slow down and find the hidden detail in both the image and the glass.
            </p>
          </div>
        </section>

        <section className="wor-section" id="prints">
          <h2 className="wor-h2">Buy a print</h2>
          <p className="wor-prose wor-prose--narrow">
            The eight works are offered as prints at a lower price point than the fine-art editions: a 12 × 18 cm image on 15 × 20
            cm archival rag baryta paper with white borders, unframed. Each is an edition of {EDITION} and comes with a free copy
            of the book. Same paper as the fine-art prints — without the framing.
          </p>
          <ExhibitionWorks />
        </section>

        <section className="wor-section">
          <h2 className="wor-h2">More from Joep</h2>
          <p className="wor-prose wor-prose--narrow">
            Amsterdam-based photographer working across personal projects, editorial commissions and brand collaborations.
          </p>
          <nav className="wor-links">
            <a href="/work">Selected work →</a>
            <a href="/workshops">Workshops →</a>
            <a href="/store">Books &amp; prints →</a>
            <a href="/info">About →</a>
            <a href="https://www.instagram.com/joephijwegen" target="_blank" rel="noreferrer noopener">
              Instagram ↗
            </a>
          </nav>
        </section>

        <footer className="wor-foot">
          <span>Wonders of Reflection — Joep Hijwegen × LuminAir, Amsterdam.</span>
          <a href="https://www.luminairamsterdam.com" target="_blank" rel="noreferrer noopener">
            luminairamsterdam.com ↗
          </a>
        </footer>
      </div>
    </>
  );
}
