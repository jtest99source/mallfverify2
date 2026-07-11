import Link from "next/link";
import { generateSeoMetadata } from "@/lib/seo";
import { isLocale, type Locale } from "@/lib/i18n";

const HERO = "https://wpavlaukshgdzqycmmrc.supabase.co/storage/v1/object/public/guide-heroes/report-dental-hero.jpg";

// Static snapshot — Mallorca dental sector, July 2026 (179 published clinics, public Google data).
const DATA = {
  total: 179,
  avgRating: 4.77,
  medReviews: 101,
  revMax: 3038,
  rating: [
    { k: "4.8–5.0★", p: 65, hi: true },
    { k: "4.5–4.7★", p: 27, hi: false },
    { k: "4.0–4.4★", p: 8, hi: false },
    { k: "<4.0★", p: 0, hi: false }
  ],
  volume: [
    { k: "500+", p: 7, dim: false },
    { k: "200–499", p: 20, dim: false },
    { k: "50–199", p: 50, dim: false },
    { k: "<50", p: 23, dim: true }
  ],
  volumeWidth: [14, 40, 100, 46], // visual bar widths for the volume buckets
  leaders: [
    { name: "COped Ortodoncia", zone: "Palma", rating: 5.0, reviews: 3038, w: 100 },
    { name: "Ziving Tomás Sastre", zone: "Palma", rating: 4.9, reviews: 1598, w: 53 },
    { name: "Clínica Dental CED — Dr. Murad", zone: "Palma", rating: 4.9, reviews: 1158, w: 38 },
    { name: "Clínica Pronova", zone: "Palma", rating: 4.9, reviews: 1003, w: 33 },
    { name: "Clínica ASISA Dental", zone: "Palma", rating: 4.7, reviews: 959, w: 32 }
  ],
  zones: [
    { z: "Palma", c: 91, w: 100 },
    { z: "Calvià", c: 13, w: 14 },
    { z: "Inca", c: 11, w: 12 },
    { z: "Manacor", c: 8, w: 9 },
    { z: "Llucmajor", c: 7, w: 8 },
    { z: "Alcúdia", c: 6, w: 7 }
  ],
  eng: 4,
  ger: 6,
  palmaPct: 51
};

const copy = {
  es: {
    metaTitle: "Informe: clínicas dentales de Mallorca 2026 | Mallorca Verified",
    metaDescription: "Análisis de las 179 clínicas dentales de Mallorca según reseñas públicas de Google: la calidad ya no distingue, la visibilidad sí. Datos citables.",
    eyebrow: "Informe de sector · 2026",
    title: "Las clínicas dentales de Mallorca ya no compiten en calidad. Compiten en visibilidad.",
    dek: "Analizamos las 179 clínicas dentales publicadas de la isla a partir de sus reseñas públicas de Google. El hallazgo: la calidad está casi igualada en la cima, pero la visibilidad online está repartida de forma radicalmente desigual.",
    stats: [["clínicas dentales analizadas"], ["valoración media del sector"], ["reseñas de la clínica mediana"]],
    s1kicker: "El hallazgo",
    s1title: "El 65% ya está en 4,8★ o más — pero la mitad tiene menos de 200 reseñas",
    s1p: "La calidad percibida está saturada por arriba: dos de cada tres clínicas superan las 4,8 estrellas. Eso significa que la nota ya no diferencia a una clínica de otra. Lo que sí las separa es cuánta gente lo sabe — y ahí el reparto es enorme.",
    panelA: "Distribución por valoración",
    panelB: "Distribución por nº de reseñas",
    footA: "Casi todas concentradas arriba: la calidad no distingue.",
    footB: "El 23% tiene menos de 50 reseñas: casi invisibles online.",
    s2kicker: "La brecha",
    s2title: "De la mediana al líder: una diferencia de 30×",
    s2p: "La clínica mediana acumula 101 reseñas. La más visible de la isla supera las 3.000. No es una diferencia de calidad — las cinco líderes tienen entre 4,7 y 5,0 estrellas, igual que decenas de clínicas pequeñas. Es una diferencia de presencia digital.",
    medianChip: "MEDIANA",
    medianLine: "la mitad del sector está por debajo de 101 reseñas",
    s3kicker: "Dos huecos de oportunidad",
    s3title: "Idioma y concentración geográfica",
    s3p: "Pese a que el público internacional es enorme en Mallorca, muy pocas clínicas comunican en inglés o alemán de forma explícita. Y casi todas se agolpan en Palma, dejando zonas con poca competencia visible.",
    miniLang: "clínicas de 179 que se anuncian en inglés (4) o alemán (6). El resto no comunica idioma pese a la demanda expat y turista.",
    miniGeo: "de todas las clínicas de la isla están en Palma (91 de 179). Fuera de la capital, la competencia visible cae en picado.",
    pressK: "Para medios",
    pressT: "Datos citables, listos para usar",
    pressP: "Cifras originales sobre un sector local completo, verificadas a partir de reseñas públicas. Cítanos como fuente: Mallorca Verified — Informe Dental 2026. Set de datos y gráficos disponibles bajo petición.",
    bizK: "¿Tienes una clínica?",
    bizT: "Mira dónde estás en el sector",
    bizP: "Te decimos tu posición exacta entre las 179 — nota, volumen de reseñas y percentil — y dónde está tu hueco de visibilidad.",
    bizCta: "Consulta gratuita →",
    method: "Metodología. 179 clínicas dentales de Mallorca con ficha pública y reseñas de Google, recopiladas en julio de 2026. Valoración y volumen de reseñas según datos públicos de Google en la fecha de análisis. Clasificación de idioma estimada por el nombre y la web del negocio. «Mediana» = valor central del sector (la mitad está por encima, la mitad por debajo). Este informe describe visibilidad y reputación online, no calidad clínica."
  },
  en: {
    metaTitle: "Report: Mallorca dental clinics 2026 | Mallorca Verified",
    metaDescription: "An analysis of Mallorca's 179 dental clinics by public Google reviews: quality no longer sets them apart — visibility does. Citable data.",
    eyebrow: "Sector report · 2026",
    title: "Mallorca's dental clinics no longer compete on quality. They compete on visibility.",
    dek: "We analysed the island's 179 published dental clinics using their public Google reviews. The finding: quality is almost level at the top, but online visibility is distributed wildly unevenly.",
    stats: [["dental clinics analysed"], ["average sector rating"], ["reviews for the median clinic"]],
    s1kicker: "The finding",
    s1title: "65% are already at 4.8★ or higher — but half have fewer than 200 reviews",
    s1p: "Perceived quality is saturated at the top: two in three clinics exceed 4.8 stars. That means the rating no longer tells one clinic from another. What separates them is how many people know — and there the spread is huge.",
    panelA: "By rating",
    panelB: "By number of reviews",
    footA: "Nearly all bunched at the top: quality doesn't distinguish.",
    footB: "23% have fewer than 50 reviews: almost invisible online.",
    s2kicker: "The gap",
    s2title: "From median to leader: a 30× difference",
    s2p: "The median clinic has 101 reviews. The island's most visible has over 3,000. It isn't a quality difference — the five leaders sit between 4.7 and 5.0 stars, just like dozens of small clinics. It's a difference in digital presence.",
    medianChip: "MEDIAN",
    medianLine: "half the sector sits below 101 reviews",
    s3kicker: "Two openings",
    s3title: "Language and geographic concentration",
    s3p: "Despite Mallorca's huge international audience, very few clinics explicitly communicate in English or German. And almost all cluster in Palma, leaving areas with little visible competition.",
    miniLang: "of 179 clinics advertise in English (4) or German (6). The rest signal no language despite expat and tourist demand.",
    miniGeo: "of all the island's clinics are in Palma (91 of 179). Outside the capital, visible competition drops sharply.",
    pressK: "For press",
    pressT: "Citable data, ready to use",
    pressP: "Original figures on a complete local sector, verified from public reviews. Cite us as: Mallorca Verified — Dental Report 2026. Dataset and charts available on request.",
    bizK: "Run a clinic?",
    bizT: "See where you stand in the sector",
    bizP: "We'll tell you your exact position among the 179 — rating, review volume and percentile — and where your visibility gap is.",
    bizCta: "Free consultation →",
    method: "Methodology. 179 Mallorca dental clinics with a public listing and Google reviews, compiled in July 2026. Rating and review volume from public Google data on the date of analysis. Language classification estimated from the business name and website. “Median” = the sector's central value (half above, half below). This report describes online visibility and reputation, not clinical quality."
  },
  de: {
    metaTitle: "Report: Zahnkliniken auf Mallorca 2026 | Mallorca Verified",
    metaDescription: "Eine Analyse der 179 Zahnkliniken Mallorcas nach öffentlichen Google-Bewertungen: Qualität unterscheidet nicht mehr — Sichtbarkeit schon. Zitierfähige Daten.",
    eyebrow: "Branchenreport · 2026",
    title: "Mallorcas Zahnkliniken konkurrieren nicht mehr über Qualität. Sondern über Sichtbarkeit.",
    dek: "Wir haben die 179 veröffentlichten Zahnkliniken der Insel anhand ihrer öffentlichen Google-Bewertungen analysiert. Das Ergebnis: Die Qualität ist an der Spitze fast gleichauf, aber die Online-Sichtbarkeit ist extrem ungleich verteilt.",
    stats: [["analysierte Zahnkliniken"], ["durchschnittliche Branchenbewertung"], ["Bewertungen der mittleren Klinik"]],
    s1kicker: "Das Ergebnis",
    s1title: "65% liegen bereits bei 4,8★ oder höher — aber die Hälfte hat weniger als 200 Bewertungen",
    s1p: "Die wahrgenommene Qualität ist oben gesättigt: Zwei von drei Kliniken übertreffen 4,8 Sterne. Das heißt, die Bewertung unterscheidet eine Klinik nicht mehr von einer anderen. Was sie trennt, ist, wie viele es wissen — und da ist die Streuung enorm.",
    panelA: "Nach Bewertung",
    panelB: "Nach Anzahl der Bewertungen",
    footA: "Fast alle oben gebündelt: Qualität unterscheidet nicht.",
    footB: "23% haben weniger als 50 Bewertungen: online fast unsichtbar.",
    s2kicker: "Die Kluft",
    s2title: "Vom Median zum Spitzenreiter: ein 30-facher Unterschied",
    s2p: "Die mittlere Klinik hat 101 Bewertungen. Die sichtbarste der Insel über 3.000. Es ist kein Qualitätsunterschied — die fünf Spitzenreiter liegen zwischen 4,7 und 5,0 Sternen, genau wie Dutzende kleiner Kliniken. Es ist ein Unterschied in der digitalen Präsenz.",
    medianChip: "MEDIAN",
    medianLine: "die Hälfte der Branche liegt unter 101 Bewertungen",
    s3kicker: "Zwei Chancen",
    s3title: "Sprache und geografische Konzentration",
    s3p: "Trotz des riesigen internationalen Publikums auf Mallorca kommunizieren sehr wenige Kliniken ausdrücklich auf Englisch oder Deutsch. Und fast alle ballen sich in Palma, was Gebiete mit wenig sichtbarer Konkurrenz lässt.",
    miniLang: "von 179 Kliniken werben auf Englisch (4) oder Deutsch (6). Der Rest signalisiert keine Sprache trotz Expat- und Touristennachfrage.",
    miniGeo: "aller Kliniken der Insel sind in Palma (91 von 179). Außerhalb der Hauptstadt fällt die sichtbare Konkurrenz stark ab.",
    pressK: "Für Medien",
    pressT: "Zitierfähige Daten, sofort nutzbar",
    pressP: "Originalzahlen zu einer kompletten lokalen Branche, aus öffentlichen Bewertungen verifiziert. Zitieren Sie uns als: Mallorca Verified — Zahnreport 2026. Datensatz und Grafiken auf Anfrage.",
    bizK: "Sie führen eine Klinik?",
    bizT: "Sehen Sie, wo Sie in der Branche stehen",
    bizP: "Wir nennen Ihnen Ihre genaue Position unter den 179 — Bewertung, Bewertungsvolumen und Perzentil — und wo Ihre Sichtbarkeitslücke liegt.",
    bizCta: "Kostenlose Beratung →",
    method: "Methodik. 179 Zahnkliniken auf Mallorca mit öffentlichem Eintrag und Google-Bewertungen, erhoben im Juli 2026. Bewertung und Bewertungsvolumen aus öffentlichen Google-Daten zum Analysezeitpunkt. Sprachklassifizierung geschätzt anhand von Name und Website. „Median“ = zentraler Wert der Branche (die Hälfte darüber, die Hälfte darunter). Dieser Report beschreibt Online-Sichtbarkeit und Reputation, nicht klinische Qualität."
  }
} as const;

function numberLocale(locale: Locale) {
  return locale === "de" ? "de-DE" : locale === "en" ? "en-US" : "es-ES";
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const safe = isLocale(locale) ? locale : "es";
  const c = copy[safe];
  return generateSeoMetadata({
    title: c.metaTitle,
    description: c.metaDescription,
    path: `/${safe}/insights/dental-mallorca-2026`,
    locale: safe,
    alternateLocales: ["es", "en", "de"]
  });
}

function Bar({ width, hi, dim }: { width: number; hi?: boolean; dim?: boolean }) {
  const color = dim ? "bg-white/25" : hi ? "bg-[#00C37A] shadow-[0_0_14px_rgba(0,195,122,0.35)]" : "bg-[#00C37A]";
  return (
    <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.07]">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${width}%` }} />
    </div>
  );
}

export default async function DentalReportPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const safe = (isLocale(locale) ? locale : "es") as Locale;
  const c = copy[safe];
  const nf = (n: number) => n.toLocaleString(numberLocale(safe));
  const rating = DATA.avgRating.toLocaleString(numberLocale(safe), { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <main className="bg-[#07101F] text-white">
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {/* header */}
        <header>
          <div className="relative overflow-hidden rounded-lg border border-white/[0.10]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={HERO} alt="" aria-hidden="true" className="h-[320px] w-full object-cover object-center sm:h-[440px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07101F] via-[#07101F]/75 to-[#07101F]/15" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-9">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#00C37A]">{c.eyebrow}</p>
              <h1 className="mt-3 max-w-2xl font-display text-3xl font-black leading-[1.04] tracking-tight text-white text-balance sm:text-[2.85rem]">{c.title}</h1>
            </div>
          </div>
          <p className="mt-6 max-w-2xl text-base leading-8 text-white/60">{c.dek}</p>

          <div className="mt-8 grid overflow-hidden rounded-md border border-white/[0.10] sm:grid-cols-3">
            {[nf(DATA.total), `${rating}★`, nf(DATA.medReviews)].map((n, i) => (
              <div key={i} className="border-b border-white/[0.10] bg-[#0C1A2E] p-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
                <p className="font-display text-3xl font-black tabular-nums text-[#00C37A]">{n}</p>
                <p className="mt-2 text-xs leading-5 text-white/55">{c.stats[i][0]}</p>
              </div>
            ))}
          </div>
        </header>

        {/* THE FINDING */}
        <section className="mt-16">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/40">{c.s1kicker}</p>
          <h2 className="mt-2.5 font-display text-2xl font-black leading-tight text-white text-balance sm:text-3xl">{c.s1title}</h2>
          <p className="mt-4 max-w-2xl text-[15px] leading-7 text-white/60">{c.s1p}</p>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <div className="rounded-md border border-white/[0.10] bg-[#0C1A2E] p-5">
              <p className="text-[11px] font-black uppercase tracking-[0.08em] text-white/70">{c.panelA}</p>
              <div className="mt-4 flex flex-col gap-3">
                {DATA.rating.map((r) => (
                  <div key={r.k} className="flex items-center gap-3">
                    <span className="w-16 shrink-0 text-xs tabular-nums text-white/55">{r.k}</span>
                    <Bar width={r.p} hi={r.hi} />
                    <span className="w-8 shrink-0 text-right text-xs font-bold tabular-nums">{r.p}%</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[12.5px] leading-5 text-white/55">{c.footA}</p>
            </div>

            <div className="rounded-md border border-white/[0.10] bg-[#0C1A2E] p-5">
              <p className="text-[11px] font-black uppercase tracking-[0.08em] text-white/70">{c.panelB}</p>
              <div className="mt-4 flex flex-col gap-3">
                {DATA.volume.map((v, i) => (
                  <div key={v.k} className="flex items-center gap-3">
                    <span className="w-16 shrink-0 text-xs tabular-nums text-white/55">{v.k}</span>
                    <Bar width={DATA.volumeWidth[i]} dim={v.dim} />
                    <span className="w-8 shrink-0 text-right text-xs font-bold tabular-nums">{v.p}%</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[12.5px] leading-5 text-white/55">{c.footB}</p>
            </div>
          </div>
        </section>

        {/* THE GAP */}
        <section className="mt-16">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/40">{c.s2kicker}</p>
          <h2 className="mt-2.5 font-display text-2xl font-black leading-tight text-white text-balance sm:text-3xl">{c.s2title}</h2>
          <p className="mt-4 max-w-2xl text-[15px] leading-7 text-white/60">{c.s2p}</p>

          <div className="mt-6 rounded-md border border-white/[0.10] bg-[#0C1A2E] px-5 py-3 sm:px-6">
            <div className="flex items-center gap-2.5 py-3 text-[12.5px] text-white/60">
              <span className="rounded-full bg-[#00C37A]/15 px-2.5 py-1 text-[10px] font-black tracking-wide text-[#00C37A]">{c.medianChip}</span>
              {c.medianLine}
            </div>
            {DATA.leaders.map((l) => (
              <div key={l.name} className="grid grid-cols-[1fr_auto] items-center gap-4 border-t border-white/[0.08] py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm text-white">{l.name}</p>
                  <p className="text-[11px] text-white/40">{l.zone} · ★{l.rating.toLocaleString(numberLocale(safe), { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-24 overflow-hidden rounded-full bg-white/[0.07] sm:w-44">
                    <div className="h-full rounded-full bg-[#00C37A]" style={{ width: `${l.w}%` }} />
                  </div>
                  <span className="w-12 text-right text-[13px] font-bold tabular-nums">{nf(l.reviews)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* TWO OPENINGS */}
        <section className="mt-16">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/40">{c.s3kicker}</p>
          <h2 className="mt-2.5 font-display text-2xl font-black leading-tight text-white text-balance sm:text-3xl">{c.s3title}</h2>
          <p className="mt-4 max-w-2xl text-[15px] leading-7 text-white/60">{c.s3p}</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-md border border-white/[0.10] bg-[#0C1A2E] p-5">
              <p className="font-display text-3xl font-black tabular-nums text-[#00C37A]">{DATA.eng} · {DATA.ger}</p>
              <p className="mt-2 text-[13px] leading-6 text-white/60">{c.miniLang}</p>
            </div>
            <div className="rounded-md border border-white/[0.10] bg-[#0C1A2E] p-5">
              <p className="font-display text-3xl font-black tabular-nums text-[#00C37A]">{DATA.palmaPct}%</p>
              <p className="mt-2 text-[13px] leading-6 text-white/60">{c.miniGeo}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2.5">
            {DATA.zones.map((z) => (
              <div key={z.z} className="grid grid-cols-[88px_1fr_32px] items-center gap-3">
                <span className="text-[13px]">{z.z}</span>
                <div className="h-2 overflow-hidden rounded-full bg-white/[0.07]">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#00C37A] to-[#0a7a53]" style={{ width: `${z.w}%` }} />
                </div>
                <span className="text-right text-xs font-bold tabular-nums text-white/60">{z.c}</span>
              </div>
            ))}
          </div>
        </section>

        {/* DUAL CTA */}
        <section className="mt-16 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-white/[0.10] bg-[#0C1A2E] p-6">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-white/40">{c.pressK}</p>
            <h3 className="mt-2.5 font-display text-lg font-black text-white">{c.pressT}</h3>
            <p className="mt-2 text-[13.5px] leading-6 text-white/60">{c.pressP}</p>
          </div>
          <div className="rounded-lg border border-[#00C37A]/30 bg-gradient-to-br from-[#00C37A]/10 to-transparent p-6">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#00C37A]">{c.bizK}</p>
            <h3 className="mt-2.5 font-display text-lg font-black text-white">{c.bizT}</h3>
            <p className="mt-2 text-[13.5px] leading-6 text-white/70">{c.bizP}</p>
            <Link href={`/${safe}/contact`} className="mt-4 inline-block rounded-sm bg-[#00C37A] px-4 py-3 text-[11px] font-black uppercase tracking-[0.1em] text-[#0A0A0A] transition-colors hover:bg-white">{c.bizCta}</Link>
          </div>
        </section>

        <p className="mt-10 border-t border-white/[0.08] pt-6 text-[12.5px] leading-6 text-white/40">{c.method}</p>
      </article>
    </main>
  );
}
