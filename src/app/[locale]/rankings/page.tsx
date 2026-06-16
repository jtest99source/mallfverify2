import Link from "next/link";
import { IconChartBar } from "@tabler/icons-react";
import { GuideCard } from "@/components/GuideCard";
import { TopRankingExplorer } from "@/components/TopRankingExplorer";
import { categoryConfigs, isCategorySlug, type CategorySlug } from "@/lib/data";
import { getBusinessesForFacetScan, getGuides, getTopBusinessesByCategory } from "@/lib/repository";
import { generateSeoMetadata } from "@/lib/seo";
import { isLocale, type Locale } from "@/lib/i18n";
import { getEditorialImageForGuide } from "@/lib/unsplash";
import { getPopularFacetsForBusinesses } from "@/lib/taxonomy";

const RANKING_LIMIT = 1000;

function categoryHref(locale: Locale, category: CategorySlug) {
  return `/${locale}/rankings?category=${category}`;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const safeLocale = isLocale(locale) ? locale : "es";
  return generateSeoMetadata({
    title: "Rankings objetivos de Mallorca | Mallorca Verified",
    description: "Rankings de Mallorca para comparar restaurantes, hoteles, playas, barcos y planes con datos claros y contexto útil antes de decidir.",
    path: `/${safeLocale}/rankings`,
    locale: safeLocale
  });
}

export default async function RankingsPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ category?: string }>;
}) {
  const { locale } = await params;
  const query = (await searchParams) ?? {};
  const safeLocale = (isLocale(locale) ? locale : "es") as Locale;
  const selectedCategory = isCategorySlug(query.category ?? "") ? (query.category as CategorySlug) : "restaurants";

  const [businesses, facetScanBusinesses, guides] = await Promise.all([
    getTopBusinessesByCategory(selectedCategory, RANKING_LIMIT),
    getBusinessesForFacetScan(selectedCategory),
    getGuides(safeLocale, 4)
  ]);
  const facets = getPopularFacetsForBusinesses(selectedCategory, facetScanBusinesses, selectedCategory === "restaurants" ? 5 : 3).slice(0, 14);
  const guideImages = await Promise.all(guides.map((guide) => (guide.heroImageUrl ? Promise.resolve(null) : getEditorialImageForGuide(guide.title))));
  const activeConfig = categoryConfigs[selectedCategory];

  return (
    <main className="bg-[linear-gradient(180deg,#FFF8EC_0%,#FFFDF7_46%,#FFF8EC_100%)]">
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#BFE8D2] bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#047857]">
                <IconChartBar size={15} stroke={2} />
                Actualizado a diario · Sin posiciones de pago · Consenso de reseñas verificadas
              </div>
              <h1 className="font-display max-w-4xl text-balance text-4xl font-black leading-[1.05] text-ink sm:text-5xl lg:text-6xl">
                Busca lo mejor de Mallorca sin perderte entre listas.
              </h1>
              <p className="mt-5 max-w-3xl text-sm leading-7 text-olive">
                Elige una categoría, filtra por zona o tipo de plan y compara opciones con calma. Usamos reseñas reales de Google y señales públicas para que sea más fácil decidir dónde comer, dormir, reservar o pasar el día.
              </p>
            </div>
            <aside className="overflow-hidden rounded-xl bg-[linear-gradient(135deg,#10253D_0%,#0E5F66_100%)] p-5 text-white shadow-[0_18px_45px_rgba(27,46,75,0.14)]">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#FFD166]">Para negocios</p>
              <h2 className="font-display mt-2 text-2xl font-black leading-tight text-white">¿Gestionas un negocio en Mallorca?</h2>
              <p className="mt-3 text-sm leading-6 text-white/75">
                Añade fotos reales, servicios, carta y datos actualizados a tu ficha. Más contexto para las personas que ya están buscando.
              </p>
              <p className="mt-3 rounded-md border border-white/15 bg-white/8 px-3 py-2 text-[11px] text-white/55">
                Las posiciones en rankings no cambian — solo enriquecemos la información disponible.
              </p>
              <Link href={`/${safeLocale}/business`} className="mt-5 inline-flex min-h-10 items-center rounded-md bg-[#C4933F] px-5 text-[11px] font-bold uppercase tracking-[0.1em] text-white transition-all duration-150 hover:bg-[#FFD166] hover:text-ink">
                Solicitar información →
              </Link>
            </aside>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-6 sm:px-6 lg:px-8">
        <div className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
          {(Object.entries(categoryConfigs) as [CategorySlug, (typeof categoryConfigs)[CategorySlug]][]).map(([slug, config]) => (
            <Link
              key={slug}
              href={categoryHref(safeLocale, slug)}
              className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.08em] transition-all duration-150 ${
                slug === selectedCategory
                  ? "border-ink bg-ink text-white"
                  : "border-[#E7DED0] bg-white text-ink hover:border-ink hover:bg-ink hover:text-white"
              }`}
            >
              {config.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="px-4 pb-2 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-5 max-w-4xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0E8F72]">Ranking activo</p>
            <h2 className="font-display mt-2 text-3xl font-black text-ink sm:text-4xl">{activeConfig.title}</h2>
            <p className="mt-3 text-sm leading-7 text-sage">{activeConfig.intro}</p>
          </div>
        </div>
      </section>

      <TopRankingExplorer businesses={businesses} locale={safeLocale} category={selectedCategory} facets={facets} />

      {guides.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col justify-between gap-4 pb-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0E8F72]">Guías para planificar</p>
              <h2 className="mt-2 text-3xl font-black text-ink">Cuando quieres contexto, no solo posiciones</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-sage">
                Las guías son listas escritas para planes concretos: dónde ir según la zona, el momento del viaje, el presupuesto o lo que te apetece hacer.
              </p>
            </div>
            <Link href={`/${safeLocale}/guides`} className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink hover:text-[#0E8F72]">
              Ver guías →
            </Link>
          </div>
          <div className="grid items-stretch gap-px overflow-hidden rounded-lg border border-[#E7DED0] bg-[#E7DED0] shadow-[0_18px_45px_rgba(27,46,75,0.04)] md:grid-cols-2">
            {guides.map((guide, index) => (
              <GuideCard key={guide.id} guide={guide} locale={safeLocale} editorialImage={guideImages[index]} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
