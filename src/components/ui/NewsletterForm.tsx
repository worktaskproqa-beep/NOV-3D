"use client";

import { useId, useState, type FormEvent } from "react";
import { useI18n } from "@/components/providers/LocaleProvider";
import { ArrowIcon } from "./Icons";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function NewsletterForm({ variant = "full" }: { variant?: "full" | "compact" }) {
  const { t, locale } = useI18n();
  const f = t.forms;
  const id = useId();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "already">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return setError(f.errors.required);
    if (!EMAIL_RE.test(email.trim())) return setError(f.errors.email);
    setError(null);
    setState("loading");
    try {
      const res = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, locale }) });
      const data = (await res.json()) as { ok: boolean; already?: boolean };
      if (!res.ok || !data.ok) throw new Error();
      setState(data.already ? "already" : "done");
    } catch {
      setState("idle");
      setError(f.errors.generic);
    }
  }

  const dark = variant === "compact";
  if (state === "done" || state === "already") {
    return (
      <p role="status" className={`t-body ${dark ? "text-parchment" : "text-wine"}`}>
        {state === "done" ? f.subscribed : f.already}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="w-full">
      <label htmlFor={id} className={`t-label field-label ${dark ? "text-parchment/80" : "text-muted"}`}>
        {f.email}
      </label>
      <div className={`flex items-stretch border ${dark ? "border-parchment/50" : "border-ink/70"} transition-colors focus-within:border-current`}>
        <input
          id={id}
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={f.emailPlaceholder}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-err` : undefined}
          className={`min-h-12 w-full min-w-0 flex-1 bg-transparent px-4 outline-none placeholder:opacity-50 ${dark ? "text-ivory" : "text-ink"}`}
          style={{ direction: "ltr", textAlign: locale === "ar" ? "end" : "start" }}
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className={`flex min-w-12 items-center justify-center gap-3 px-5 transition-colors duration-200 ${dark ? "bg-parchment text-wine-deep hover:bg-ivory" : "bg-wine text-ivory hover:bg-wine-deep"}`}
          aria-label={variant === "compact" ? f.subscribe : undefined}
        >
          {variant === "full" && <span className="t-label hidden sm:inline">{state === "loading" ? f.subscribing : f.subscribe}</span>}
          <ArrowIcon size={18} className="flip-rtl" />
        </button>
      </div>
      {error && (
        <p id={`${id}-err`} role="alert" className={`field-error ${dark ? "text-[#f1b8b1]!" : ""}`}>
          {error}
        </p>
      )}
    </form>
  );
}
