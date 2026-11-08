"use client";

import { useState, type FormEvent } from "react";
import { useI18n } from "@/components/providers/LocaleProvider";

type K = "name" | "email" | "message";

export function ContactForm() {
  const { t } = useI18n();
  const f = t.forms;
  const [v, setV] = useState<Record<K, string>>({ name: "", email: "", message: "" });
  const [err, setErr] = useState<Partial<Record<K, string>>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const ne: Partial<Record<K, string>> = {};
    (Object.keys(v) as K[]).forEach((k) => { if (!v[k].trim()) ne[k] = f.errors.required; });
    if (v.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) ne.email = f.errors.email;
    setErr(ne);
    if (Object.keys(ne).length) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(v) });
      if (!res.ok) throw new Error();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") return <p role="status" className="t-lead text-wine!">{f.sent}</p>;

  const fld = (k: K, label: string, type = "text", auto?: string) => (
    <div>
      <label htmlFor={`c-${k}`} className="t-label field-label">{label}</label>
      {k === "message" ? (
        <textarea id={`c-${k}`} rows={6} value={v[k]} onChange={(e) => setV({ ...v, [k]: e.target.value })} className="field resize-y" aria-invalid={!!err[k]} aria-describedby={err[k] ? `c-${k}-e` : undefined} />
      ) : (
        <input id={`c-${k}`} type={type} autoComplete={auto} value={v[k]} onChange={(e) => setV({ ...v, [k]: e.target.value })} className="field" aria-invalid={!!err[k]} aria-describedby={err[k] ? `c-${k}-e` : undefined} />
      )}
      {err[k] && <p id={`c-${k}-e`} className="field-error">{err[k]}</p>}
    </div>
  );

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-6">
      {fld("name", f.name, "text", "name")}
      {fld("email", f.email, "email", "email")}
      {fld("message", f.message)}
      {status === "error" && <p role="alert" className="field-error">{f.errors.generic}</p>}
      <button type="submit" className="btn btn-primary justify-self-start" disabled={status === "loading"}>{status === "loading" ? f.sending : f.send}</button>
    </form>
  );
}
