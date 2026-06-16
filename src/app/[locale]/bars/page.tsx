import { CategoryPage, generateCategoryMetadata } from "@/lib/page-content";
import { isLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return generateCategoryMetadata("bars", (await params).locale);
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <CategoryPage category="bars" locale={isLocale(locale) ? locale : "es"} />;
}
