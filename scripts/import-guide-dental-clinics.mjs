import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import {
  calculateAuthorityScore, createSocialProfiles,
  detectWebsiteType, inferLocationFromAddress,
} from "../src/lib/business-geo.ts";

function loadEnv() {
  if (!existsSync(".env.local")) return;
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const i = line.indexOf("="); if (i < 0) continue;
    const k = line.slice(0, i).trim(), v = line.slice(i + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[k]) process.env[k] = v;
  }
}
loadEnv();
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function toSlug(v) {
  return v.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}
async function getUniqueSlug(category, base, pid) {
  let c = base, n = 2;
  while (true) {
    const { data } = await sb.from("businesses").select("id,google_place_id").eq("category", category).eq("slug", c).maybeSingle();
    if (!data || data.google_place_id === pid) return c;
    c = `${base}-${n++}`;
  }
}
function reviewText(r) { return typeof r.text === "string" ? r.text : r.text?.text; }
function buildReviews(place) {
  return (place.reviews ?? []).map(r => ({
    authorName: r.authorAttribution?.displayName ?? null,
    authorUri: r.authorAttribution?.uri ?? null,
    rating: typeof r.rating === "number" ? r.rating : null,
    relativeTimeDescription: r.relativePublishTimeDescription ?? null,
    text: reviewText(r) ?? null,
    languageCode: typeof r.text === "object" ? r.text?.languageCode ?? null : null,
  })).filter(r => r.text);
}
async function fetchPlace(apiKey, pid) {
  const r = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(pid)}`, {
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "id,displayName,formattedAddress,location,googleMapsUri,websiteUri,nationalPhoneNumber,rating,userRatingCount,primaryType,types,photos.name,photos.authorAttributions,reviews.rating,reviews.text,reviews.relativePublishTimeDescription,reviews.authorAttribution",
    },
  });
  if (!r.ok) throw new Error(`Places API ${r.status}: ${await r.text()}`);
  return r.json();
}

// ── Import missing Odontofamilia ──────────────────────────────────────────
const ODO_PID = "ChIJV9IGy11JlhIRdT9diTL4r38";
const CAT = "healthcare";
let odoId = `google-${ODO_PID}`;

const { data: odoRow } = await sb.from("businesses").select("id").eq("google_place_id", ODO_PID).maybeSingle();
if (!odoRow) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) throw new Error("Missing GOOGLE_PLACES_API_KEY");
  const p = await fetchPlace(apiKey, ODO_PID);
  const name = p.displayName?.text ?? "Clínica Dental Odontofamilia";
  const address = p.formattedAddress ?? "";
  const website = p.websiteUri ?? null;
  const loc = inferLocationFromAddress(address);
  const wsType = detectWebsiteType(website);
  const photos = (p.photos ?? []).map(x => x.name).filter(Boolean);
  const reviews = buildReviews(p);
  const slug = await getUniqueSlug(CAT, toSlug(name), ODO_PID);
  const shortDesc = `Clínica dental en ${loc.municipality || loc.city || "Manacor"} con datos verificados de Google.`;
  const { error } = await sb.from("businesses").insert({
    id: odoId, slug, name, category: CAT,
    short_description: shortDesc, description: "",
    rating: p.rating ?? null, reviews_count: p.userRatingCount ?? null,
    website, phone: p.nationalPhoneNumber ?? null, address,
    latitude: p.location?.latitude ?? null, longitude: p.location?.longitude ?? null,
    google_maps_url: p.googleMapsUri ?? null,
    primary_type: p.primaryType ?? null, raw_google_place: p, tags: p.types ?? [],
    primary_photo_name: photos[0] ?? null, photo_names: photos.length ? photos : null,
    place_reviews: reviews, detail_enriched_at: new Date().toISOString(),
    area: loc.area, city: loc.city ?? null, municipality: loc.municipality ?? null, island: "Mallorca",
    website_type: wsType, social_profiles: createSocialProfiles(website, wsType),
    authority_score: calculateAuthorityScore({ rating: p.rating, reviews_count: p.userRatingCount, website, category: CAT }),
    image: "/images/placeholder.svg",
    gallery: [], opening_hours: null, faqs: [], best_for: [],
    seo: { title: `${name}: clínica dental en Mallorca | Mallorca Verified`, description: shortDesc },
    status: "published", source: "google_places",
    commercial_priority: "medium", client_potential: "medium",
    is_featured: false, is_claimed: false, instagram: null, price_level: null,
    updated_at: new Date().toISOString().slice(0, 10),
    imported_at: new Date().toISOString(), google_place_id: ODO_PID,
  });
  if (error) { console.error("Insert error:", error.message); process.exit(1); }
  console.log(`✓ Imported Odontofamilia: ${name} (★${p.rating}, ${p.userRatingCount} reviews, ${reviews.length} review texts)`);
} else {
  odoId = odoRow.id;
  console.log("Odontofamilia already in DB.");
}

const ID = {
  ced:       "google-ChIJAY1Cv_mSlxIRibPD0Uxvag8",
  nueva:     "google-ChIJ-wHXqK6TlxIRrXqngNZvFDM",
  ziving:    "google-ChIJXz3u0lqSlxIRyBRkaELsOJw",
  pronova:   "google-ChIJX483P_aSlxIRF4m4LK9oeec",
  planas:    "google-ChIJU9OQoTOTlxIRVcXy5NZEjNA",
  coped:     "google-ChIJCZGbwVOSlxIRhpYmouwnJFs",
  ferrer:    "google-ChIJhyI7UqmTlxIRdz6lgJ1oZJg",
  seadent:   "google-ChIJRYuX4FqSlxIRYN80Y297JDk",
  urgencias: "google-ChIJGUVq7auTlxIRuhYtVmPTrN8",
  centroUrg: "google-ChIJ02SxLKyTlxIRr0BSTuivsz8",
  doring:    "google-ChIJoxFhwYkslhIRzQArv-pfmnE",
  schmieder: "google-ChIJAbs57X1AlhIR8Q7Hkz61OX0",
  vogelsang: "google-ChIJ41YXBn2SlxIRNNKKLyEFYKU",
  schurian:  "google-ChIJbbP84rPFlxIRdN_GpVa_PGQ",
  dentalCentre:"google-ChIJqdmcVLmJlxIRSVO8r3QztEE",
  spPractice:"google-ChIJS2wnWLmJlxIRdSxcUVmIgjM",
  platon:    "google-ChIJAw2AAghJlhIREHqvsCUdn_A",
  odonto:    odoId,
};

const { data: existing } = await sb.from("guides").select("id").eq("slug", "dental-clinics-mallorca-2026").eq("locale", "en").maybeSingle();
if (existing) { console.log("Guide already exists, skipping."); process.exit(0); }

const guide = {
  id: crypto.randomUUID(),
  slug: "dental-clinics-mallorca-2026",
  locale: "en",
  title: "Dental Clinics in Mallorca: The Complete 2026 Guide",
  excerpt: "A practical guide to finding a dentist in Mallorca — English- and German-speaking clinics, emergency dental care, treatment costs versus the UK and Germany, and clinics by area.",
  intro: "Mallorca has a dense network of private dental clinics, heavily concentrated in **Palma** but spread across every major town and resort area, and many actively cater to the island's large international population and its visitors. For expats and tourists, the practical questions are usually about language, emergency access, insurance and cost rather than clinical detail, and this guide focuses on those. On price, one useful reference point: a single dental implant with crown in Spain typically falls in the region of €1,800–€3,000 according to 2026 European cost comparisons, which is generally below typical private UK (£2,000–£3,500) and German (€1,400–€3,500) ranges, though Mallorca is not one of Europe's ultra-low-cost dental-tourism destinations like Turkey or Hungary. This guide is informational only and does not offer medical or dental advice or rank any clinic as clinically superior; where clinics are highlighted, it is on the basis of verified public Google ratings, languages spoken, or a specific service, and this is stated.",
  sections: [
    {
      heading: "How dentistry works in Mallorca for foreigners",
      business_ids: [],
      body: "Dental care in Spain is overwhelmingly **private** — the public health system covers only very limited dental treatment (extractions and urgent problems for residents), so for check-ups, fillings, hygiene, implants and orthodontics, residents and visitors alike use private clinics and pay per treatment or through private dental insurance. For a tourist, this means a dentist visit is a straightforward private appointment, usually bookable within a day or two, and increasingly arranged by **WhatsApp**, which many clinics use for booking and follow-up.\n\nA first consultation typically involves an examination and often a digital X-ray or 3D scan, with a written quote for any treatment. Because clinics compete for international patients, many advertise the languages their dentists speak, whether they accept particular insurers, and their emergency availability. As a foreigner, the practical things to check before booking are the languages spoken, whether they take your insurance, emergency hours, and the cost of the first consultation — covered in the sections below.",
    },
    {
      heading: "English-speaking dental clinics",
      business_ids: [ID.ced, ID.nueva, ID.ziving, ID.dentalCentre, ID.spPractice, ID.schurian],
      body: "Many Mallorca clinics advertise English-speaking dentists, and several are effectively geared to international patients. In central **Palma**, **Clínica Dental CED Palma - Doctor Murad** (4.9 stars, ~1,170 reviews) and **Nueva Clínica Dental Palma** (4.9 stars, ~700 reviews) are among the highest-volume, best-rated general clinics with reviewers specifically noting English-speaking staff. **Ziving Tomas Sastre** on Passeig des Born (4.9 stars, ~1,600 reviews) is a large, long-established clinic in the centre. In the southwest, around **Santa Ponsa**, **Dental Centre Mallorca** (4.6 stars) and **Santa Ponsa Dental Practice** (4.5 stars) are British-run, family clinics where reviewers highlight clear English communication and honest advice.\n\nInland, **Clínica Dental Schurian** in **Inca** (4.9 stars, ~840 reviews) is repeatedly praised by English-speaking reviewers, several recommended by expats in the Alcúdia area. These ratings reflect public Google review scores and volume and languages mentioned by reviewers, not a clinical judgement — but for an English speaker wanting to be understood clearly, clinics that visibly serve international patients are a practical starting point.",
    },
    {
      heading: "German-speaking dental clinics (Deutscher Zahnarzt)",
      business_ids: [ID.doring, ID.schmieder, ID.vogelsang],
      body: "Mallorca's large German community and visitor numbers mean several clinics advertise German-speaking dentists, often described as **Deutscher Zahnarzt**. In the north, **Zahnarzt Dr. Dirk Döring (\"PuertoAlcúdiaDent\")** in **Port d'Alcúdia** (4.9 stars, ~280 reviews) is a German dentist with reviews in German and English praising clear explanation and WhatsApp booking. On the east coast, **SCHMIEDER Deutscher Zahnarzt** in **Cala Millor** (4.8 stars) is a German-run practice whose reviewers are largely German-speaking visitors, several treated on holiday.\n\nIn **Palma**, **Clínica Dental Vogelsang** (4.9 stars, ~205 reviews) is a German-named clinic where reviewers highlight aesthetic dentistry with Dr. Lara Mielke and a calm, multilingual team. As with the English-speaking clinics, these are grouped here on the basis of the languages the clinics advertise and that reviewers mention, and their public Google ratings — not any comparative clinical claim. German-speaking visitors in the north and east are relatively well served, with Palma offering the widest general choice.",
    },
    {
      heading: "Emergency and urgent dental care",
      business_ids: [ID.urgencias, ID.centroUrg, ID.seadent],
      body: "For urgent problems — a lost filling, a broken tooth, acute pain or a dental accident — Mallorca has clinics offering **urgencias** (emergency) dental care, several oriented to tourists. In **Palma**, **Urgencias Dentales Mallorca** (4.8 stars, ~630 reviews) and **Centro Urgencias Dentales** (5.0 stars, ~510 reviews) are dedicated urgent-care dental clinics whose reviewers frequently describe same-day treatment while on holiday, including for children. **SeaDent** on Avinguda Jaume III (4.9 stars, ~500 reviews) advertises extended and weekend hours, with reviewers describing emergency help outside normal times, sometimes coordinated by phone or WhatsApp.\n\nFor a walk-in tourist, the typical process is to phone or WhatsApp the clinic describing the problem, and be given a same-day or next-day slot; genuinely acute cases are often seen quickly. Keep any receipt and treatment note, as you may be able to claim on travel insurance afterwards (see below). Outside clinic hours, the public emergency number 112 handles medical emergencies, though routine dental pain is directed to private urgent clinics rather than hospitals.",
    },
    {
      heading: "Implants, Invisalign and cosmetic dentistry",
      business_ids: [ID.planas, ID.pronova, ID.coped],
      body: "Mallorca clinics widely offer **dental implants**, **orthodontics** including **Invisalign**, and **cosmetic/aesthetic dentistry**, and this is where the 'dental tourism' question comes up. For **implants**, **Clínica Dental Dr. Estanislao Planas** in Palma (4.9 stars) has reviewers travelling internationally for implant work, and **Clínica Pronova** (4.9 stars, ~1,000 reviews) is a large, modern Palma clinic. For **orthodontics and Invisalign**, **COped Ortodoncia** in central Palma stands out on public metrics with a 5.0-star rating from over 3,000 reviews — one of the highest review volumes of any clinic on the island — with reviewers specifically mentioning Invisalign. For **cosmetic/aesthetic** work, Ziving Tomas Sastre and Clínica Dental Vogelsang are among those whose reviewers mention veneers, bonding and smile aesthetics.\n\nOn cost: 2026 European comparisons put a single implant with crown in Spain around €1,800–€3,000, generally below typical private UK and German prices, so Mallorca can be more affordable than treatment at home for UK and German patients — with the practical advantage of EU-regulated care and, for residents, no need to travel. It is not, however, as cheap as dedicated dental-tourism hubs like Turkey or Hungary. Any figures here are indicative ranges from public sources; always get an itemised written quote from the clinic, and this guide does not advise for or against any treatment.",
    },
    {
      heading: "Insurance and paying",
      business_ids: [],
      body: "Most dental treatment in Mallorca is paid privately, either out of pocket or through **private dental insurance**. The main insurers operating in Spain — **Sanitas**, **Adeslas**, **DKV**, **Asisa** and **Mapfre** — offer dental plans, and many clinics list which insurers they work with; DKV in particular is widely recognised among the island's German community. If you hold Spanish private health or dental insurance, check which local clinics are in your insurer's network before booking, as coverage and co-payments vary by plan.\n\nAn important point for tourists: the **EHIC** or UK **GHIC** card does **not** generally cover private dental treatment — it covers state-provided medically necessary care, and Spanish public dental cover is very limited. In practice, a tourist needing a dentist will almost always pay privately. Travel insurance is the more relevant cover: many policies include emergency dental treatment for the relief of acute pain, so keep all receipts and treatment notes to claim afterwards. Check your specific policy's dental limit before relying on it, as cover is usually capped and limited to emergencies rather than routine or cosmetic work.",
    },
    {
      heading: "Dental clinics by area",
      business_ids: [ID.ferrer, ID.platon, ID.odonto],
      body: "Beyond Palma, most parts of the island have well-rated clinics. In **Palma** itself, the choice is widest — CED Palma, Nueva Clínica Dental, Pronova, Ziving Tomas Sastre, Dental Ferrer and COped (orthodontics) among the higher-rated. In the **southwest** (Calvià, Santa Ponsa, Paguera), Dental Centre Mallorca and Santa Ponsa Dental Practice are established British-run options, with Centre Mèdic Juaneda Santa Ponça for broader medical and dental needs.\n\nIn the **north**, Dr. Dirk Döring in Port d'Alcúdia serves the Alcúdia–Pollença area, and Clínica Dental Schurian in **Inca** covers the interior and is popular with northern expats. On the **east coast**, SCHMIEDER in Cala Millor serves the Cala Millor–Sa Coma area, and in **Manacor**, **Platón Dental** (5.0 stars, ~100 reviews) and **Clínica Dental Odontofamilia** (4.9 stars) are well-rated local clinics. Wherever you are staying, a well-reviewed clinic is usually within a short drive; these groupings are by public rating and location, not clinical comparison.",
    },
    {
      heading: "How to choose a dentist as a foreigner",
      business_ids: [],
      body: "A few practical checks help when choosing a clinic in Mallorca. First, **language**: if you want to be treated in English or German, confirm it when booking — many clinics advertise it, and reviews often mention it. Second, **insurance**: if you have Spanish private cover, check the clinic is in your insurer's network; if you're a tourist, assume you'll pay privately and check your travel-insurance dental limit. Third, **emergency availability**: if you're on holiday, note which nearby clinics offer urgencias and whether they take WhatsApp bookings.\n\nFinally, on cost and treatment: ask for the first-consultation fee upfront, and for any significant work (implants, orthodontics, cosmetic), request an itemised written quote and don't feel rushed into treatment. Public Google ratings and review counts are a reasonable starting filter for reliability and communication, which is how clinics are highlighted throughout this guide — but the right clinic depends on your specific needs, and this guide is informational and not a substitute for professional advice.",
    },
  ],
  faqs: [
    { question: "Are there English-speaking dentists in Mallorca?", answer: "Yes, many. In Palma, high-volume clinics like Clínica Dental CED Palma (Doctor Murad), Nueva Clínica Dental Palma and Ziving Tomas Sastre have reviewers noting English-speaking staff. In the southwest, Dental Centre Mallorca and Santa Ponsa Dental Practice are British-run, and inland, Clínica Dental Schurian in Inca is popular with English-speaking expats. Confirm the language when booking, as it's widely advertised. These are highlighted on public Google ratings and languages mentioned by reviewers, not a clinical judgement." },
    { question: "How do I find an emergency dentist in Mallorca?", answer: "Mallorca has dedicated urgent dental clinics, mainly in Palma — Urgencias Dentales Mallorca and Centro Urgencias Dentales are dedicated emergency dental practices, and SeaDent advertises extended and weekend hours. The usual process is to phone or WhatsApp the clinic describing the problem and get a same-day or next-day appointment; acute cases are often seen quickly. Keep receipts and treatment notes for a possible travel-insurance claim. For a general medical emergency, 112 is the public emergency number." },
    { question: "Is dental treatment cheaper in Mallorca than the UK or Germany?", answer: "Generally yes for UK and German patients, but it's not an ultra-cheap destination. 2026 European comparisons put a single implant with crown in Spain around €1,800–€3,000, typically below private UK (£2,000–£3,500) and German (€1,400–€3,500) ranges, with the advantage of EU-regulated care. However, Mallorca is more expensive than dedicated dental-tourism hubs like Turkey or Hungary. These are indicative ranges from public sources; always get an itemised written quote from the clinic." },
    { question: "Does EHIC or travel insurance cover a dentist in Mallorca?", answer: "The EHIC or UK GHIC card does not generally cover private dental treatment — it covers state-provided medically necessary care, and Spain's public dental cover is very limited, so tourists almost always pay privately. Travel insurance is more relevant: many policies cover emergency dental treatment for relief of acute pain, usually up to a capped limit and for emergencies rather than routine or cosmetic work. Keep all receipts and treatment notes, and check your policy's specific dental limit before relying on it." },
  ],
  seo: {
    title: "Dental Clinics in Mallorca: Complete 2026 Guide",
    description: "Finding a dentist in Mallorca: English- and German-speaking clinics, emergency dental care, implant and treatment costs vs the UK and Germany, and clinics by area.",
  },
  status: "published",
  source: "claude_browser",
  is_featured: false,
  hero_image_url: null,
  updated_at: new Date().toISOString().slice(0, 10),
  imported_at: new Date().toISOString(),
};

const { error } = await sb.from("guides").insert(guide);
if (error) { console.error("Error:", error); process.exit(1); }
console.log("✓ Published:", guide.slug, "(" + guide.locale + ")");
console.log("  Sections:", guide.sections.length, "| FAQs:", guide.faqs.length, "| business_ids:", guide.sections.flatMap(s => s.business_ids).length);
