"use client";

import { useTimeout } from "@mantine/hooks";
import * as React from "react";
import { Button } from "~/components/button";
import { type ActionResult, submitContactForm } from "~/features/page-builder/sections/contact-form-section/actions";
import { SUBMISSION_TIME_FIELD_NAME } from "~/features/spam-prevention/constants";
import { FormHoneypot } from "~/features/spam-prevention/form-honeypot";
import { useSpamPrevention } from "~/features/spam-prevention/use-spam-prevention";
import { cx } from "~/features/style/utils";
import { IS_DEV } from "~/features/utils/constants";

const initialState: ActionResult = { success: false as const, error: "", fieldErrors: {} };

const fieldClassName =
  "block w-full rounded-4 border border-white/20 bg-white/5 px-12 py-10 text-body-10 transition-colors duration-160 ease-out hover:border-white/40 disabled:opacity-50";

type FieldShellProps = {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
};

function FieldShell({ id, label, error, children }: FieldShellProps) {
  return (
    <div className="flex flex-col gap-6">
      <label className="font-pixel-square text-caption text-white/60 uppercase" htmlFor={id}>
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-[red] text-caption">
          {error}
        </p>
      )}
    </div>
  );
}

type FormInputProps = Omit<React.ComponentProps<"input">, "id"> & {
  id: string;
  label: string;
  error?: string;
};

function FormInput({ id, label, error, className, ...props }: FormInputProps) {
  return (
    <FieldShell id={id} label={label} error={error}>
      <input
        {...props}
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cx(fieldClassName, className)}
      />
    </FieldShell>
  );
}

type FormTextareaProps = Omit<React.ComponentProps<"textarea">, "id"> & {
  id: string;
  label: string;
  error?: string;
};

function FormTextarea({ id, label, error, className, ...props }: FormTextareaProps) {
  return (
    <FieldShell id={id} label={label} error={error}>
      <textarea
        {...props}
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cx(fieldClassName, className)}
      />
    </FieldShell>
  );
}

export function ContactForm() {
  const [state, formAction, isPending] = React.useActionState(submitContactForm, initialState);
  const formRef = React.useRef<HTMLFormElement>(null);
  const submissionTimeRef = React.useRef<HTMLInputElement>(null);
  const [showSuccess, setShowSuccess] = React.useState(false);

  const [spamError, setSpamError] = React.useState<string | null>(null);

  const { checkSpam, getMetadata, reset } = useSpamPrevention({
    formRef,
    debug: IS_DEV,
  });

  React.useEffect(() => {
    if (state.success) {
      setShowSuccess(true);
      setSpamError(null);
    }
  }, [state.success]);

  const handleSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      if (!formRef.current) {
        return;
      }

      const spamCheck = checkSpam(formRef.current);

      if (spamCheck.isSpam) {
        event.preventDefault();
        setSpamError(null);

        if (IS_DEV) {
          console.warn("[Contact Form] Spam detected - submission blocked", {
            reason: spamCheck.reason,
          });
        }

        setSpamError(spamCheck.message);
        return;
      }

      // Not spam: write the fill time into the hidden field BEFORE React snapshots the form for
      // the action, so the server-side timing check in `detectSpam` receives a real value.
      if (submissionTimeRef.current) {
        submissionTimeRef.current.value = String(getMetadata().fillTime);
      }

      setSpamError(null);
    },
    [checkSpam, getMetadata]
  );

  const { start: startSuccessReset, clear: clearSuccessReset } = useTimeout(() => {
    setShowSuccess(false);
    formRef.current?.reset();
    reset();
  }, 4000);

  React.useEffect(() => {
    if (showSuccess) {
      startSuccessReset();
      return () => clearSuccessReset();
    }
    clearSuccessReset();
  }, [showSuccess, startSuccessReset, clearSuccessReset]);

  const isDisabled = isPending || showSuccess;
  const values = !state.success ? state.values : undefined;
  const fieldErrors = !state.success ? state.fieldErrors : undefined;

  return (
    <form ref={formRef} onSubmit={handleSubmit} action={formAction} className="flex flex-col gap-24">
      <FormHoneypot />
      <input ref={submissionTimeRef} type="hidden" name={SUBMISSION_TIME_FIELD_NAME} />

      <FormInput
        id="firstName"
        name="firstName"
        label="First Name"
        type="text"
        autoComplete="given-name"
        defaultValue={values?.firstName}
        disabled={isDisabled}
        error={fieldErrors?.firstName}
      />

      <FormInput
        id="lastName"
        name="lastName"
        label="Last Name"
        type="text"
        autoComplete="family-name"
        defaultValue={values?.lastName}
        disabled={isDisabled}
        error={fieldErrors?.lastName}
      />

      <FormInput
        id="email"
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        defaultValue={values?.email}
        disabled={isDisabled}
        error={fieldErrors?.email}
      />

      <FormTextarea
        id="message"
        name="message"
        label="Message"
        rows={5}
        defaultValue={values?.message}
        disabled={isDisabled}
        error={fieldErrors?.message}
      />

      <Button type="submit" disabled={isDisabled}>
        {isPending ? "Sending..." : "Send Message"}
      </Button>

      {showSuccess && <p className="text-body-10 text-white/75">Thank you! Your message has been sent successfully.</p>}
      {spamError && <p className="text-[red] text-caption">{spamError}</p>}
      {!state.success && state.error && !spamError && <p className="text-[red] text-caption">{state.error}</p>}
    </form>
  );
}
