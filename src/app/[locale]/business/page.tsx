import { CTABox } from "@/components/CTABox";
import { generateSeoMetadata } from "@/lib/seo";
import { isLocale, type Locale } from "@/lib/i18n";
import { getBusinessAreaCategoryPages } from "@/lib/repository";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const safeLocale = isLocale(locale) ? locale : "es";
  return generateSeoMetadata({
    title: "Para negocios | Mallorca Verified",
    description: "Solicita una propuesta para revisar y enriquecer tu ficha en Mallorca Verified.",
    path: `/${safeLocale}/business`,
    locale: safeLocale
  });
}

export default async function BusinessPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const safeLocale = (isLocale(locale) ? locale : "es") as Locale;
  const areaPages = await getBusinessAreaCategoryPages(5);
  const stats = [
    { label: "Fichas publicadas", value: "1.648" },
    { label: "Categorías preparadas", value: "18" },
    { label: "Reseñas analizadas", value: "1,7M+" },
    { label: "Páginas locales", value: `${areaPages.length}+` }
  ];
  const products = [
    {
      title: "Ficha enriquecida",
      text: "Mejores fotos, enlaces correctos, servicios, carta, horarios, reservas y detalles prácticos para que la ficha sea más útil."
    },
    {
      title: "Revisión editorial",
      text: "Ordenamos la información visible y corregimos datos públicos para que el perfil se entienda rápido y no parezca incompleto."
    },
    {
      title: "Contexto por zona",
      text: "Conectamos la ficha con páginas por zona y categoría cuando tiene sentido para el usuario que está comparando opciones."
    },
    {
      title: "Colaboración editorial",
      text: "Valoramos cada caso antes de tocar nada: la colaboración mejora la ficha, no compra valoraciones ni posiciones en rankings."
    }
  ];

  return (
    <main className="bg-[linear-gradient(180deg,#FFF8EC_0%,#FFFDF7_48%,#FFF8EC_100%)]">
      <section className="border-b border-[#E7DED0] px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#0E8F72]">Para negocios</p>
            <h1 className="mt-4 max-w-4xl text-5xl font-black leading-none text-[#10253D] sm:text-7xl">Mejora la ficha pública de tu negocio</h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[#4B5B4D]">
              Mallorca Verified compara negocios con datos y reseñas. Si representas un negocio, puedes solicitar una propuesta para completar tu ficha con información fiable, fotos y detalles útiles.
            </p>
          </div>
          <div className="rounded-lg border border-[#E7DED0] bg-[#FFFDF7] p-6 shadow-[0_18px_45px_rgba(27,46,75,0.06)]">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#B86B1D]">Contacto comercial</p>
            <p className="mt-4 text-sm leading-7 text-[#4B5B4D]">Escríbenos para revisar una ficha, aportar material o plantear una colaboración editorial.</p>
            <a href="mailto:hola@mallorcaverified.com?subject=Quiero revisar mi ficha en Mallorca Verified" className="mt-6 block rounded-md bg-[#10253D] px-5 py-4 text-center text-[11px] font-black uppercase tracking-[0.1em] text-white transition-all duration-150 hover:bg-[#0E8F72]">Solicitar propuesta</a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-3 md:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className="rounded-lg border border-[#E7DED0] bg-[#FFFDF7] p-6 shadow-sm">
              <p className="text-4xl font-black text-[#10253D]">{item.value}</p>
              <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[#5F6F61]">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[320px_1fr]">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#0E8F72]">Qué se puede trabajar</p>
            <h2 className="mt-3 text-4xl font-black text-[#10253D]">Una ficha más completa, sin tocar los rankings</h2>
            <p className="mt-5 text-sm leading-7 text-[#4B5B4D]">
              El objetivo es que la información sea clara, verificable y útil para quien está decidiendo. Las valoraciones, reseñas y posiciones siguen dependiendo de los datos.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {products.map((item) => (
              <article key={item.title} className="rounded-lg border border-[#E7DED0] bg-[#FFFDF7] p-6 shadow-[0_14px_34px_rgba(27,46,75,0.04)]">
                <h3 className="text-2xl font-black text-[#10253D]">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#4B5B4D]">{item.text}</p>
              </article>
            ))}
          </div>
        </div>

        <section className="mt-12 rounded-lg border border-[#E7DED0] bg-[#FFF8EC] p-6">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#E7DED0] pb-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#0E8F72]">Contexto local</p>
              <h2 className="mt-2 text-3xl font-black text-[#10253D]">Páginas por zona y categoría</h2>
            </div>
            <a href="mailto:hola@mallorcaverified.com?subject=Quiero revisar mi ficha" className="rounded-md bg-[#10253D] px-4 py-3 text-[11px] font-black uppercase tracking-[0.1em] text-white transition-all duration-150 hover:bg-[#0E8F72]">Revisar mi ficha</a>
          </div>
          <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {areaPages.slice(0, 9).map((page) => (
              <a key={`${page.areaSlug}-${page.category}`} href={`/${safeLocale}/areas/${page.areaSlug}/${page.category}`} className="rounded-md border border-[#E7DED0] bg-[#FFFDF7] p-4 text-sm font-bold text-[#10253D] transition-all duration-150 hover:border-[#0E8F72] hover:bg-white">
                {page.count} fichas: {page.area}
              </a>
            ))}
          </div>
        </section>

        <div className="mt-12"><CTABox /></div>
      </section>
    </main>
  );
}
