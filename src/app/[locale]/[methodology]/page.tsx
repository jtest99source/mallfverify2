import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IconBriefcase, IconChartBar, IconDiamond, IconMessages, IconShieldCheck, IconStar, IconX } from "@tabler/icons-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { siteUrl } from "@/lib/data";
import { isLocale, locales, type Locale } from "@/lib/i18n";
import { methodologyPath, methodologySlugs } from "@/lib/methodology";
import { createBreadcrumbSchema, createFAQSchema } from "@/lib/schema";
import { siteConfig } from "@/config/site";

const seoTitle = "Cómo funciona Mallorca Verified - Metodología de rankings independientes";
const seoDescription =
  "Mallorca Verified evalúa restaurantes, hoteles y negocios de Mallorca usando reseñas reales de Google y una metodología independiente. Sin publicidad, sin favoritismos.";

const factors = [
  {
    Icon: IconStar,
    eyebrow: "Factor 1",
    title: "Valoración media",
    text: "La nota que los clientes han dado al negocio en Google. Una valoración alta es una señal fuerte, pero por sí sola no basta."
  },
  {
    Icon: IconMessages,
    eyebrow: "Factor 2",
    title: "Volumen de reseñas",
    text: "No pesa igual un 4,9 con 8 reseñas que un 4,7 con cientos de opiniones. El volumen ayuda a distinguir señales sólidas de casos aislados."
  },
  {
    Icon: IconDiamond,
    eyebrow: "Factor 3",
    title: "Untapped Score",
    text: "Señal propia que identifica negocios con valoración alta pero popularidad relativa baja dentro de su categoría. Un restaurante con 4,9 y 60 reseñas puede tener un Untapped Score muy superior al de uno con 4,7 y 3.000 reseñas, porque sigue sin estar en el radar masivo. Es nuestra forma de encontrar joyas ocultas antes de que se saturen."
  }
] as const;

const neverItems = [
  {
    title: "Pagar para subir en un ranking",
    text: "La posición en rankings depende de los datos públicos. Si en algún momento hay spots patrocinados u otras colaboraciones destacadas en el site, estarán siempre etiquetados visiblemente. Lo que no existe es pagar para subir en un ranking orgánico."
  },
  {
    title: "Inventar reseñas o experiencias",
    text: "Las fichas parten de señales reales: reseñas, datos públicos y enlaces verificables. No inventamos experiencias."
  },
  {
    title: "Ocultar negocios por razones comerciales",
    text: "Si un negocio tiene buenas métricas, puede aparecer. Si otro paga por una colaboración editorial, eso no cambia el ranking."
  },
  {
    title: "Cambiar valoraciones por presión comercial",
    text: "Podemos corregir datos de una ficha, pero no modificamos ratings, reseñas ni posiciones por petición de un negocio."
  }
] as const;

const methodologyFaqs = [
  {
    question: "¿Puede un negocio pagar para aparecer en Mallorca Verified?",
    answer:
      "Aparecer en el directorio y en rankings objetivos depende de los datos disponibles. Un negocio puede contactarnos para valorar una colaboración de mejora de ficha, pero eso no modifica su posición en rankings."
  },
  {
    question: "¿Con qué frecuencia se actualizan los datos?",
    answer:
      "Los datos de ratings y reseñas se actualizan mensualmente. Cuando un negocio mejora su valoración o acumula más reseñas positivas, su posición puede mejorar en el siguiente ciclo. Si baja su calidad percibida, también puede bajar."
  },
  {
    question: "¿Qué es el Untapped Score y cómo se calcula?",
    answer:
      "El Untapped Score es una métrica propia de Mallorca Verified que identifica negocios con valoración alta pero popularidad relativa baja dentro de su categoría. Combina la nota media con una medida inversa del volumen de reseñas respecto a la media de su categoría. Un restaurante con 4,9 y 60 reseñas puede tener un Untapped Score muy alto si sus competidores directos tienen miles de reseñas: sigue siendo excelente pero todavía no está en el radar masivo."
  },
  {
    question: "¿Por qué Google como fuente de datos y no otras plataformas?",
    answer:
      "Google Maps es la plataforma con mayor volumen de reseñas verificadas para negocios locales en Mallorca. Sus reseñas requieren cuenta activa, tienen filtros anti-spam y representan la opinión pública más amplia y difícil de manipular disponible. Otras plataformas tienen públicos más segmentados o estructuras de incentivo que pueden sesgar las valoraciones."
  },
  {
    question: "¿Mallorca Verified tiene acuerdos comerciales con los negocios que aparecen en rankings?",
    answer:
      "No. Los rankings son completamente independientes de cualquier relación comercial. Un negocio que colabore con nosotros para mejorar su ficha con información, fotos o servicios no obtiene ninguna mejora de posición en rankings. La posición depende únicamente de sus datos públicos."
  },
  {
    question: "¿En qué se diferencia Mallorca Verified de TripAdvisor o Google Maps?",
    answer:
      "Google Maps y TripAdvisor son plataformas generales donde el usuario navega por su cuenta. Mallorca Verified estructura y compara esos datos con una metodología propia para Mallorca: los negocios compiten dentro de su categoría específica, se aplica el Untapped Score para detectar joyas ocultas, y las guías añaden contexto editorial para planes concretos. El objetivo no es sustituir a Google sino ayudar a tomar mejores decisiones antes de ir."
  },
  {
    question: "¿Por qué algunos negocios buenos no aparecen en las guías?",
    answer:
      "Las guías son editoriales y responden a un tema concreto. Un negocio puede tener buenas métricas y no encajar en una guía específica, pero seguir apareciendo en su categoría o zona en los rankings objetivos."
  },
  {
    question: "¿Un negocio que acaba de abrir puede aparecer en los rankings?",
    answer:
      "Sí. El volumen de reseñas favorece a negocios con más trayectoria, pero si un negocio reciente acumula valoraciones muy altas rápido, puede subir en rankings en los siguientes ciclos de actualización."
  },
  {
    question: "¿Cómo puede mejorar un negocio su presencia?",
    answer:
      "La posición en rankings mejora con mejores datos reales: más reseñas, valoraciones más altas, perfil de Google actualizado y buena atención al cliente. Adicionalmente, a través de una colaboración de ficha, podemos enriquecer la página del negocio en Mallorca Verified con fotos, descripción editorial, servicios, carta, horarios y enlaces oficiales."
  }
];

function safeLocaleAndSlug(locale: string, methodology: string) {
  if (!isLocale(locale)) notFound();
  if (methodology !== methodologySlugs[locale]) notFound();
  return locale;
}

export function generateStaticParams() {
  return locales.map((locale) => ({
    locale,
    methodology: methodologySlugs[locale]
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; methodology: string }> }): Promise<Metadata> {
  const { locale, methodology } = await params;
  const safeLocale = safeLocaleAndSlug(locale, methodology);
  const canonical = `${siteUrl}${methodologyPath(safeLocale)}`;

  return {
    title: seoTitle,
    description: seoDescription,
    alternates: {
      canonical,
      languages: Object.fromEntries(locales.map((item) => [item, `${siteUrl}${methodologyPath(item)}`]))
    },
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url: canonical,
      siteName: siteConfig.name,
      locale: safeLocale,
      type: "article"
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: seoDescription
    }
  };
}

export default async function MethodologyPage({ params }: { params: Promise<{ locale: string; methodology: string }> }) {
  const { locale, methodology } = await params;
  const safeLocale = safeLocaleAndSlug(locale, methodology) as Locale;
  const canonical = `${siteUrl}${methodologyPath(safeLocale)}`;
  const breadcrumbs = [
    { name: "Inicio", url: `${siteUrl}/${safeLocale}` },
    { name: "Metodología", url: canonical }
  ];
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Cómo funciona Mallorca Verified",
    description: "Metodología de rankings independientes basados en reseñas reales de Google",
    author: { "@type": "Organization", name: siteConfig.name },
    publisher: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
    mainEntityOfPage: canonical
  };

  return (
    <main className="bg-paper">
      <section className="border-b border-borderline bg-[#FFF8EC] px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Breadcrumbs items={[{ label: "Inicio", href: `/${safeLocale}` }, { label: "Metodología", href: methodologyPath(safeLocale) }]} />
          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-end">
            <div className="max-w-4xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#BFE8D2] bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#047857]">
                <IconShieldCheck size={15} stroke={2} />
                Rankings independientes
              </div>
              <h1 className="font-display text-balance text-4xl font-black leading-[1] text-ink sm:text-5xl lg:text-6xl">
                Cómo evaluamos los negocios de Mallorca
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-olive">
                Comparamos negocios con reseñas reales de Google, señales públicas y una metodología clara. La posición en rankings no se compra.
              </p>
            </div>
            <div className="rounded-lg border border-[#F1D3A2] bg-white p-5 shadow-[0_18px_40px_rgba(27,46,75,0.08)]">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#B86B1D]">Para negocios</p>
              <h2 className="mt-2 font-sans text-2xl font-black leading-tight text-ink">Puedes trabajar tu ficha, no comprar tu posición</h2>
              <p className="mt-3 text-sm leading-7 text-olive">
                Si representas un negocio, podemos valorar una colaboración para completar tu perfil con datos, fotos, servicios, carta, horarios o enlaces oficiales.
              </p>
              <Link href={`/${safeLocale}/business`} className="mt-5 inline-flex min-h-11 items-center justify-center rounded-sm bg-[#1B2E4B] px-5 text-[11px] font-bold uppercase tracking-[0.1em] text-white hover:bg-[#0E8F72]">
                Solicitar propuesta
              </Link>
            </div>
          </div>
        </div>
      </section>

      <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <section className="border-b border-borderline pb-10">
          <h2 className="font-sans text-3xl font-bold leading-tight">Por qué esta guía existe</h2>
          <div className="mt-5 space-y-5 text-base leading-8 text-ink/75">
            <p>
              Muchas recomendaciones de viaje mezclan publicidad, invitaciones, acuerdos comerciales y opinión personal. El lector rara vez sabe por qué un sitio aparece destacado.
            </p>
            <p>
              Mallorca Verified funciona de otra manera: primero ordenamos negocios con datos comparables. Después, las guías editoriales pueden ayudar a planificar, pero nunca cambian la posición en rankings.
            </p>
          </div>
        </section>

        <section className="border-b border-borderline py-10">
          <h2 className="font-sans text-3xl font-bold leading-tight">Cómo construimos los rankings</h2>
          <p className="mt-5 text-base leading-8 text-ink/75">
            Cada categoría se compara por separado. Restaurantes compiten con restaurantes, hoteles con hoteles, barcos con barcos. Así evitamos mezclar señales que no significan lo mismo.
          </p>
          <div className="mt-7 grid gap-4">
            {factors.map(({ Icon, eyebrow, title, text }) => (
              <div key={title} className="rounded-lg border border-borderline bg-white p-5 shadow-[0_12px_28px_rgba(27,46,75,0.04)]">
                <div className="flex gap-4">
                  <Icon size={26} stroke={1.8} className="mt-1 shrink-0 text-[#0E8F72]" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#B86B1D]">{eyebrow}</p>
                    <h3 className="mt-1 font-sans text-xl font-bold text-ink">{title}</h3>
                    <p className="mt-3 text-sm leading-7 text-olive">{text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="border-b border-borderline py-10">
          <h2 className="font-sans text-3xl font-bold leading-tight">Lo que nunca hacemos</h2>
          <div className="mt-6 grid gap-4">
            {neverItems.map((item) => (
              <div key={item.title} className="flex gap-4 rounded-lg border border-borderline bg-white p-5">
                <IconX size={22} stroke={2} className="mt-1 shrink-0 text-[#B86B1D]" />
                <div>
                  <h3 className="font-sans text-lg font-bold text-ink">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-olive">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="border-b border-borderline py-10">
          <h2 className="font-sans text-3xl font-bold leading-tight">Qué sí puede hacer un negocio</h2>
          <div className="mt-5 rounded-lg border border-[#F1D3A2] bg-[#FFF8EC] p-6">
            <div className="flex gap-4">
              <IconBriefcase size={28} stroke={1.8} className="mt-1 shrink-0 text-[#B86B1D]" />
              <div>
                <h3 className="font-sans text-2xl font-black leading-tight text-ink">Enriquecer su perfil con información útil</h3>
                <p className="mt-3 text-sm leading-7 text-olive">
                  Podemos plantear una colaboración para revisar datos, añadir información práctica, corregir enlaces, mejorar fotos, estructurar servicios, destacar carta o reservas y hacer la ficha más completa para usuarios y buscadores.
                </p>
                <p className="mt-3 rounded-md border border-[#BFE8D2] bg-white px-4 py-3 text-xs font-semibold leading-5 text-[#047857]">
                  Ese trabajo mejora la calidad de la ficha, no compra visibilidad. No cambia ratings, reseñas ni posiciones en rankings.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-borderline py-10">
          <h2 className="font-sans text-3xl font-bold leading-tight">Rankings y guías no son lo mismo</h2>
          <div className="mt-5 space-y-5 text-base leading-8 text-ink/75">
            <p>
              Los rankings son objetivos y se ordenan por señales comparables. Las guías son editoriales: sirven para planes concretos, rutas, zonas o tipos de viajero.
            </p>
            <p>
              Un negocio puede colaborar para enriquecer una guía o su propia ficha, pero esa colaboración nunca altera su puesto en un ranking objetivo.
            </p>
          </div>
        </section>

        <section className="border-b border-borderline py-10">
          <h2 className="font-sans text-3xl font-bold leading-tight">De dónde vienen los datos</h2>
          <div className="mt-5 space-y-5 text-base leading-8 text-ink/75">
            <p>
              Usamos datos públicos de Google y los estructuramos para comparar negocios de forma más clara: valoración, volumen de reseñas, categoría, zona, enlaces y señales de perfil.
            </p>
            <p>
              Los datos se actualizan periódicamente. Si un negocio mejora su servicio y acumula mejores señales, puede mejorar su posición. Si baja su calidad, también puede bajar.
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { value: "1.663", label: "negocios publicados" },
              { value: "1,7M+", label: "reseñas verificadas" },
              { value: "18", label: "categorías activas" }
            ].map((stat) => (
              <div key={stat.label} className="rounded-lg border border-[#FFD166]/60 bg-[linear-gradient(135deg,#17324E_0%,#0E5F66_58%,#0E8F72_100%)] px-6 py-5 text-white">
                <div className="font-sans text-4xl font-black leading-none text-[#FFD166]">{stat.value}</div>
                <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white/75">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="pt-10">
          <h2 className="font-sans text-3xl font-bold leading-tight">Preguntas frecuentes</h2>
          <div className="mt-6 divide-y divide-borderline overflow-hidden rounded-lg border border-borderline bg-white">
            {methodologyFaqs.map((faq) => (
              <details key={faq.question} className="group p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-sans text-lg font-bold text-ink">
                  <span>{faq.question}</span>
                  <span className="text-[#B86B1D] transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-4 text-sm leading-7 text-olive">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </article>

      <JsonLd data={[articleSchema, createFAQSchema(methodologyFaqs), createBreadcrumbSchema(breadcrumbs)]} />
    </main>
  );
}
