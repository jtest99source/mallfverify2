import Link from "next/link";
import { GuideCard } from "@/components/GuideCard";
import { getGuides } from "@/lib/repository";
import { generateSeoMetadata } from "@/lib/seo";
import { isLocale, type Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n-copy";
import { getEditorialImageForGuide } from "@/lib/unsplash";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const safeLocale = isLocale(locale) ? locale : "es";
  const copy = t(safeLocale).guides;
  return generateSeoMetadata({
    title: `${copy.title} | Mallorca Verified`,
    description: copy.description,
    path: `/${safeLocale}/guides`,
    locale: safeLocale,
    alternateLocales: ["es", "en"]
  });
}

export default async function GuidesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const safeLocale = (isLocale(locale) ? locale : "es") as Locale;
  const copy = t(safeLocale).guides;
  const guides = await getGuides(safeLocale);
  const guideImages = await Promise.all(guides.map((guide) => (guide.heroImageUrl ? Promise.resolve(null) : getEditorialImageForGuide(guide.title))));

  return (
    <main className="bg-[linear-gradient(180deg,#FFF8EC_0%,#FFFDF7_48%,#FFF8EC_100%)]">
      <section className="px-4 py-9 sm:px-6 sm:py-12 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-4xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0E8F72]">{copy.eyebrow}</p>
            <h1 className="font-display mt-3 text-4xl font-black leading-[1.02] text-ink sm:text-6xl">{copy.title}</h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-olive sm:text-base sm:leading-8">{copy.description}</p>
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href={`/${safeLocale}/rankings`} className="inline-flex min-h-11 items-center justify-center rounded-sm bg-ink px-5 text-[11px] font-bold uppercase tracking-[0.1em] text-white hover:bg-[#0E8F72]">
              {copy.viewRankings}
            </Link>
            <Link href={`/${safeLocale}`} className="inline-flex min-h-11 items-center justify-center rounded-sm border border-[#E7DED0] bg-white px-5 text-[11px] font-bold uppercase tracking-[0.1em] text-ink hover:border-[#0E8F72] hover:text-[#0E8F72]">
              {copy.goHome}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        {guides.length > 0 ? (
          <div className="grid items-stretch gap-px overflow-hidden rounded-lg border border-[#E7DED0] bg-[#E7DED0] shadow-[0_18px_45px_rgba(27,46,75,0.04)] md:grid-cols-2 lg:grid-cols-3">
            {guides.map((guide, index) => <GuideCard key={guide.id} guide={guide} locale={safeLocale} editorialImage={guideImages[index]} />)}
          </div>
        ) : (
          <div className="rounded-lg border border-[#E7DED0] bg-white/85 p-5 text-sm leading-7 text-olive">
            {copy.empty}
          </div>
        )}
      </section>
    </main>
  );
}
