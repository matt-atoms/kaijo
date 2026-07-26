"use client";

import * as React from "react";

/** Normalise an @handle or URL into a { url, label } pair. */
function instagram(value: string | null | undefined) {
  if (!value) {
    return null;
  }
  const handle = value
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/^@/, "")
    .replace(/\/$/, "");
  return { url: value.startsWith("http") ? value : `https://instagram.com/${handle}`, label: `@${handle}` };
}

type Props = {
  heading?: string | null;
  intro?: string | null;
  email: string;
  instagram?: string | null;
  options: string[];
};

export function WorkshopBookingForm({ heading, intro, email, instagram: instagramValue, options }: Props) {
  const [choice, setChoice] = React.useState(options[0] ?? "");
  const ig = instagram(instagramValue);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const subject = choice ? `Workshop enquiry — ${choice}` : "Workshop enquiry";
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
  }

  return (
    <form className="workshop-booking" onSubmit={handleSubmit}>
      {heading && <div className="workshop-booking_title">{heading}</div>}
      {intro && <p className="workshop-booking_intro">{intro}</p>}
      <label className="workshop-booking_field">
        <span className="workshop-booking_label">I'm interested in</span>
        <select className="workshop-booking_select" value={choice} onChange={(event) => setChoice(event.target.value)}>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" className="workshop-booking_button">
        Send enquiry →
      </button>
      <div className="workshop-booking_contact">
        <a href={`mailto:${email}`} className="workshop-booking_link">
          {email}
        </a>
        {ig && (
          <a href={ig.url} target="_blank" rel="noopener noreferrer" className="workshop-booking_link">
            {ig.label}
          </a>
        )}
      </div>
    </form>
  );
}
