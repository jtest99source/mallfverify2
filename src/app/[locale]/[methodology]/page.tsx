import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  IconChartBar, IconDiamond, IconMail,
  IconMessages, IconRefresh, IconShieldCheck, IconStar,
  IconUsers, IconX
} from "@tabler/icons-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { siteConfig } from "@/config/site";
import { publicCategorySlugs, siteUrl } from "@/lib/data";
import { isLocale, locales, type Locale } from "@/lib/i18n";
import {
  aboutPath, aboutSlugs, editorialPath, editorialSlugs,
  getStaticPageType, methodologyPath, methodologySlugs,
  type StaticPageType
} from "@/lib/methodology";
import { getPublicBusinessStats } from "@/lib/repository";
import { createBreadcrumbSchema, createFAQSchema } from "@/lib/schema";

// ─── Methodology copy ───────────────────────────────────────────────────────

const methodologyCopy = {
  es: {
    metaTitle: "Metodología de rankings | Mallorca Verified",
    metaDescription: "Cómo Mallorca Verified clasifica negocios de Mallorca con datos reales de Google, reseñas, Untapped Score y criterio editorial independiente.",
    home: "Inicio",
    label: "Metodología",
    badge: "Rankings independientes",
    title: "Por qué usamos datos de Google — y nada más",
    intro: "La mayoría de portales mezclan publicidad, estancias invitadas y opinión personal con los rankings. Mallorca Verified los separa completamente. Los rankings se construyen sobre datos públicos de Google: ninguna posición se compra.",
    businessEyebrow: "Para negocios",
    businessTitle: "Mejora la ficha, no el ranking",
    businessText: "Cualquier negocio que cumpla nuestros criterios puede añadir fotos, servicios, carta, horarios e información útil de forma gratuita. No aceptamos ningún pago. Las posiciones las determina únicamente el algoritmo con datos públicos de Google.",
    businessCta: "Escríbenos →",
    whyTitle: "Por qué las reseñas de Google son la base",
    whyText: "Las reseñas de Google de miles de personas reales a lo largo de años son la señal más difícil de manipular. Un restaurante con 4,8 de 600 personas en tres años no se puede fabricar. Ese es el punto de partida — y filtramos todo lo que no supera un umbral mínimo de señal real y consistente.",
    factorsTitle: "Cómo construimos los rankings",
    factorsIntro: "Cada categoría se analiza de forma independiente, ponderando el volumen de señal disponible en Google para ese tipo de negocio específico. El orden por defecto usa el MV Score: nuestra señal 0–100 que combina valoración media (Factor 1) y volumen de reseñas (Factor 2) en un solo número — por eso un 4,7 con cientos de reseñas puede ir por delante de un 5,0 con muy pocas.",
    factors: [
      ["Factor 1", "Valoración media", "La nota que los clientes han dado en Google. Una valoración alta es una señal fuerte, pero por sí sola no basta."],
      ["Factor 2", "Volumen de reseñas", "No pesa igual un 4,9 con 8 reseñas que un 4,7 con cientos de opiniones. El volumen ayuda a distinguir señales sólidas."],
      ["Factor 3", "Untapped Score", "Señal propia para detectar negocios excelentes que todavía no están masificados dentro de su categoría."]
    ],
    neverTitle: "Lo que nunca hacemos",
    never: [
      ["Pagar para subir", "La posición se calcula solo con datos públicos de Google. Ofrecemos servicios de optimización de perfil y presencia digital como actividad aparte — pero nunca cambian la posición de un negocio en el ranking."],
      ["Inventar experiencias", "Las fichas parten de reseñas, datos públicos y enlaces verificables."],
      ["Ocultar por razones comerciales", "Si un negocio tiene buenas métricas, puede aparecer aunque no tenga relación comercial con nosotros."]
    ],
    dataTitle: "De dónde vienen los datos",
    dataText: "Usamos datos públicos de Google y los estructuramos para comparar valoración, volumen de reseñas, categoría, zona y consistencia del perfil.",
    published: "negocios publicados",
    reviews: "reseñas analizadas",
    categories: "categorías activas",
    verifiedTitle: "Qué significa 'verificado' en la práctica",
    verifiedText: "No hacemos visitas físicas a los negocios. 'Verificado' significa que hemos comprobado que el perfil en Google Maps es consistente, que el negocio está activo en el momento de publicación, que la categoría es correcta y que el volumen de señal supera el umbral mínimo para su tipo. Los datos de fondo — valoraciones y reseñas — vienen íntegramente de usuarios de Google, no de nosotros.",
    languageTitle: "Verificación de idioma: es su palabra, no la nuestra",
    languageText: "Cuando una ficha muestra 'Habla inglés' o 'Habla alemán', significa que hemos contactado directamente con el negocio y nos lo ha confirmado. Es su propia declaración, no una certificación nuestra ni una deducción de las reseñas. Registramos el idioma y el nivel (fluido o básico) tal como nos lo indican, junto con la fecha de confirmación. La ausencia del badge no significa que no hablen el idioma — solo que aún no lo hemos confirmado. Como el personal cambia, lo reconfirmamos periódicamente.",
    thresholdNote: "El umbral mínimo varía por categoría. Un restaurante necesita muchas más reseñas para rankear con confianza que un veterinario o una inmobiliaria — la razón es simple: la gente reseña restaurantes con mucha más frecuencia que servicios profesionales. Un negocio con buenas métricas pero pocas reseñas no queda excluido para siempre: entra en el ranking en cuanto supera el umbral de su categoría.",
    coverageTitle: "Cobertura actual y limitaciones conocidas",
    coverageText: "Mallorca tiene más de 50 municipios. Todavía no los cubrimos todos, y lo decimos con transparencia. La prioridad actual son las zonas con mayor concentración de turistas internacionales, expats y compradores: Palma, el noroeste, el noreste y las principales zonas de costa. Los pueblos del interior y los municipios menos visitados tienen menor volumen de señal — menos reseñas, negocios más inestables — lo que hace más difícil un ranking fiable. Estamos ampliando la cobertura activamente. El objetivo es convertirnos en el directorio más completo de Mallorca para una audiencia internacional, lo que implica cubrir toda la isla, no solo las partes más obvias.",
    seasonalNote: "Algunos negocios cierran en invierno o solo operan en verano. Mantenemos sus fichas en el ranking con el estado de temporada indicado. No desaparecen — su señal histórica sigue siendo válida y el perfil permanece accesible.",
    faqTitle: "Preguntas frecuentes",
    faqs: [
      ["¿No es esto básicamente lo mismo que Google Maps?", "Google Maps te muestra todo lo que existe. Nosotros filtramos lo que supera un umbral real de señal y lo ordenamos por categoría. La pregunta que contesta Google Maps es '¿existe este sitio?'. La que respondemos nosotros es '¿cuál es el mejor de su categoría en Mallorca?'"],
      ["¿Puede un negocio pagar para subir posiciones?", "No. Aparecer en Mallorca Verified es completamente gratuito y no aceptamos ningún pago por parte de los negocios — ni para incluirlos, ni para mejorar posiciones. Los rankings los determina únicamente el algoritmo con datos públicos de Google: valoración media, volumen de reseñas y consistencia. Una ficha más completa mejora la experiencia del usuario y puede aparecer más en búsquedas de IA, pero no mueve posiciones en el ranking de categoría."],
      ["¿Por qué debería fiarme de esto y no de TripAdvisor?", "TripAdvisor es global y generalista. Nosotros cubrimos solo Mallorca, con más profundidad por zona y categoría, y orientados específicamente a residentes internacionales y compradores. La metodología está publicada — si un ranking te parece incorrecto, puedes consultar los datos de Google que lo sustentan."],
      ["¿Mallorca Verified ayuda a aparecer en ChatGPT o Google AI?", "Sí. La estructura clara, la metodología transparente y los datos verificables hacen que el sitio sea más fácil de citar para sistemas de IA. Varios negocios ya aparecen mencionados cuando alguien pregunta en ChatGPT por su categoría en Mallorca."]
    ]
  },
  en: {
    metaTitle: "Ranking methodology | Mallorca Verified",
    metaDescription: "How Mallorca Verified ranks Mallorca businesses with real Google data, reviews, Untapped Score and independent editorial rules.",
    home: "Home",
    label: "Methodology",
    badge: "Independent rankings",
    title: "Why we rank on Google data — and nothing else",
    intro: "Most travel sites mix advertising, invited stays and personal opinion into their rankings. Mallorca Verified separates them completely. Rankings are built on public Google data — nothing buys a position.",
    businessEyebrow: "For businesses",
    businessTitle: "Improve the profile, not the ranking",
    businessText: "Any business meeting our criteria can add photos, services, menus, opening hours and useful info to their profile at no cost. We accept no payment from businesses for any reason. Positions are determined entirely by public Google data.",
    businessCta: "Contact us →",
    whyTitle: "Why Google reviews are the foundation",
    whyText: "Google reviews from thousands of real visitors over years are the hardest signal to fake. A restaurant with 4.8★ from 600 people over three years can't be manufactured. That's the foundation — and we filter out anything that hasn't cleared a minimum threshold of real, consistent signal.",
    factorsTitle: "How rankings are built",
    factorsIntro: "Each category is analysed independently, weighted according to the signal volume available on Google for that specific type of business. The default order uses the MV Score: our 0–100 signal that combines average rating (Factor 1) and review volume (Factor 2) into a single number — which is why a 4.7 with hundreds of reviews can rank ahead of a 5.0 with very few.",
    factors: [
      ["Factor 1", "Average rating", "The rating customers gave on Google. A high rating is a strong signal, but it is not enough on its own."],
      ["Factor 2", "Review volume", "A 4.9 with 8 reviews is not the same as a 4.7 with hundreds of opinions. Volume helps separate solid signals from isolated cases."],
      ["Factor 3", "Untapped Score", "Our own signal to detect excellent businesses that are not yet overcrowded within their category."]
    ],
    neverTitle: "What we never do",
    never: [
      ["Pay to rank higher", "Ranking position is computed solely from public Google data. We do offer profile-optimisation and digital-presence services as a separate activity — but they never change a business's position in the ranking."],
      ["Invent experiences", "Profiles are built from reviews, public data and verifiable links."],
      ["Hide businesses for commercial reasons", "If a business has strong metrics, it can appear even without a commercial relationship with us."]
    ],
    dataTitle: "Where the data comes from",
    dataText: "We use public Google data and structure it to compare rating, review volume, category, area and profile consistency.",
    published: "published businesses",
    reviews: "reviews analysed",
    categories: "active categories",
    verifiedTitle: "What 'verified' actually means",
    verifiedText: "We don't make physical visits to businesses. 'Verified' means we have confirmed that the Google Maps profile is consistent, the business is currently active, the category is correct and the signal volume meets the minimum threshold for its type. The underlying data — ratings and reviews — comes entirely from Google users, not from us.",
    languageTitle: "Language verification: their word, not ours",
    languageText: "When a listing shows 'Speaks English' or 'Speaks German', it means we contacted the business directly and they confirmed it. It's their own statement — not a certification by us, and not an inference from reviews. We record the language and level (fluent or basic) exactly as they tell us, along with the date it was confirmed. The absence of the badge doesn't mean they don't speak the language — only that we haven't confirmed it yet. Because staff changes, we re-confirm periodically.",
    thresholdNote: "Minimum thresholds vary by category. A restaurant needs significantly more reviews before it can be ranked reliably than a vet or a real estate agency — the reason is simple: more people review restaurants than professional services. A business with strong metrics but few reviews is not excluded permanently; it joins the ranking once it crosses the threshold for its category.",
    coverageTitle: "Current coverage and known gaps",
    coverageText: "Mallorca has over 50 municipalities. We don't cover all of them yet, and we're transparent about it. Current priority is areas with the highest concentration of international tourists, expats and buyers: Palma, the northwest coast, the northeast coast and the main resort belts. Interior villages and less-visited municipalities have lower signal volume — fewer reviews, less stable businesses — which makes reliable ranking harder. We're actively expanding coverage. The goal is to become the most complete Mallorca directory for an international audience, which means covering the whole island, not just the obvious parts.",
    seasonalNote: "Some businesses close for winter or only operate in summer. We keep their profiles in the ranking with a seasonal status marked. They don't disappear — their past signal is still valid and the profile stays accessible.",
    faqTitle: "FAQ",
    faqs: [
      ["Isn't this basically the same as Google Maps?", "Google Maps shows you everything that exists. We filter what clears a real signal threshold and rank it by category. The question Google Maps answers is 'does this place exist?' The question we answer is 'which is actually the best in its category in Mallorca?'"],
      ["Can a business pay to rank higher?", "No. Listing on Mallorca Verified is completely free and we do not accept payment from businesses for any reason — not for being included, not for better positions. Rankings are determined entirely by public Google data: average rating, review volume and consistency. A complete profile is better for users and may appear more in AI searches, but it does not move a position in the category ranking."],
      ["Why should I trust this over TripAdvisor?", "TripAdvisor is global and generic. We cover only Mallorca, with more depth per area and category, aimed specifically at international residents and buyers. The methodology is published — if a ranking seems wrong to you, you can check the underlying Google data that supports it."],
      ["Does Mallorca Verified help with ChatGPT or Google AI?", "Yes. Clear structure, transparent methodology and verifiable data make the site easier for AI systems to cite. Several businesses already appear when someone asks ChatGPT about their category in Mallorca."]
    ]
  },
  de: {
    metaTitle: "Ranking-Methodik | Mallorca Verified",
    metaDescription: "Wie Mallorca Verified Betriebe auf Mallorca mit echten Google-Daten, Bewertungen, Untapped Score und unabhaengigen Regeln sortiert.",
    home: "Start",
    label: "Methodik",
    badge: "Unabhaengige Rankings",
    title: "Warum wir nach Google-Daten ranken — und nach nichts anderem",
    intro: "Die meisten Reiseportale mischen Werbung, eingeladene Aufenthalte und persönliche Meinungen in ihre Rankings. Mallorca Verified trennt das vollständig. Rankings basieren auf öffentlichen Google-Daten — keine Position wird gekauft.",
    businessEyebrow: "Für Betriebe",
    businessTitle: "Profil verbessern, nicht das Ranking",
    businessText: "Jeder Betrieb, der unsere Kriterien erfüllt, kann Fotos, Services, Speisekarte, Öffnungszeiten und nützliche Informationen kostenlos ergänzen. Wir akzeptieren keinerlei Zahlungen von Betrieben. Positionen werden ausschließlich durch öffentliche Google-Daten bestimmt.",
    businessCta: "Kontakt aufnehmen →",
    whyTitle: "Warum Google-Bewertungen die Grundlage sind",
    whyText: "Google-Bewertungen von tausenden echten Besuchern über Jahre sind das schwierigste Signal zu fälschen. Ein Restaurant mit 4,8 von 600 Personen über drei Jahre lässt sich nicht fabricieren. Das ist die Grundlage — und wir filtern alles heraus, das keine minimale Schwelle echter, konsistenter Signale erreicht.",
    factorsTitle: "Wie Rankings entstehen",
    factorsIntro: "Jede Kategorie wird unabhängig analysiert und nach dem verfügbaren Signalvolumen auf Google für diesen spezifischen Betriebstyp gewichtet. Die Standardsortierung nutzt den MV Score: unser 0–100-Signal, das Durchschnittsbewertung (Faktor 1) und Rezensionsvolumen (Faktor 2) zu einer einzigen Zahl kombiniert — deshalb kann ein 4,7 mit Hunderten Rezensionen vor einem 5,0 mit sehr wenigen liegen.",
    factors: [
      ["Faktor 1", "Durchschnittsbewertung", "Die Bewertung, die Kunden auf Google abgegeben haben. Eine hohe Note ist ein starkes Signal, reicht allein aber nicht aus."],
      ["Faktor 2", "Bewertungsvolumen", "Ein 4,9 mit 8 Bewertungen ist nicht dasselbe wie ein 4,7 mit Hunderten Meinungen. Volumen macht Signale belastbarer."],
      ["Faktor 3", "Untapped Score", "Unser eigenes Signal für hervorragende Betriebe, die in ihrer Kategorie noch nicht überlaufen sind."]
    ],
    neverTitle: "Was wir nie tun",
    never: [
      ["Für bessere Positionen bezahlen", "Die Ranking-Position wird ausschließlich aus öffentlichen Google-Daten berechnet. Wir bieten Profil-Optimierung und Digital-Präsenz-Services als separate Tätigkeit an — sie ändern jedoch nie die Position eines Betriebs im Ranking."],
      ["Erfahrungen erfinden", "Profile entstehen aus Bewertungen, öffentlichen Daten und prüfbaren Links."],
      ["Betriebe aus kommerziellen Gründen verstecken", "Hat ein Betrieb starke Kennzahlen, kann er erscheinen, auch ohne kommerzielle Beziehung zu uns."]
    ],
    dataTitle: "Woher die Daten kommen",
    dataText: "Wir nutzen öffentliche Google-Daten und strukturieren sie, um Bewertung, Bewertungsvolumen, Kategorie, Gegend und Profilkonsistenz zu vergleichen.",
    published: "veroeffentlichte Betriebe",
    reviews: "analysierte Bewertungen",
    categories: "aktive Kategorien",
    verifiedTitle: "Was 'verifiziert' in der Praxis bedeutet",
    verifiedText: "Wir machen keine physischen Besuche bei Betrieben. 'Verifiziert' bedeutet, dass wir bestätigt haben: das Google Maps-Profil ist konsistent, der Betrieb ist zum Zeitpunkt der Veröffentlichung aktiv, die Kategorie ist korrekt und das Signalvolumen erreicht den Mindestschwellenwert für seinen Typ. Die zugrundeliegenden Daten — Bewertungen und Rezensionen — kommen ausschließlich von Google-Nutzern, nicht von uns.",
    languageTitle: "Sprachverifizierung: ihre Aussage, nicht unsere",
    languageText: "Wenn eine Anzeige 'Spricht Englisch' oder 'Spricht Deutsch' zeigt, bedeutet das, dass wir den Betrieb direkt kontaktiert haben und er es bestätigt hat. Es ist seine eigene Aussage — keine Zertifizierung durch uns und keine Ableitung aus Bewertungen. Wir erfassen Sprache und Niveau (fließend oder Grundkenntnisse) genau so, wie man es uns mitteilt, zusammen mit dem Bestätigungsdatum. Das Fehlen des Badges bedeutet nicht, dass die Sprache nicht gesprochen wird — nur, dass wir es noch nicht bestätigt haben. Da sich Personal ändert, bestätigen wir es regelmäßig neu.",
    thresholdNote: "Die Mindestschwelle variiert je nach Kategorie. Ein Restaurant braucht deutlich mehr Bewertungen, bevor es zuverlässig gerankt werden kann, als ein Tierarzt oder eine Immobilienagentur — der Grund ist einfach: mehr Menschen bewerten Restaurants als professionelle Dienstleistungen. Ein Betrieb mit guten Kennzahlen, aber wenigen Bewertungen wird nicht dauerhaft ausgeschlossen; er tritt ins Ranking ein, sobald er die Schwelle seiner Kategorie überschreitet.",
    coverageTitle: "Aktuelle Abdeckung und bekannte Lücken",
    coverageText: "Mallorca hat über 50 Gemeinden. Wir decken noch nicht alle ab, und wir sind transparent darüber. Aktuelle Priorität sind die Gebiete mit der höchsten Konzentration internationaler Touristen, Expats und Käufer: Palma, die Nordwestküste, die Nordostküste und die wichtigsten Urlaubsregionen. Dörfer im Landesinneren und weniger besuchte Gemeinden haben ein geringeres Signalvolumen — weniger Bewertungen, instabilere Betriebe — was ein zuverlässiges Ranking schwieriger macht. Wir erweitern die Abdeckung aktiv. Das Ziel ist es, das vollständigste Mallorca-Verzeichnis für ein internationales Publikum zu werden, was bedeutet, die gesamte Insel abzudecken, nicht nur die naheliegenden Teile.",
    seasonalNote: "Einige Betriebe schließen im Winter oder sind nur im Sommer geöffnet. Wir halten ihre Profile im Ranking mit einem Saisonstatus versehen. Sie verschwinden nicht — ihr historisches Signal ist weiterhin gültig und das Profil bleibt zugänglich.",
    faqTitle: "Häufige Fragen",
    faqs: [
      ["Ist das nicht im Grunde dasselbe wie Google Maps?", "Google Maps zeigt alles, was existiert. Wir filtern, was eine echte Signalschwelle überschreitet, und ordnen es nach Kategorie. Die Frage, die Google Maps beantwortet: 'Gibt es diesen Ort?' Die Frage, die wir beantworten: 'Welcher ist der beste seiner Kategorie auf Mallorca?'"],
      ["Kann ein Betrieb für eine bessere Position bezahlen?", "Nein. Die Aufnahme bei Mallorca Verified ist vollständig kostenlos, und wir akzeptieren keinerlei Zahlungen von Betrieben — weder für die Aufnahme noch für bessere Positionen. Rankings werden ausschließlich durch öffentliche Google-Daten bestimmt: Durchschnittsbewertung, Bewertungsvolumen und Konsistenz. Ein vollständiges Profil verbessert die Nutzererfahrung und kann in KI-Suchen häufiger erscheinen, ändert aber keine Position im Kategorie-Ranking."],
      ["Warum sollte ich diesem Verzeichnis und nicht TripAdvisor vertrauen?", "TripAdvisor ist global und generalistisch. Wir decken nur Mallorca ab, mit mehr Tiefe pro Gebiet und Kategorie, speziell für internationale Bewohner und Käufer. Die Methodik ist veröffentlicht — wenn ein Ranking dir falsch erscheint, kannst du die zugrunde liegenden Google-Daten prüfen."],
      ["Hilft Mallorca Verified dabei, bei ChatGPT oder Google AI zu erscheinen?", "Ja. Klare Struktur, transparente Methodik und überprüfbare Daten machen das Portal für KI-Systeme leichter zitierbar. Einige Betriebe erscheinen bereits, wenn jemand ChatGPT nach ihrer Kategorie auf Mallorca fragt."]
    ]
  }
} as const;

// ─── About copy ─────────────────────────────────────────────────────────────

const aboutCopy = {
  es: {
    metaTitle: "Quiénes somos | Mallorca Verified",
    metaDescription: "Un equipo con raíces en Mallorca que construyó el directorio de referencia para residentes internacionales, compradores y expats en la isla. Sin publicidad, sin posiciones de pago.",
    home: "Inicio",
    label: "Quiénes somos",
    badge: "El equipo",
    title: "La gente detrás de Mallorca Verified",
    intro: "Un equipo pequeño con raíces en Mallorca que construyó el directorio de referencia para residentes internacionales, compradores y expats. Sin publicidad, sin posiciones de pago.",
    whyTitle: "Por qué lo construimos",
    whyText: "Cada año millones de personas llegan a Mallorca sin contactos locales y acaban confiando en listas patrocinadas, rankings de pago o webs de viajes genéricas que no conocen la isla. Para expats y compradores internacionales el problema es doble: también necesitan profesionales de confianza en su idioma para las decisiones que realmente importan. Quisimos construir algo diferente: un directorio ordenado por datos públicos de Google, con cada posición ganada y ninguna comprada.",
    teamTitle: "Cómo trabajamos",
    teamText: "Combinamos conocimiento local con análisis de datos. Conocemos la isla en temporada alta y en invierno, en el centro y en los pueblos del interior. Esa perspectiva local nos ayuda a separar los sitios que de verdad funcionan de los que solo tienen buena campaña de marketing — y a entender qué necesita alguien que acaba de llegar a la isla.",
    principlesTitle: "Nuestros principios",
    principles: [
      ["Datos primero", "Cada posición en los rankings se basa en valoración media, volumen de reseñas y el Untapped Score. No en la opinión de un solo editor."],
      ["Editorial independiente", "No aceptamos pago para incluir o destacar negocios. Los rankings se generan a partir de datos públicos y no se pueden comprar."],
      ["Transparencia total", "Publicamos nuestra metodología. Cualquiera puede entender por qué un negocio aparece donde aparece."],
      ["Actualización continua", "Mallorca cambia. Los datos se actualizan periódicamente para reflejar el estado real de cada negocio."]
    ],
    published: "negocios publicados",
    reviews: "reseñas analizadas",
    categories: "categorías activas",
    contactTitle: "¿Hablamos?",
    contactText: "Si tienes preguntas sobre el proyecto, quieres reportar un error o simplemente quieres decir hola, escríbenos.",
    contactCta: "hola@mallorcaverified.com",
    editorialLinkText: "Leer nuestra política editorial →",
  },
  en: {
    metaTitle: "About us | Mallorca Verified",
    metaDescription: "A small team with roots in Mallorca that built the reference directory for international residents, buyers and expats on the island. No advertising, no paid placements.",
    home: "Home",
    label: "About us",
    badge: "The team",
    title: "The people behind Mallorca Verified",
    intro: "A small team with roots in Mallorca that built the reference directory for international residents, buyers and expats. No advertising, no paid placements.",
    whyTitle: "Why we built this",
    whyText: "Every year millions of people come to Mallorca without local contacts and end up relying on sponsored lists, paid rankings or generic travel sites that don't know the island. For expats and international buyers the problem compounds: they also need trusted professionals in their language for the decisions that really matter. We built something different — a directory ranked purely on public Google data, with every position earned and none bought.",
    teamTitle: "How we work",
    teamText: "We combine local knowledge with data analysis. We know the island in high season and in winter, in the centre and in the inland villages. That local perspective helps us separate places that genuinely deliver from those with a good marketing campaign — and understand what someone needs when they've just arrived on the island.",
    principlesTitle: "Our principles",
    principles: [
      ["Data first", "Every ranking position is based on average rating, review volume and the Untapped Score. Not on a single editor's opinion."],
      ["Independent editorial", "We do not accept payment to include or feature businesses. Rankings are generated from public data and cannot be bought."],
      ["Full transparency", "We publish our methodology. Anyone can understand why a business appears where it appears."],
      ["Continuous updates", "Mallorca changes. Data is updated periodically to reflect the real state of each business."]
    ],
    published: "published businesses",
    reviews: "reviews analysed",
    categories: "active categories",
    contactTitle: "Get in touch",
    contactText: "If you have questions about the project, want to report an error or just want to say hello, write to us.",
    contactCta: "hola@mallorcaverified.com",
    editorialLinkText: "Read our editorial policy →",
  },
  de: {
    metaTitle: "Ueber uns | Mallorca Verified",
    metaDescription: "Ein kleines Team mit Mallorca-Wurzeln, das das Referenzverzeichnis für internationale Bewohner, Käufer und Expats auf der Insel aufgebaut hat. Keine Werbung, keine bezahlten Platzierungen.",
    home: "Start",
    label: "Über uns",
    badge: "Das Team",
    title: "Die Menschen hinter Mallorca Verified",
    intro: "Ein kleines Team mit Wurzeln auf Mallorca, das das Referenzverzeichnis für internationale Bewohner, Käufer und Expats aufgebaut hat. Keine Werbung, keine bezahlten Platzierungen.",
    whyTitle: "Warum wir das aufgebaut haben",
    whyText: "Jedes Jahr kommen Millionen Menschen ohne lokale Kontakte nach Mallorca und verlassen sich auf gesponserte Listen, bezahlte Rankings oder generische Reiseseiten, die die Insel nicht kennen. Für Expats und internationale Käufer ist das Problem doppelt: Sie brauchen auch vertrauenswürdige Profis in ihrer Sprache für die Entscheidungen, die wirklich zählen. Wir wollten etwas anderes bauen — ein Verzeichnis, das ausschließlich nach öffentlichen Google-Daten gerankt wird, jede Position verdient und keine gekauft.",
    teamTitle: "Wie wir arbeiten",
    teamText: "Wir kombinieren lokales Wissen mit Datenanalyse. Wir kennen die Insel in der Hochsaison und im Winter, im Zentrum und in den Dörfern im Inland. Diese lokale Perspektive hilft uns, Orte, die wirklich funktionieren, von solchen zu unterscheiden, die nur eine gute Marketingkampagne haben — und zu verstehen, was jemand braucht, der gerade auf die Insel gezogen ist.",
    principlesTitle: "Unsere Grundsaetze",
    principles: [
      ["Daten zuerst", "Jede Ranking-Position basiert auf Durchschnittsbewertung, Bewertungsvolumen und dem Untapped Score. Nicht auf der Meinung eines einzelnen Redakteurs."],
      ["Unabhaengige Redaktion", "Wir akzeptieren keine Zahlungen für die Aufnahme oder Hervorhebung von Betrieben. Rankings werden aus öffentlichen Daten generiert und sind nicht kaeufllich."],
      ["Volle Transparenz", "Wir veroffentlichen unsere Methodik. Jeder kann verstehen, warum ein Betrieb dort erscheint, wo er erscheint."],
      ["Kontinuierliche Aktualisierung", "Mallorca veraendert sich. Die Daten werden regelmäßig aktualisiert, um den echten Zustand jedes Betriebs widerzuspiegeln."]
    ],
    published: "veroeffentlichte Betriebe",
    reviews: "analysierte Bewertungen",
    categories: "aktive Kategorien",
    contactTitle: "Schreib uns",
    contactText: "Wenn du Fragen zum Projekt hast, einen Fehler melden moechtest oder einfach Hallo sagen willst, schreib uns.",
    contactCta: "hola@mallorcaverified.com",
    editorialLinkText: "Unsere redaktionellen Richtlinien lesen →",
  }
} as const;

// ─── Editorial copy ──────────────────────────────────────────────────────────

const editorialCopy = {
  es: {
    metaTitle: "Política editorial | Mallorca Verified",
    metaDescription: "Cómo Mallorca Verified decide qué publica, qué fuentes usa, cómo actualiza los datos y cómo separa los rankings del contenido patrocinado.",
    home: "Inicio",
    label: "Política editorial",
    badge: "Transparencia editorial",
    title: "Cómo decidimos qué aparece aquí",
    intro: "Criterios claros para que cualquiera pueda entender qué publicamos, por qué y cómo lo actualizamos.",
    criteriaTitle: "Criterios de inclusión",
    criteria: [
      ["Verificable en Google", "Solo publicamos negocios con perfil verificable en Google Maps. Es la base que permite comparar valoraciones con una metodología consistente."],
      ["Volumen mínimo de reseñas", "Necesitamos suficiente señal estadística para clasificar un negocio con confianza. Un negocio con 3 reseñas no es comparable a uno con 300."],
      ["Activo en el momento de publicación", "Los negocios cerrados o con actividad dudosa no se publican. Los que cierran después de la publicación se marcan o eliminan."],
      ["Categoría correcta", "El negocio debe encajar en una de nuestras 17 categorías activas. No incluimos negocios que no encajan claramente en ninguna."]
    ],
    sourcesTitle: "Fuentes de datos",
    sourcesText: "Todos los datos que usamos son públicamente verificables. No aceptamos información de los propios negocios como única fuente.",
    sources: [
      ["Google Places", "Valoración media, volumen de reseñas, horarios, categoría, coordenadas geográficas y estado del perfil."],
      ["Verificación editorial", "Antes de publicar, revisamos manualmente que la ficha del negocio sea coherente: nombre, dirección, categoría y datos básicos."],
      ["Señales adicionales", "Consistencia del perfil a lo largo del tiempo, presencia web cuando está disponible y calidad visual de las fotos del negocio."]
    ],
    updateTitle: "Proceso de actualización",
    updateText: "Los datos no son estáticos. Actualizamos los rankings periódicamente y revisamos fichas cuando detectamos cambios relevantes.",
    updates: [
      ["Rankings", "Los datos de valoración y volumen de reseñas se actualizan periódicamente. Los cambios significativos pueden mover posiciones en la siguiente actualización."],
      ["Fichas de negocios", "Se revisan cuando hay cambios importantes: cierre, cambio de nombre, cambio de categoría o inconsistencias detectadas."],
      ["Guías editoriales", "Se revisan y actualizan al menos una vez al año para reflejar cambios en la oferta de la isla."]
    ],
    separationTitle: "Separación publicitaria",
    separationText: "Mantenemos una separación estricta entre rankings objetivos y cualquier relación comercial.",
    separations: [
      ["No pagamos para aparecer", "Los negocios no pueden pagar para entrar en los rankings ni para mejorar su posición."],
      ["Colaboraciones no afectan posiciones", "Una colaboración de enriquecimiento de ficha (fotos, datos, descripción) no modifica la posición en rankings."],
      ["Contenido patrocinado etiquetado", "Si en algún momento publicamos contenido patrocinado, estará claramente etiquetado como tal."]
    ],
    correctionsTitle: "Correcciones",
    correctionsText: "Si detectas información incorrecta, un negocio cerrado o cualquier error, escríbenos. Revisamos y corregimos con la mayor rapidez posible.",
    correctionsCta: "hola@mallorcaverified.com",
    aboutLinkText: "Conocer al equipo →",
  },
  en: {
    metaTitle: "Editorial policy | Mallorca Verified",
    metaDescription: "How Mallorca Verified decides what to publish, what sources it uses, how it updates data and how it separates rankings from sponsored content.",
    home: "Home",
    label: "Editorial policy",
    badge: "Editorial transparency",
    title: "How we decide what appears here",
    intro: "Clear criteria so anyone can understand what we publish, why and how we update it.",
    criteriaTitle: "Inclusion criteria",
    criteria: [
      ["Verifiable on Google", "We only publish businesses with a verifiable profile on Google Maps. This is the foundation that allows consistent rating comparisons."],
      ["Minimum review volume", "We need enough statistical signal to classify a business with confidence. A business with 3 reviews is not comparable to one with 300."],
      ["Active at time of publication", "Closed or questionable businesses are not published. Those that close after publication are flagged or removed."],
      ["Correct category", "The business must fit one of our 17 active categories. We do not include businesses that do not clearly fit any of them."]
    ],
    sourcesTitle: "Data sources",
    sourcesText: "All data we use is publicly verifiable. We do not accept information from businesses themselves as the sole source.",
    sources: [
      ["Google Places", "Average rating, review volume, opening hours, category, coordinates and profile status."],
      ["Editorial verification", "Before publishing, we manually check that the business profile is coherent: name, address, category and basic data."],
      ["Additional signals", "Profile consistency over time, web presence when available and visual quality of business photos."]
    ],
    updateTitle: "Update process",
    updateText: "Data is not static. We update rankings periodically and review profiles when we detect relevant changes.",
    updates: [
      ["Rankings", "Rating and review volume data is updated periodically. Significant changes can shift positions in the next update."],
      ["Business profiles", "Reviewed when there are important changes: closure, name change, category change or detected inconsistencies."],
      ["Editorial guides", "Reviewed and updated at least once a year to reflect changes in the island's offering."]
    ],
    separationTitle: "Advertising separation",
    separationText: "We maintain a strict separation between objective rankings and any commercial relationship.",
    separations: [
      ["No payment to appear", "Businesses cannot pay to enter rankings or improve their position."],
      ["Collaborations do not affect positions", "A profile enrichment collaboration (photos, data, description) does not change ranking position."],
      ["Sponsored content labelled", "If we ever publish sponsored content, it will be clearly labelled as such."]
    ],
    correctionsTitle: "Corrections",
    correctionsText: "If you spot incorrect information, a closed business or any error, write to us. We review and correct as quickly as possible.",
    correctionsCta: "hola@mallorcaverified.com",
    aboutLinkText: "Meet the team →",
  },
  de: {
    metaTitle: "Redaktionelle Richtlinien | Mallorca Verified",
    metaDescription: "Wie Mallorca Verified entscheidet, was veroeffentlicht wird, welche Quellen es verwendet, wie es Daten aktualisiert und Rankings von gesponsertem Inhalt trennt.",
    home: "Start",
    label: "Redaktionelle Richtlinien",
    badge: "Redaktionelle Transparenz",
    title: "Wie wir entscheiden, was hier erscheint",
    intro: "Klare Kriterien, damit jeder verstehen kann, was wir veröffentlichen, warum und wie wir es aktualisieren.",
    criteriaTitle: "Aufnahmekriterien",
    criteria: [
      ["Auf Google pruefbar", "Wir veröffentlichen nur Betriebe mit einem prüfbaren Profil auf Google Maps. Das ist die Grundlage für konsistente Bewertungsvergleiche."],
      ["Mindestbewertungsvolumen", "Wir benoetigen genuegend statistisches Signal, um einen Betrieb zuverlaessig einzustufen. Ein Betrieb mit 3 Bewertungen ist nicht mit einem mit 300 vergleichbar."],
      ["Aktiv zum Zeitpunkt der Veroeffentlichung", "Geschlossene oder zweifelhafte Betriebe werden nicht veroeffentlicht. Solche, die nach der Veroeffentlichung schliessen, werden markiert oder entfernt."],
      ["Richtige Kategorie", "Der Betrieb muss in eine unserer 17 aktiven Kategorien passen. Wir nehmen keine Betriebe auf, die in keine davon passen."]
    ],
    sourcesTitle: "Datenquellen",
    sourcesText: "Alle Daten, die wir verwenden, sind oeffentlich pruefbar. Wir akzeptieren keine Informationen von den Betrieben selbst als einzige Quelle.",
    sources: [
      ["Google Places", "Durchschnittsbewertung, Bewertungsvolumen, Öffnungszeiten, Kategorie, Koordinaten und Profilstatus."],
      ["Redaktionelle Pruefung", "Vor der Veroeffentlichung pruefen wir manuell, ob das Betriebsprofil koharent ist: Name, Adresse, Kategorie und Basisdaten."],
      ["Zusaetzliche Signale", "Profilkonsistenz im Zeitverlauf, Webpraesenz wo verfuegbar und visuelle Qualitaet der Betriebsfotos."]
    ],
    updateTitle: "Aktualisierungsprozess",
    updateText: "Daten sind nicht statisch. Wir aktualisieren Rankings regelmäßig und ueberpruefen Profile, wenn wir relevante Aenderungen feststellen.",
    updates: [
      ["Rankings", "Bewertungs- und Volumendaten werden regelmäßig aktualisiert. Bedeutende Aenderungen koennen beim naechsten Update zu Positionsverschiebungen fuehren."],
      ["Betriebsprofile", "Werden bei wichtigen Aenderungen ueberprueeft: Schliessung, Namensaenderung, Kategorieaenderung oder festgestellte Inkonsistenzen."],
      ["Redaktionelle Guides", "Werden mindestens einmal jaehrlich ueberprueeft und aktualisiert, um Veraenderungen im Angebot der Insel widerzuspiegeln."]
    ],
    separationTitle: "Werbetrennunng",
    separationText: "Wir halten eine strikte Trennung zwischen objektiven Rankings und jeglicher kommerzieller Beziehung aufrecht.",
    separations: [
      ["Keine Zahlung für Aufnahme", "Betriebe koennen nicht dafür bezahlen, in Rankings aufgenommen oder besser platziert zu werden."],
      ["Kooperationen beeinflussen keine Positionen", "Eine Profilanreicherungs-Kooperation (Fotos, Daten, Beschreibung) aendert die Ranking-Position nicht."],
      ["Gesponserter Inhalt gekennzeichnet", "Wenn wir jemals gesponserten Inhalt veröffentlichen, wird dieser klar als solcher gekennzeichnet."]
    ],
    correctionsTitle: "Korrekturen",
    correctionsText: "Wenn du falsche Informationen, einen geschlossenen Betrieb oder einen Fehler entdeckst, schreib uns. Wir pruefen und korrigieren so schnell wie möglich.",
    correctionsCta: "hola@mallorcaverified.com",
    aboutLinkText: "Das Team kennenlernen →",
  }
} as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function safeParams(locale: string, slug: string): { locale: Locale; pageType: StaticPageType } {
  if (!isLocale(locale)) notFound();
  const pageType = getStaticPageType(locale as Locale, slug);
  if (!pageType) notFound();
  return { locale: locale as Locale, pageType };
}

function numberLocale(locale: Locale) {
  return locale === "de" ? "de-DE" : locale === "en" ? "en-US" : "es-ES";
}

function formatIntegerMetric(value: number, locale: Locale) {
  return value.toLocaleString(numberLocale(locale));
}

function formatMillionMetric(value: number, locale: Locale) {
  if (value < 1_000_000) return formatIntegerMetric(value, locale);
  return `${(value / 1_000_000).toLocaleString(numberLocale(locale), { maximumFractionDigits: 1 })}M+`;
}

function methodologyPageSections(locale: Locale) {
  if (locale === "en") {
    return [
      {
        title: "Places and rankings",
        text: "Category pages and ranking pages are built for comparison: rating, review volume, area, category and practical public data. They are not paid lists."
      },
      {
        title: "Business profiles",
        text: "Profile pages organise the public facts people need before deciding: address, opening hours, price guidance, Google rating, selected review signals and what the place offers."
      },
      {
        title: "Guides",
        text: "Guides add editorial context when a pure ranking is not enough: how to choose an area, what to compare and which trade-offs matter."
      }
    ];
  }
  if (locale === "de") {
    return [
      {
        title: "Orte und Rankings",
        text: "Kategorie- und Rankingseiten sind zum Vergleichen gedacht: Bewertung, Bewertungsvolumen, Gebiet, Kategorie und praktische öffentliche Daten. Es sind keine gekauften Listen."
      },
      {
        title: "Profile von Betrieben",
        text: "Profilseiten ordnen die öffentlichen Fakten, die Nutzer vor einer Entscheidung brauchen: Adresse, Öffnungszeiten, Preisorientierung, Google-Bewertung, Bewertungssignale und Angebot."
      },
      {
        title: "Guides",
        text: "Guides ergänzen redaktionellen Kontext, wenn ein reines Ranking nicht reicht: Gebietswahl, Vergleichskriterien und wichtige Kompromisse."
      }
    ];
  }
  return [
    {
      title: "Places y rankings",
      text: "Las páginas de categoría y ranking sirven para comparar: valoración, volumen de reseñas, zona, categoría y datos públicos útiles. No son listas compradas."
    },
    {
      title: "Fichas de negocios",
      text: "Las fichas ordenan los datos públicos que una persona necesita antes de decidir: dirección, horarios, precio orientativo, valoración de Google, señales de reseñas y qué ofrece."
    },
    {
      title: "Guías",
      text: "Las guías añaden contexto editorial cuando un ranking no basta: cómo elegir zona, qué comparar y qué detalles conviene tener en cuenta."
    }
  ];
}

function canonicalForPage(locale: Locale, pageType: StaticPageType) {
  if (pageType === "about") return `${siteUrl}${aboutPath(locale)}`;
  if (pageType === "editorial") return `${siteUrl}${editorialPath(locale)}`;
  return `${siteUrl}${methodologyPath(locale)}`;
}

// ─── Static params ───────────────────────────────────────────────────────────

export function generateStaticParams() {
  const params = [];
  for (const locale of locales) {
    params.push({ locale, methodology: methodologySlugs[locale] });
    params.push({ locale, methodology: aboutSlugs[locale] });
    params.push({ locale, methodology: editorialSlugs[locale] });
  }
  return params;
}

// ─── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ locale: string; methodology: string }> }): Promise<Metadata> {
  const { locale, methodology } = await params;
  const { locale: safeLocale, pageType } = safeParams(locale, methodology);

  const c = pageType === "about" ? aboutCopy[safeLocale]
    : pageType === "editorial" ? editorialCopy[safeLocale]
    : methodologyCopy[safeLocale];

  const canonical = canonicalForPage(safeLocale, pageType);

  const altUrls = pageType === "about"
    ? Object.fromEntries(locales.map((l) => [l, `${siteUrl}${aboutPath(l)}`]))
    : pageType === "editorial"
    ? Object.fromEntries(locales.map((l) => [l, `${siteUrl}${editorialPath(l)}`]))
    : Object.fromEntries(locales.map((l) => [l, `${siteUrl}${methodologyPath(l)}`]));

  return {
    title: c.metaTitle,
    description: c.metaDescription,
    alternates: { canonical, languages: altUrls },
    openGraph: {
      title: c.metaTitle,
      description: c.metaDescription,
      url: canonical,
      siteName: siteConfig.name,
      locale: safeLocale,
      type: "article"
    },
    twitter: { card: "summary_large_image", title: c.metaTitle, description: c.metaDescription }
  };
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function StaticInfoPage({ params }: { params: Promise<{ locale: string; methodology: string }> }) {
  const { locale, methodology } = await params;
  const { locale: safeLocale, pageType } = safeParams(locale, methodology);
  const canonical = canonicalForPage(safeLocale, pageType);
  const publicStats = await getPublicBusinessStats();

  if (pageType === "about") return <AboutPage locale={safeLocale} canonical={canonical} stats={publicStats} />;
  if (pageType === "editorial") return <EditorialPage locale={safeLocale} canonical={canonical} />;
  return <MethodologyPage locale={safeLocale} canonical={canonical} stats={publicStats} />;
}

// ─── Methodology page ─────────────────────────────────────────────────────────

function MethodologyPage({ locale, canonical, stats }: { locale: Locale; canonical: string; stats: Awaited<ReturnType<typeof getPublicBusinessStats>> }) {
  const c = methodologyCopy[locale];
  const breadcrumbs = [
    { name: c.home, url: `${siteUrl}/${locale}` },
    { name: c.label, url: canonical }
  ];
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: c.title,
    description: c.metaDescription,
    inLanguage: locale,
    author: { "@type": "Organization", name: siteConfig.name },
    publisher: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
    mainEntityOfPage: canonical
  };
  const pageSections = methodologyPageSections(locale);

  return (
    <main className="bg-[#07101F]">
      <section className="bg-[#0C1A2E] px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Breadcrumbs items={[{ label: c.home, href: `/${locale}` }, { label: c.label, href: methodologyPath(locale) }]} />
          <div className="mt-8 max-w-4xl text-center sm:text-left">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-white">
              <IconShieldCheck size={15} stroke={2} />
              {c.badge}
            </div>
            <h1 className="font-display text-balance text-3xl font-black leading-[1.03] text-white sm:text-5xl lg:text-6xl">{c.title}</h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/75">{c.intro}</p>
          </div>
        </div>
      </section>

      <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <section className="border-b border-white/[0.08] pb-10">
          <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#00C37A]/50">01</p>
          <h2 className="font-sans text-2xl font-black leading-tight text-white sm:text-3xl">
            {locale === "en" ? "Who this is for" : locale === "de" ? "Für wen das hier ist" : "Para quién es esto"}
          </h2>
          <p className="mt-5 text-base leading-8 text-white/70">
            {locale === "en"
              ? "Mallorca Verified is built for people who arrive on the island without local contacts: tourists who want the best places to eat and stay, expats and international residents who need reliable professionals, and foreign buyers making decisions that matter. Without a trusted reference, the default outcome is paid rankings and sponsored lists."
              : locale === "de"
              ? "Mallorca Verified ist für Menschen, die ohne lokale Kontakte auf die Insel kommen: Touristen, die die besten Orte zum Essen und Übernachten finden wollen, Expats und internationale Bewohner, die zuverlässige Profis brauchen, und ausländische Käufer, die wichtige Entscheidungen treffen. Ohne eine vertrauenswürdige Referenz landen sie in bezahlten Rankings und gesponserten Listen."
              : "Mallorca Verified está construido para personas que llegan a la isla sin contactos locales: turistas que quieren los mejores sitios para comer y dormir, expats y residentes internacionales que necesitan profesionales fiables, y compradores extranjeros que toman decisiones importantes. Sin una referencia de confianza, el resultado son rankings de pago y listas patrocinadas."}
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {(locale === "en"
              ? [
                  ["Tourists & visitors", "Rankings to find the best restaurants, beach clubs, hotels and activities — without tourist traps or paid placements."],
                  ["Expats & new residents", "Verified professionals who speak English or German for decisions that matter: healthcare, legal, property, finance."],
                  ["International buyers", "Estate agents, lawyers and mortgage brokers with real track records with foreign buyers — not the ones with the most advertising."],
                  ["Long-term residents", "From vets and dentists to car dealers and gyms, ranked by real data from people who actually live here."]
                ]
              : locale === "de"
              ? [
                  ["Touristen & Besucher", "Rankings für die besten Restaurants, Beachclubs, Hotels und Aktivitäten — ohne Touristenfallen oder bezahlte Platzierungen."],
                  ["Expats & neue Bewohner", "Verifizierte Profis, die Deutsch oder Englisch sprechen, für wichtige Entscheidungen: Gesundheit, Recht, Immobilien, Finanzen."],
                  ["Internationale Käufer", "Makler, Anwälte und Hypothekenbroker mit echtem Track Record mit ausländischen Käufern — nicht die mit der meisten Werbung."],
                  ["Langzeit-Residenten", "Von Tierärzten und Zahnärzten bis zu Autohändlern und Fitnessstudios — nach echten Daten von Menschen, die hier leben."]
                ]
              : [
                  ["Turistas y visitantes", "Rankings para los mejores restaurantes, beach clubs, hoteles y actividades — sin tourist traps ni posiciones de pago."],
                  ["Expats y nuevos residentes", "Profesionales verificados que hablan inglés o alemán para las decisiones que importan: salud, legal, propiedad, finanzas."],
                  ["Compradores internacionales", "Agentes, abogados y brokers con track record real con compradores extranjeros — no los que más publicidad tienen."],
                  ["Residentes de larga duración", "Desde veterinarios y dentistas hasta concesionarios y gimnasios, ordenados por datos reales de gente que vive aquí."]
                ]
            ).map(([title, text]) => (
              <div key={title} className="rounded-lg border border-white/[0.08] bg-[#0C1A2E] p-5">
                <h3 className="font-sans text-base font-bold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-white/60">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-b border-white/[0.08] py-10">
          <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#00C37A]/50">02</p>
          <h2 className="font-sans text-2xl font-black leading-tight text-white sm:text-3xl">{c.whyTitle}</h2>
          <p className="mt-5 text-base leading-8 text-white/70">{c.whyText}</p>
        </section>

        <section className="border-b border-white/[0.08] py-10">
          <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#00C37A]/50">03</p>
          <h2 className="font-sans text-2xl font-black leading-tight text-white sm:text-3xl">{c.factorsTitle}</h2>
          <p className="mt-5 text-base leading-8 text-white/70">{c.factorsIntro}</p>
          <div className="mt-7 grid gap-4">
            {c.factors.map(([eyebrow, title, text], index) => {
              const Icon = index === 0 ? IconStar : index === 1 ? IconMessages : IconDiamond;
              const isProprietary = index === c.factors.length - 1;
              return (
                <div
                  key={title}
                  className={
                    isProprietary
                      ? "rounded-lg border border-[#00C37A]/55 bg-[linear-gradient(135deg,#07101F_0%,#0F2035_60%,#07101F_100%)] p-5 shadow-[0_0_0_1px_rgba(0,195,122,0.12)]"
                      : "rounded-lg border border-white/[0.08] bg-[#0C1A2E] p-5 shadow-none"
                  }
                >
                  <div className="flex gap-4">
                    <Icon size={26} stroke={1.8} className="mt-1 shrink-0 text-[#00C37A]" />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#00C37A]">{eyebrow}</p>
                        {isProprietary && (
                          <span className="rounded-full bg-[#00C37A]/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.1em] text-[#00C37A]">
                            {locale === "en" ? "Our own signal" : locale === "de" ? "Eigenes Signal" : "Señal propia"}
                          </span>
                        )}
                      </div>
                      <h3 className="mt-1 font-sans text-xl font-bold text-white">{title}</h3>
                      <p className="mt-3 text-sm leading-7 text-white/70">{text}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="border-b border-white/[0.08] py-10">
          <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#00C37A]/50">04</p>
          <h2 className="font-sans text-2xl font-black leading-tight text-white sm:text-3xl">{c.neverTitle}</h2>
          <div className="mt-6 grid gap-4">
            {c.never.map(([title, text]) => (
              <div key={title} className="flex gap-4 rounded-lg border border-white/[0.08] bg-[#0C1A2E] p-5">
                <IconShieldCheck size={22} stroke={2} className="mt-1 shrink-0 text-[#00C37A]" />
                <div>
                  <h3 className="font-sans text-lg font-bold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-7 text-white/70">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="border-b border-white/[0.08] py-10">
          <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#00C37A]/50">05</p>
          <h2 className="font-sans text-2xl font-black leading-tight text-white sm:text-3xl">{c.dataTitle}</h2>
          <p className="mt-5 text-base leading-8 text-white/70">{c.dataText}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { value: formatIntegerMetric(stats.publishedBusinesses, locale), label: c.published },
              { value: formatMillionMetric(stats.analyzedReviews, locale), label: c.reviews },
              { value: formatIntegerMetric(publicCategorySlugs.length, locale), label: c.categories }
            ].map((stat) => (
              <div key={stat.label} className="rounded-lg border border-[#00C37A]/60 bg-[linear-gradient(135deg,#07101F_0%,#0F2035_58%,#07101F_100%)] px-6 py-5 text-white">
                <div className="font-sans text-4xl font-black leading-none text-[#00C37A]">{stat.value}</div>
                <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white/75">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="border-b border-white/[0.08] py-10">
          <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#00C37A]/50">06</p>
          <h2 className="font-sans text-2xl font-black leading-tight text-white sm:text-3xl">{c.verifiedTitle}</h2>
          <p className="mt-5 text-base leading-8 text-white/70">{c.verifiedText}</p>
          <div className="mt-6 rounded-lg border border-white/[0.08] bg-[#0C1A2E] p-5">
            <p className="text-sm leading-7 text-white/70">{c.thresholdNote}</p>
          </div>
          <h3 className="mt-8 font-sans text-xl font-black leading-tight text-white sm:text-2xl">{c.languageTitle}</h3>
          <p className="mt-4 text-base leading-8 text-white/70">{c.languageText}</p>
        </section>

        <section className="border-b border-white/[0.08] py-10">
          <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#00C37A]/50">07</p>
          <h2 className="font-sans text-2xl font-black leading-tight text-white sm:text-3xl">{c.coverageTitle}</h2>
          <p className="mt-5 text-base leading-8 text-white/70">{c.coverageText}</p>
          <div className="mt-6 rounded-lg border border-white/[0.08] bg-[#0C1A2E] p-5">
            <p className="text-sm leading-7 text-white/70">{c.seasonalNote}</p>
          </div>
        </section>

        <section className="border-b border-white/[0.08] py-10">
          <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#00C37A]/50">08</p>
          <h2 className="font-sans text-2xl font-black leading-tight text-white sm:text-3xl">
            {locale === "en" ? "How each page works" : locale === "de" ? "Wie jede Seite funktioniert" : "Cómo funciona cada página"}
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {pageSections.map((item, index) => {
              const PageIcon = index === 0 ? IconChartBar : index === 1 ? IconStar : IconDiamond;
              return (
              <div key={item.title} className="rounded-lg border border-white/[0.10] border-t-2 border-t-[#00C37A]/50 bg-[#0C1A2E] p-5 shadow-none">
                <PageIcon size={22} stroke={1.8} className="text-[#00C37A]" />
                <h3 className="mt-3 font-sans text-lg font-black text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-white/70">{item.text}</p>
              </div>
              );
            })}
          </div>
        </section>

        <section className="pt-10">
          <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#00C37A]/50">09</p>
          <h2 className="font-sans text-2xl font-black leading-tight text-white sm:text-3xl">{c.faqTitle}</h2>
          <div className="mt-6 divide-y divide-white/[0.08] overflow-hidden rounded-lg border border-white/[0.08] bg-[#0C1A2E]">
            {c.faqs.map(([question, answer]) => (
              <details key={question} className="group p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-sans text-lg font-bold text-white">
                  <span>{question}</span>
                  <span className="text-[#00C37A] transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-4 text-sm leading-7 text-white/70">{answer}</p>
              </details>
            ))}
          </div>
        </section>
      </article>

      <JsonLd data={[articleSchema, createFAQSchema(c.faqs.map(([question, answer]) => ({ question, answer }))), createBreadcrumbSchema(breadcrumbs)]} />
    </main>
  );
}

// ─── About page ───────────────────────────────────────────────────────────────

function AboutPage({ locale, canonical, stats }: { locale: Locale; canonical: string; stats: Awaited<ReturnType<typeof getPublicBusinessStats>> }) {
  const c = aboutCopy[locale];
  const breadcrumbs = [
    { name: c.home, url: `${siteUrl}/${locale}` },
    { name: c.label, url: canonical }
  ];
  const principleIcons = [IconChartBar, IconShieldCheck, IconMessages, IconRefresh];
  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: c.title,
    description: c.metaDescription,
    inLanguage: locale,
    url: canonical,
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
      email: siteConfig.contactEmail,
      foundingLocation: { "@type": "Place", name: "Mallorca, España" }
    }
  };

  return (
    <main className="bg-[#07101F]">
      <section className="bg-[#0C1A2E] px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Breadcrumbs items={[{ label: c.home, href: `/${locale}` }, { label: c.label, href: canonical }]} />
          <div className="mt-8 max-w-3xl text-center sm:text-left">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-white">
              <IconUsers size={15} stroke={2} />
              {c.badge}
            </div>
            <h1 className="font-display text-balance text-3xl font-black leading-[1.03] text-white sm:text-5xl lg:text-6xl">{c.title}</h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/75">{c.intro}</p>
          </div>
        </div>
      </section>

      <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <section className="border-b border-white/[0.08] pb-10">
          <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#00C37A]/50">01</p>
          <h2 className="font-sans text-2xl font-black leading-tight text-white sm:text-3xl">{c.whyTitle}</h2>
          <p className="mt-5 text-base leading-8 text-white/70">{c.whyText}</p>
        </section>

        <section className="border-b border-white/[0.08] py-10">
          <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#00C37A]/50">02</p>
          <h2 className="font-sans text-2xl font-black leading-tight text-white sm:text-3xl">{c.teamTitle}</h2>
          <p className="mt-5 text-base leading-8 text-white/70">{c.teamText}</p>
        </section>

        <section className="border-b border-white/[0.08] py-10">
          <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#00C37A]/50">03</p>
          <h2 className="font-sans text-2xl font-black leading-tight text-white sm:text-3xl">{c.principlesTitle}</h2>
          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            {c.principles.map(([title, text], index) => {
              const Icon = principleIcons[index] ?? IconShieldCheck;
              return (
                <div key={title} className="rounded-lg border border-white/[0.10] border-t-2 border-t-[#00C37A]/50 bg-[#0C1A2E] p-5">
                  <Icon size={24} stroke={1.8} className="text-[#00C37A]" />
                  <h3 className="mt-3 font-sans text-lg font-bold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-7 text-white/70">{text}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="border-b border-white/[0.08] py-10">
          <p className="mb-6 text-[11px] font-black uppercase tracking-[0.18em] text-[#00C37A]/50">04</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { value: formatIntegerMetric(stats.publishedBusinesses, locale), label: c.published },
              { value: formatMillionMetric(stats.analyzedReviews, locale), label: c.reviews },
              { value: formatIntegerMetric(publicCategorySlugs.length, locale), label: c.categories }
            ].map((stat) => (
              <div key={stat.label} className="rounded-lg border border-[#00C37A]/60 bg-[linear-gradient(135deg,#07101F_0%,#0F2035_58%,#07101F_100%)] px-6 py-5 text-white">
                <div className="font-sans text-4xl font-black leading-none text-[#00C37A]">{stat.value}</div>
                <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white/75">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="pt-10">
          <div className="rounded-lg border border-white/[0.10] bg-[#0C1A2E] p-6 shadow-none">
            <IconMail size={28} stroke={1.8} className="text-[#00C37A]" />
            <h2 className="mt-3 font-sans text-2xl font-black leading-tight text-white">{c.contactTitle}</h2>
            <p className="mt-3 text-sm leading-7 text-white/70">{c.contactText}</p>
            <a href={`mailto:${c.contactCta}`} className="mt-4 inline-flex min-h-11 items-center justify-center rounded-sm bg-[#00C37A] px-5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#0A0A0A] hover:bg-white">
              {c.contactCta}
            </a>
            <div className="mt-4">
              <Link href={editorialPath(locale)} className="text-sm font-semibold text-[#00C37A]/80 hover:text-[#00C37A]">
                {c.editorialLinkText}
              </Link>
            </div>
          </div>
        </section>
      </article>

      <JsonLd data={[aboutSchema, createBreadcrumbSchema(breadcrumbs)]} />
    </main>
  );
}

// ─── Editorial policy page ────────────────────────────────────────────────────

function EditorialPage({ locale, canonical }: { locale: Locale; canonical: string }) {
  const c = editorialCopy[locale];
  const breadcrumbs = [
    { name: c.home, url: `${siteUrl}/${locale}` },
    { name: c.label, url: canonical }
  ];
  const editorialSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": canonical,
    name: c.title,
    description: c.metaDescription,
    inLanguage: locale,
    url: canonical,
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
      email: siteConfig.contactEmail
    }
  };

  return (
    <main className="bg-[#07101F]">
      <section className="bg-[#0C1A2E] px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Breadcrumbs items={[{ label: c.home, href: `/${locale}` }, { label: c.label, href: canonical }]} />
          <div className="mt-8 max-w-3xl text-center sm:text-left">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-white">
              <IconShieldCheck size={15} stroke={2} />
              {c.badge}
            </div>
            <h1 className="font-display text-balance text-3xl font-black leading-[1.03] text-white sm:text-5xl lg:text-6xl">{c.title}</h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/75">{c.intro}</p>
          </div>
        </div>
      </section>

      <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <section className="border-b border-white/[0.08] pb-10">
          <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#00C37A]/50">01</p>
          <h2 className="font-sans text-2xl font-black leading-tight text-white sm:text-3xl">{c.criteriaTitle}</h2>
          <div className="mt-6 grid gap-4">
            {c.criteria.map(([title, text]) => (
              <div key={title} className="rounded-lg border border-white/[0.10] border-t-2 border-t-[#00C37A]/50 bg-[#0C1A2E] p-5">
                <h3 className="font-sans text-lg font-bold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-white/70">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-b border-white/[0.08] py-10">
          <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#00C37A]/50">02</p>
          <h2 className="font-sans text-2xl font-black leading-tight text-white sm:text-3xl">{c.sourcesTitle}</h2>
          <p className="mt-5 text-base leading-8 text-white/70">{c.sourcesText}</p>
          <div className="mt-6 grid gap-4">
            {c.sources.map(([title, text]) => (
              <div key={title} className="flex gap-4 rounded-lg border border-white/[0.08] bg-[#0C1A2E] p-5">
                <IconChartBar size={22} stroke={1.8} className="mt-1 shrink-0 text-[#00C37A]" />
                <div>
                  <h3 className="font-sans text-lg font-bold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-7 text-white/70">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="border-b border-white/[0.08] py-10">
          <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#00C37A]/50">03</p>
          <h2 className="font-sans text-2xl font-black leading-tight text-white sm:text-3xl">{c.updateTitle}</h2>
          <p className="mt-5 text-base leading-8 text-white/70">{c.updateText}</p>
          <div className="mt-6 grid gap-4">
            {c.updates.map(([title, text]) => (
              <div key={title} className="flex gap-4 rounded-lg border border-white/[0.08] bg-[#0C1A2E] p-5">
                <IconRefresh size={22} stroke={1.8} className="mt-1 shrink-0 text-[#00C37A]" />
                <div>
                  <h3 className="font-sans text-lg font-bold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-7 text-white/70">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="border-b border-white/[0.08] py-10">
          <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#00C37A]/50">04</p>
          <h2 className="font-sans text-2xl font-black leading-tight text-white sm:text-3xl">{c.separationTitle}</h2>
          <p className="mt-5 text-base leading-8 text-white/70">{c.separationText}</p>
          <div className="mt-6 grid gap-4">
            {c.separations.map(([title, text]) => (
              <div key={title} className="flex gap-4 rounded-lg border border-white/[0.08] bg-[#0C1A2E] p-5">
                <IconX size={22} stroke={2} className="mt-1 shrink-0 text-[#00C37A]" />
                <div>
                  <h3 className="font-sans text-lg font-bold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-7 text-white/70">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="pt-10">
          <p className="mb-6 text-[11px] font-black uppercase tracking-[0.18em] text-[#00C37A]/50">05</p>
          <div className="rounded-lg border border-white/[0.10] bg-[#0C1A2E] p-6 shadow-none">
            <IconMail size={28} stroke={1.8} className="text-[#00C37A]" />
            <h2 className="mt-3 font-sans text-2xl font-black leading-tight text-white">{c.correctionsTitle}</h2>
            <p className="mt-3 text-sm leading-7 text-white/70">{c.correctionsText}</p>
            <a href={`mailto:${c.correctionsCta}`} className="mt-4 inline-flex min-h-11 items-center justify-center rounded-sm bg-[#00C37A] px-5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#0A0A0A] hover:bg-white">
              {c.correctionsCta}
            </a>
            <div className="mt-4">
              <Link href={aboutPath(locale)} className="text-sm font-semibold text-[#00C37A]/80 hover:text-[#00C37A]">
                {c.aboutLinkText}
              </Link>
            </div>
          </div>
        </section>
      </article>

      <JsonLd data={[editorialSchema, createBreadcrumbSchema(breadcrumbs)]} />
    </main>
  );
}
