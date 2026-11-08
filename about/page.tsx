import type { Metadata } from "next";
import Link from "next/link";
import { getI18n } from "@/i18n/server";
import Image from "next/image";
import { HOODIES } from "@/lib/productImages";
import { DetailsSection } from "@/components/home/DetailsSection";
import { ArrowIcon } from "@/components/ui/Icons";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.common.about.eyebrow };
}

export default async function AboutPage() {
  const { t } = await getI18n();
  const a = t.common.about;
  return (
    <div className="bg-ivory">
      <section className="container-wide pb-[var(--section-y)] pt-16 md:pt-28">
        <p className="t-label text-wine" data-reveal>{a.eyebrow}</p>
        <h1 className="lines t-h1 mt-6 max-w-4xl"><span className="line-mask"><span>{a.title}</span></span></h1>
        <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5">
            <div className="curtain aspect-[4/5] overflow-hidden">
              <div className="relative h-full w-full"><Image src={HOODIES.black.rear} alt={a.imageAlt} fill placeholder="blur" sizes="(min-width: 768px) 40vw, 100vw" className="object-cover object-top" /></div>
            </div>
          </div>
          <div className="space-y-8 md:col-span-6 md:col-start-7 md:pt-24">
            <p className="t-lead text-ink!" data-reveal>{a.lead}</p>
            <p className="t-body text-muted" data-reveal>{a.p1}</p>
            <p className="t-body text-muted" data-reveal>{a.p2}</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="values-title" className="border-t hairline bg-linen py-[var(--section-y)]">
        <div className="container-wide">
          <h2 id="values-title" className="t-h2" data-reveal>{a.valuesTitle}</h2>
          <ol className="mt-14 grid grid-cols-1 gap-10 md:grid-cols-3">
            {a.values.map((v, i) => (
              <li key={v.t} data-reveal style={{ ["--d" as string]: `${i * 120}ms` }} className="border-t border-wine/40 pt-6">
                <span className="t-small ltr-nums">0{i + 1}</span>
                <h3 className="t-h3 mt-3">{v.t}</h3>
                <p className="t-body mt-3 text-muted">{v.d}</p>
              </li>
            ))}
          </ol>
          <Link href="/shop" className="btn btn-primary mt-16">{a.cta}<ArrowIcon size={16} className="flip-rtl" /></Link>
        </div>
      </section>

      <div id="craft"><DetailsSection t={t} /></div>
    </div>
  );
}
