"use client";

import * as React from "react";
import { cx } from "~/features/style/utils";

type Status = "idle" | "sending" | "success" | "error";

type Props = {
  /** Label on the collapsed trigger (a " →" cue is appended). */
  triggerLabel?: string;
  /** Context-specific look for the trigger button (footer link vs. inline CTA). */
  triggerClassName?: string;
  /** Extra class on the expanded form card (e.g. to size it within the footer). */
  formClassName?: string;
  /** Heading shown inside the open form. */
  title?: string;
  /** Pre-fills the subject (e.g. "Workshop enquiry" from the workshops page). */
  defaultSubject?: string;
};

/**
 * A fold-out "get in touch" enquiry — reuses the workshop/print enquiry pattern and styles, posting
 * to `/api/contact-enquiry` (Resend). Lets a visitor send an email without opening their mail client.
 */
export function GetInTouchForm({
  triggerLabel = "Get in touch",
  triggerClassName,
  formClassName,
  title = "Get in touch",
  defaultSubject = "",
}: Props) {
  const [expanded, setExpanded] = React.useState(false);
  const [subject, setSubject] = React.useState(defaultSubject);
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [company, setCompany] = React.useState(""); // honeypot
  const [status, setStatus] = React.useState<Status>("idle");
  const [error, setError] = React.useState<string | null>(null);
  const subjectRef = React.useRef<HTMLInputElement>(null);
  const emailRef = React.useRef<HTMLInputElement>(null);

  function open() {
    setExpanded(true);
    // Focus the first empty field once the form renders.
    window.requestAnimationFrame(() => (defaultSubject ? emailRef : subjectRef).current?.focus());
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError(null);
    try {
      const response = await fetch("/api/contact-enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, email, message, company }),
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
      <button type="button" className={cx("contact-trigger", triggerClassName)} onClick={open} aria-expanded={false}>
        {triggerLabel} →
      </button>
    );
  }

  if (status === "success") {
    return (
      <div className={cx("workshop-booking workshop-booking--expanded", formClassName)}>
        <div className="workshop-booking_title">{title}</div>
        <p className="workshop-booking_success">Thanks — your message is on its way. I'll be in touch shortly.</p>
      </div>
    );
  }

  return (
    <form className={cx("workshop-booking workshop-booking--expanded", formClassName)} onSubmit={handleSubmit}>
      <div className="workshop-booking_title">{title}</div>
      <label className="workshop-booking_field">
        <span className="workshop-booking_label">Subject</span>
        <input
          ref={subjectRef}
          type="text"
          className="workshop-booking_input"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          required
          placeholder="What's this about?"
        />
      </label>
      <label className="workshop-booking_field">
        <span className="workshop-booking_label">Your email</span>
        <input
          ref={emailRef}
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
          placeholder="A few lines about what you're after…"
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
        {status === "sending" ? "Sending…" : "Send message →"}
      </button>
    </form>
  );
}
