import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { isLocale, type Locale } from "@/lib/i18n";

// 6h: with ~26k URLs being crawled, hourly ISR regeneration saturated the DB
// (100% CPU on Supabase). Content updates can purge on demand via /api/revalidate.
export const revalidate = 21600;

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <>
      <Header locale={locale as Locale} />
      {children}
      <Footer locale={locale as Locale} />
    </>
  );
}
