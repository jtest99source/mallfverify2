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
  const rawGuideImages = await Promise.all(guides.map((guide) => (guide.heroImageUrl ? Promise.resolve(null) : getEditorialImageForGuide(guide.title))));

  // Never show the same photo twice in the listing
  const seenImageUrls = new Set(guides.map((g) => g.heroImageUrl).filter(Boolean) as string[]);
  const guideImages = rawGuideImages.map((img) => {
    if (!img) return null;
    if (seenImageUrls.has(img.imageUrl)) return null;
    seenImageUrls.add(img.imageUrl);
    return img;
  });

  return (
    <main className="bg-[#07101F]">
      <section className="px-4 py-9 sm:px-6 sm:py-12 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-4xl text-center sm:text-left">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#00C37A]">{copy.eyebrow}</p>
            <h1 className="font-display mt-3 text-4xl font-black leading-[1.02] text-white sm:text-6xl">{copy.title}</h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/55 sm:text-base sm:leading-8">{copy.description}</p>
          </div>
          <div className="mt-7 flex flex-wrap justify-center gap-3 sm:justify-start">
            <Link href={`/${safeLocale}/top/restaurants`} className="inline-flex min-h-11 items-center justify-center rounded-sm bg-[#00C37A] px-5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#0A0A0A] hover:bg-white">
              {copy.viewRankings}
            </Link>
            <Link href={`/${safeLocale}`} className="inline-flex min-h-11 items-center justify-center rounded-sm border border-white/20 px-5 text-[11px] font-bold uppercase tracking-[0.1em] text-white/60 hover:border-white/40 hover:text-white">
              {copy.goHome}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        {guides.length > 0 ? (
          <div className="grid items-stretch gap-5 md:grid-cols-2 lg:grid-cols-3">
            {guides.map((guide, index) => <GuideCard key={guide.id} guide={guide} locale={safeLocale} editorialImage={guideImages[index]} />)}
          </div>
        ) : (
          <div className="rounded-lg border border-white/[0.10] bg-white/[0.04] p-5 text-sm leading-7 text-white/50">
            {copy.empty}
          </div>
        )}
      </section>
    </main>
  );
}
