"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { z } from "zod";

import { cn } from "@/lib/utils";

/**
 * Partner inquiry form — used in the "For Barbers" section.
 *
 * Kept as a hand-rolled controlled form (no react-hook-form) because:
 *  - We do not ship RHF in this project.
 *  - Three fields with one validation pass each is trivial without a library.
 *
 * On submit we POST to `/api/leads` (Next route handler that proxies to the
 * FastAPI backend at $BACKEND_URL/api/v1/public/partner-leads). The backend
 * applies rate-limiting per IP and uses an empty `honeypot` field to detect
 * bots (filled honeypot = fake-success without a DB write).
 */
export function PartnerForm() {
  const t = useTranslations("forBarbers.form");

  const schema = z.object({
    name: z.string().min(2, t("errors.name")),
    phone: z
      .string()
      .regex(/^\+998\d{9}$/, t("errors.phone")),
    city: z.string().min(2, t("errors.city")),
  });

  const [values, setValues] = useState({ name: "", phone: "", city: "" });
  // Honeypot is intentionally separate from `values` so a bot filling it
  // doesn't trip our visible validation — the field is only ever read at
  // submit time and forwarded to the backend.
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    phone?: string;
    city?: string;
  }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  // Ref-based cooldown: prevents duplicate submissions even if React state
  // hasn't flushed yet (rapid double-click / enter-key spam).
  const lastSubmitAt = useRef(0);

  const onChange = (field: "name" | "phone" | "city") => (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setValues((v) => ({ ...v, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    const now = Date.now();
    if (now - lastSubmitAt.current < 5000) return; // 5 s cooldown between submits
    lastSubmitAt.current = now;
    setSubmitError(null);

    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const next: typeof errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as "name" | "phone" | "city" | undefined;
        if (key && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: parsed.data.name,
          phone: parsed.data.phone,
          city: parsed.data.city,
          honeypot,
          source: "landing",
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        setValues({ name: "", phone: "", city: "" });
        setHoneypot("");
        return;
      }

      // Map API status codes to user-facing messages.
      if (res.status === 400 || res.status === 422) {
        setSubmitError(t("errors.validation"));
      } else if (res.status === 429) {
        setSubmitError(t("errors.rateLimit"));
      } else if (res.status === 502 || res.status === 503) {
        setSubmitError(t("errors.network"));
      } else {
        setSubmitError(t("errors.generic"));
      }
    } catch {
      // Browser-side network failure (offline, DNS, CORS, etc.). The proxy
      // route normally turns upstream failures into 503, so this branch is
      // mostly for "device has no connection at all" scenarios.
      setSubmitError(t("errors.network"));
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center sm:p-10">
        <p className="text-lg font-light text-white">{t("success")}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:p-8"
    >
      <div className="grid gap-5">
        <Field
          id="partner-name"
          label={t("fields.name")}
          placeholder={t("placeholders.name")}
          value={values.name}
          onChange={onChange("name")}
          error={errors.name}
          autoComplete="name"
          disabled={submitting}
        />
        <Field
          id="partner-phone"
          label={t("fields.phone")}
          placeholder="+998 90 123 45 67"
          value={values.phone}
          onChange={onChange("phone")}
          error={errors.phone}
          autoComplete="tel"
          inputMode="tel"
          disabled={submitting}
        />
        <Field
          id="partner-city"
          label={t("fields.city")}
          placeholder={t("placeholders.city")}
          value={values.city}
          onChange={onChange("city")}
          error={errors.city}
          autoComplete="address-level2"
          disabled={submitting}
        />
      </div>

      {/*
        Honeypot — visually hidden, off-screen, taken out of the tab order, and
        marked aria-hidden so assistive tech skips it. Real users don't see or
        focus this field; naive bots that auto-fill every input will, and the
        backend turns that into a fake success without persisting anything.
      */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-9999px",
          width: "1px",
          height: "1px",
          overflow: "hidden",
        }}
      >
        <label htmlFor="partner-website">{t("honeypotLabel")}</label>
        <input
          id="partner-website"
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="mt-6 flex h-11 w-full items-center justify-center rounded-full bg-white px-6 text-sm font-medium text-slate-950 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? t("submitting") : t("submit")}
      </button>

      {submitError ? (
        <p
          role="alert"
          className="mt-4 text-center text-sm text-red-400"
        >
          {submitError}
        </p>
      ) : null}
    </form>
  );
}

function Field({
  id,
  label,
  error,
  ...inputProps
}: {
  id: string;
  label: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="grid gap-2">
      <label
        htmlFor={id}
        className="text-xs font-medium tracking-wide text-slate-300 uppercase"
      >
        {label}
      </label>
      <input
        id={id}
        {...inputProps}
        aria-invalid={Boolean(error)}
        className={cn(
          "h-11 w-full rounded-xl border bg-slate-950/60 px-4 text-sm text-white placeholder:text-slate-500 outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-60",
          error
            ? "border-red-500/60 focus-visible:border-red-500"
            : "border-white/10 focus-visible:border-white/40",
        )}
      />
      {error ? (
        <p role="alert" className="text-xs text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
