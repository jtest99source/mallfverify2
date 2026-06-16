import { BusinessDetailPage, generateBusinessMetadata } from "@/lib/page-content";
import { isLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  return generateBusinessMetadata("boats", locale, slug);
}
export default async function Page({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  return <BusinessDetailPage category="boats" locale={isLocale(locale) ? locale : "es"} slug={slug} />;
}
