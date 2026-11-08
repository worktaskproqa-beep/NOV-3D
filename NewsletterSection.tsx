import type { Dictionary } from "@/i18n";
import { NewsletterForm } from "@/components/ui/NewsletterForm";

export function NewsletterSection({ t }: { t: Dictionary }) {
  const n = t.home.newsletter;
  return (
    <section aria-labelledby="newsletter-title" className="section bg-parchment">
      <div className="container-wide grid grid-cols-1 gap-12 md:grid-cols-12 md:items-end">
        <div className="md:col-span-6">
          <p data-reveal className="t-label text-wine">{n.eyebrow}</p>
          <h2 id="newsletter-title" className="lines t-h1 mt-6"><span className="line-mask"><span>{n.title}</span></span></h2>
        </div>
        <div className="md:col-span-5 md:col-start-8" data-reveal>
          <p className="t-body mb-8 text-muted">{n.body}</p>
          <NewsletterForm />
        </div>
      </div>
    </section>
  );
}
