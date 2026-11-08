import type { Metadata } from "next";
import { getI18n } from "@/i18n/server";
import { ContactForm } from "@/components/ui/ContactForm";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.common.nav.contact };
}

export default async function ContactPage() {
  const { t } = await getI18n();
  const c = t.common.contact;
  const f = t.common.footer;
  return (
    <div className="bg-ivory">
      <section className="container-wide grid grid-cols-1 gap-16 pb-[var(--section-y)] pt-16 md:grid-cols-12 md:pt-28">
        <div className="md:col-span-5">
          <p className="t-label text-wine" data-reveal>{c.eyebrow}</p>
          <h1 className="lines t-h1 mt-6"><span className="line-mask"><span>{c.title}</span></span></h1>
          <p className="t-lead mt-8" data-reveal>{c.lead}</p>
          <address className="t-body mt-10 space-y-1 not-italic" data-reveal>
            <p>{f.address}</p>
            <p><a href={`mailto:${f.email}`} className="link-underline">{f.email}</a></p>
            <p><a href="tel:+97440000000" className="ltr-nums link-underline">{f.phone}</a></p>
            <p className="t-small pt-2">{c.hours}</p>
          </address>
        </div>
        <div className="md:col-span-6 md:col-start-7" data-reveal>
          <ContactForm />
        </div>
      </section>

      <section className="border-t hairline bg-linen py-[var(--section-y)]">
        <div className="container-wide grid grid-cols-1 gap-14 md:grid-cols-3">
          <div id="shipping">
            <h2 className="t-h3">{c.shippingTitle}</h2>
            <p className="t-body mt-4 text-muted">{c.shippingBody}</p>
          </div>
          <div id="size">
            <h2 className="t-h3">{c.sizeTitle}</h2>
            <p className="t-body mt-4 text-muted">{c.sizeBody}</p>
          </div>
          <div id="faq">
            <h2 className="t-h3">{c.faqTitle}</h2>
            <div className="mt-4 border-t hairline">
              {c.faq.map((q) => (
                <details key={q.q} className="group border-b hairline">
                  <summary className="t-body flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 py-3">
                    {q.q}
                    <span aria-hidden="true" className="text-lg text-wine transition-transform duration-200 group-open:rotate-45">+</span>
                  </summary>
                  <p className="t-body pb-4 text-muted">{q.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
