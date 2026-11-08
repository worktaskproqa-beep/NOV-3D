import Link from "next/link";
import type { Dictionary } from "@/i18n";
import { Wordmark } from "@/components/ui/Wordmark";
import { NewsletterForm } from "@/components/ui/NewsletterForm";
import { InstagramIcon, PinterestIcon, TikTokIcon } from "@/components/ui/Icons";

export function Footer({ t }: { t: Dictionary }) {
  const c = t.common;
  const year = new Date().getFullYear();
  const cols = [
    { title: c.footer.shop, links: [
      { href: "/shop?category=hoodies", label: c.categories.hoodies },
      { href: "/shop?category=caps", label: c.categories.caps },
      { href: "/shop", label: c.categories.all },
    ] },
    { title: c.footer.house, links: [
      { href: "/about", label: c.footer.story },
      { href: "/about#craft", label: c.footer.craft },
      { href: "/contact", label: c.footer.contact },
    ] },
    { title: c.footer.care, links: [
      { href: "/contact#shipping", label: c.footer.shipping },
      { href: "/contact#faq", label: c.footer.faq },
      { href: "/contact#size", label: c.footer.sizeGuide },
    ] },
  ];

  return (
    <footer className="on-dark bg-ink text-parchment">
      <div className="container-wide grid grid-cols-1 gap-14 pb-12 pt-20 md:grid-cols-12 md:gap-8 md:pt-28">
        <div className="md:col-span-4">
          <Link href="/" aria-label={c.logoAlt} className="inline-block">
            <Wordmark className="text-[3.5rem] text-ivory" />
          </Link>
          <p className="t-body mt-6 max-w-sm text-parchment/75">{c.footer.intro}</p>
          <div className="mt-10 max-w-sm">
            <p className="t-label mb-4 text-ivory">{t.home.newsletter.eyebrow}</p>
            <NewsletterForm variant="compact" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 md:col-span-7 md:col-start-6">
          {cols.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="t-label mb-6 text-ivory">{col.title}</h2>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="t-body link-underline text-parchment/75 transition-colors hover:text-ivory">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
          <div className="col-span-2 sm:col-span-3">
            <address className="t-small grid gap-1 not-italic text-parchment/70! sm:grid-cols-3">
              <span>{c.footer.address}</span>
              <a href={`mailto:${c.footer.email}`} className="hover:text-ivory">{c.footer.email}</a>
              <a href="tel:+97440000000" className="ltr-nums hover:text-ivory">{c.footer.phone}</a>
            </address>
          </div>
        </div>
      </div>
      <div className="container-wide">
        <div className="flex flex-col gap-6 border-t border-parchment/20 py-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="t-label text-[0.625rem]! text-parchment/70">{c.tagline}</p>
          <div className="flex items-center gap-2" aria-label={c.footer.follow} role="group">
            {[{ I: InstagramIcon, n: "Instagram" }, { I: TikTokIcon, n: "TikTok" }, { I: PinterestIcon, n: "Pinterest" }].map(({ I, n }) => (
              <a key={n} href="#" aria-label={n} className="flex size-11 items-center justify-center text-parchment/80 transition-colors hover:text-ivory"><I size={19} /></a>
            ))}
          </div>
          <p className="t-small text-parchment/60!">
            © <span className="ltr-nums">{year}</span> NOV. {c.footer.rights} · <Link href="/contact" className="hover:text-ivory">{c.footer.privacy}</Link> · <Link href="/contact" className="hover:text-ivory">{c.footer.terms}</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
