"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useI18n } from "@/components/providers/LocaleProvider";
import { useCart } from "@/components/providers/CartProvider";
import { fill, formatPrice } from "@/i18n";
import { OrderTotals } from "./CartView";
import { ArrowIcon, CheckIcon } from "@/components/ui/Icons";

type Field = "fullName" | "email" | "phone" | "city" | "address" | "notes";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[0-9\s-]{7,16}$/;

export function CheckoutForm() {
  const { t, locale } = useI18n();
  const f = t.forms;
  const { items, hydrated, clear } = useCart();
  const [values, setValues] = useState<Record<Field, string>>({ fullName: "", email: "", phone: "", city: "Doha", address: "", notes: "" });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [done, setDone] = useState<{ reference: string; email: string } | null>(null);

  const set = (k: Field) => (e: { target: { value: string } }) => setValues((v) => ({ ...v, [k]: e.target.value }));

  function validate() {
    const e: Partial<Record<Field, string>> = {};
    (["fullName", "email", "phone", "city", "address"] as Field[]).forEach((k) => { if (!values[k].trim()) e[k] = f.errors.required; });
    if (values.email && !EMAIL_RE.test(values.email.trim())) e.email = f.errors.email;
    if (values.phone && !PHONE_RE.test(values.phone.trim())) e.phone = f.errors.phone;
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    if (!validate()) {
      document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, locale, items: items.map((i) => ({ slug: i.slug, size: i.size, color: i.color.en, qty: i.qty })) }),
      });
      const data = (await res.json()) as { ok: boolean; reference?: string };
      if (!res.ok || !data.ok || !data.reference) throw new Error();
      setDone({ reference: data.reference, email: values.email });
      clear();
      window.scrollTo({ top: 0 });
    } catch {
      setStatus("error");
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center" role="status">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full border border-wine text-wine"><CheckIcon size={26} /></span>
        <h2 className="t-h1 mt-8">{t.cart.successTitle}</h2>
        <p className="t-lead mt-6">{fill(t.cart.successBody, { email: done.email })}</p>
        <p className="t-label mt-8 text-muted">{t.cart.reference}</p>
        <p className="t-h3 ltr-nums mt-2 text-wine">{done.reference}</p>
        <Link href="/shop" className="btn btn-outline mt-10">{t.common.actions.continue}</Link>
      </div>
    );
  }

  if (!hydrated) return <div className="min-h-[40vh]" aria-busy="true" />;
  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="t-h2">{t.cart.empty}</p>
        <Link href="/shop" className="btn btn-primary mt-10">{t.common.actions.shopNow}</Link>
      </div>
    );
  }

  const input = (k: Field, label: string, type = "text", auto?: string, full = false) => (
    <div className={full ? "sm:col-span-2" : ""}>
      <label htmlFor={k} className="t-label field-label">{label}</label>
      <input id={k} name={k} type={type} autoComplete={auto} value={values[k]} onChange={set(k)} className="field" aria-invalid={!!errors[k]} aria-describedby={errors[k] ? `${k}-err` : undefined} />
      {errors[k] && <p id={`${k}-err`} className="field-error">{errors[k]}</p>}
    </div>
  );

  return (
    <form onSubmit={onSubmit} noValidate className="grid grid-cols-1 gap-14 lg:grid-cols-12">
      <div className="grid content-start gap-6 sm:grid-cols-2 lg:col-span-7">
        {input("fullName", f.fullName, "text", "name", true)}
        {input("email", f.email, "email", "email")}
        {input("phone", f.phone, "tel", "tel")}
        {input("city", f.city, "text", "address-level2")}
        {input("address", f.address, "text", "street-address")}
        <div className="sm:col-span-2">
          <label htmlFor="notes" className="t-label field-label">{f.notes}</label>
          <textarea id="notes" rows={4} value={values.notes} onChange={set("notes")} className="field resize-y" />
        </div>
        <p className="t-small sm:col-span-2">{t.cart.payment}</p>
      </div>
      <aside className="lg:col-span-5" aria-label={t.cart.summary}>
        <div className="bg-linen p-6 sm:p-8 lg:sticky lg:top-[calc(var(--header-h)+32px)]">
          <h2 className="t-h3 mb-6">{t.cart.summary}</h2>
          <ul className="mb-6 space-y-3 border-b hairline pb-6">
            {items.map((i) => (
              <li key={i.key} className="t-small flex justify-between gap-4 text-ink!">
                <span>{locale === "ar" ? i.nameAr : i.nameEn} <span className="text-muted">× <span className="ltr-nums">{i.qty}</span></span></span>
                <span className="shrink-0">{formatPrice(i.price * i.qty, locale)}</span>
              </li>
            ))}
          </ul>
          <OrderTotals />
          {status === "error" && <p role="alert" className="field-error mt-4">{f.errors.generic}</p>}
          <button type="submit" disabled={status === "loading"} className="btn btn-primary mt-8 w-full">
            {status === "loading" ? t.cart.placing : t.cart.placeOrder}
            <ArrowIcon size={16} className="flip-rtl" />
          </button>
        </div>
      </aside>
    </form>
  );
}
