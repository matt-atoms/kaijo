"use client";

import * as React from "react";

type Props = {
  heading?: string | null;
  intro?: string | null;
  options: string[];
};

type Status = "idle" | "sending" | "success" | "error";

export function WorkshopBookingForm({ heading, intro, options }: Props) {
  const [expanded, setExpanded] = React.useState(false);
  const [choice, setChoice] = React.useState(options[0] ?? "");
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [company, setCompany] = React.useState(""); // honeypot
  const [status, setStatus] = React.useState<Status>("idle");
  const [error, setError] = React.useState<string | null>(null);
  const selectRef = React.useRef<HTMLSelectElement>(null);

  function open() {
    setExpanded(true);
    // Move focus into the form once it renders.
    window.requestAnimationFrame(() => selectRef.current?.focus());
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError(null);
    try {
      const response = await fetch("/api/workshop-enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ option: choice, email, message, company }),
      });
      const data = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || "Something went wrong. Please try again.");
      }
      setStatus("success");
    } catch (submitError) {
      setStatus("error");
      setError(submitError instanceof Error ? submitError.message : "Something went wrong. Please try again.");
    }
  }

  if (!expanded) {
    return (
      <button type="button" className="workshop-booking workshop-booking--collapsed" onClick={open} aria-expanded={false}>
        {heading && <span className="workshop-booking_title">{heading}</span>}
        {intro && <span className="workshop-booking_intro">{intro}</span>}
        <span className="workshop-booking_cue">Enquire →</span>
      </button>
    );
  }

  if (status === "success") {
    return (
      <div className="workshop-booking workshop-booking--expanded">
        {heading && <div className="workshop-booking_title">{heading}</div>}
        <p className="workshop-booking_success">Thanks — your enquiry is on its way. I'll be in touch shortly.</p>
      </div>
    );
  }

  return (
    <form className="workshop-booking workshop-booking--expanded" onSubmit={handleSubmit}>
      {heading && <div className="workshop-booking_title">{heading}</div>}
      <label className="workshop-booking_field">
        <span className="workshop-booking_label">I'm interested in</span>
        <select
          ref={selectRef}
          className="workshop-booking_select"
          value={choice}
          onChange={(event) => setChoice(event.target.value)}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <label className="workshop-booking_field">
        <span className="workshop-booking_label">Your email</span>
        <input
          type="email"
          className="workshop-booking_input"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
          placeholder="you@example.com"
        />
      </label>
      <label className="workshop-booking_field">
        <span className="workshop-booking_label">Message</span>
        <textarea
          className="workshop-booking_textarea"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={4}
          required
          placeholder="A little about what you're after…"
        />
      </label>
      {/* Honeypot — hidden from users, catches bots. */}
      <input
        type="text"
        className="workshop-booking_honeypot"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={company}
        onChange={(event) => setCompany(event.target.value)}
      />
      {status === "error" && error && (
        <p className="workshop-booking_error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="workshop-booking_button" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Send enquiry →"}
      </button>
    </form>
  );
}
