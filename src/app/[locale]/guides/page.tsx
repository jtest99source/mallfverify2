import Link from "next/link";
import { GuideCard } from "@/components/GuideCard";
import { getGuides } from "@/lib/repository";
import { generateSeoMetadata } from "@/lib/seo";
import { isLocale, type Locale } from "@/lib/i18n";
import { getEditorialImageForGuide } from "@/lib/unsplash";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const safeLocale = isLocale(locale) ? locale : "es";
  return generateSeoMetadata({
    title: "Guías de Mallorca | Mallorca Verified",
    description: "Guías prácticas de Mallorca para elegir zona, restaurante, hotel o actividad con recomendaciones respaldadas por datos verificados de Google.",
    path: `/${safeLocale}/guides`,
    locale: safeLocale
  });
}

export default async function GuidesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const safeLocale = (isLocale(locale) ? locale : "es") as Locale;
  const guides = await getGuides(safeLocale, undefined, "generated");
  const guideImages = await Promise.all(guides.map((guide) => (guide.heroImageUrl ? Promise.resolve(null) : getEditorialImageForGuide(guide.title))));

  return (
    <main className="bg-[linear-gradient(180deg,#FFF8EC_0%,#FFFDF7_48%,#FFF8EC_100%)]">
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-4xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0E8F72]">Guías editoriales</p>
            <h1 className="font-display mt-3 text-5xl font-black leading-none text-ink sm:text-6xl">Guías de Mallorca escritas con datos reales</h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-olive">
              Artículos prácticos para elegir zona, restaurante, hotel o actividad en Mallorca. Cada recomendación se apoya en fichas verificables y datos de Google.
            </p>
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href={`/${safeLocale}/rankings`} className="inline-flex min-h-11 items-center justify-center rounded-sm bg-ink px-5 text-[11px] font-bold uppercase tracking-[0.1em] text-white hover:bg-[#0E8F72]">
              Ver rankings
            </Link>
            <Link href={`/${safeLocale}`} className="inline-flex min-h-11 items-center justify-center rounded-sm border border-[#E7DED0] bg-white px-5 text-[11px] font-bold uppercase tracking-[0.1em] text-ink hover:border-[#0E8F72] hover:text-[#0E8F72]">
              Ir a inicio
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="grid items-stretch gap-px overflow-hidden rounded-lg border border-[#E7DED0] bg-[#E7DED0] shadow-[0_18px_45px_rgba(27,46,75,0.04)] md:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide, index) => <GuideCard key={guide.id} guide={guide} locale={safeLocale} editorialImage={guideImages[index]} />)}
        </div>
      </section>
    </main>
  );
}
