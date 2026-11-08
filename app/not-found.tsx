import Link from "next/link";
import { getI18n } from "@/i18n/server";

export default async function NotFound() {
  const { t } = await getI18n();
  return (
    <div className="container-text flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="wordmark text-[6rem] text-wine/30">404</p>
      <h1 className="t-h2 mt-6">{t.products.notFound}</h1>
      <Link href="/shop" className="btn btn-outline mt-10">{t.common.actions.backToShop}</Link>
    </div>
  );
}
