import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";

function loadEnv() {
  if (!existsSync(".env.local")) return;
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const i = line.indexOf("="); if (i < 0) continue;
    const k = line.slice(0, i).trim(), v = line.slice(i + 1).trim();
    if (!process.env[k]) process.env[k] = v;
  }
}
loadEnv();
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const IDS = {
  hammam:   "google-ChIJMX-nYFOSlxIRMKRzTuMuW9w",
  anaya:    "google-ChIJZ83K5DCTlxIRwWXCwdOvsyE",
  phothong: "google-ChIJlc868vmTlxIRlceW_V-sx8E",
  jasmine:  "google-ChIJf9h9LHCSlxIRnrk_SA92mgw",
  kotcha:   "google-ChIJLXMdlYmTlxIR0hXQUpQcBwQ",
  japhead:  "google-ChIJb2tff3KTlxIRWFmGBFzqfBY",
  nura:     "google-ChIJ9fY7O1qJlxIRHAC4g57xr_Y",
  mentnat:  "google-ChIJzxIXZMfFlxIRbB5GHogPqcU",
  wsPalma:  "google-ChIJ2YzBUJaXlxIR793Lx5lB9Zg",
  wsPins:   "google-ChIJ-ZP4lAM_lhIR8S_NijfXW2c",
  wsComa:   "google-ChIJZQ7_mv9BlhIRVLXJeiTfg0Y",
};

const { data: existing } = await sb.from("guides").select("id").eq("slug", "best-spa-days-outside-hotels-mallorca-2026").eq("locale", "en").maybeSingle();
if (existing) { console.log("Already exists, skipping."); process.exit(0); }

const guide = {
  id: crypto.randomUUID(),
  slug: "best-spa-days-outside-hotels-mallorca-2026",
  locale: "en",
  title: "Best Spa Days in Mallorca Outside Hotel Spas 2026",
  excerpt: "You don't need to be a five-star hotel guest for a proper spa day in Mallorca. The best independent spas, hammams and massage centres — with honest prices.",
  intro: "A spa day in Mallorca doesn't have to mean paying five-star hotel prices or being a hotel guest. The island has a strong set of independent spas, hammams and massage centres — most concentrated in Palma, with good options in the southwest, interior and east — where a 60-minute massage typically runs somewhere around €50–70, well below what a hotel day-spa package usually costs. This guide covers the best options open to everyone (not just hotel guests) by area, from a Moorish-style hammam to Thai massage studios where the therapists trained in Thailand, and is honest about which are fully independent and which are open-to-all spa centres that happen to sit inside a hotel.",
  sections: [
    {
      heading: "Palma: the hammam and the standout massage studios",
      business_ids: [IDS.hammam, IDS.anaya],
      body: "Palma has the densest and best choice of independent spas. For a full spa circuit rather than just a massage, **Hammam Al Ándalus** on Carrer de Costa i Llobera (4.5 stars, ~1,300 reviews) is the standout — a Moorish-style bathhouse with warm thermal pools, a steam room and beautiful architecture, where you book a bathing circuit with an optional scrub and massage added. Reviewers consistently rate it excellent value and a genuine relaxation experience, and it's the pick for couples wanting a shared bathing ritual rather than a clinical massage.\n\nFor massage specifically, **Anaya Massage & Spa** near the centre (4.9 stars) is a premium independent spa praised for skilled deep-tissue and relaxation treatments in lovely, calm premises, with easy WhatsApp booking. These two anchor Palma's independent scene — Hammam Al Ándalus for the thermal-circuit experience, Anaya for a serious, results-focused massage.",
    },
    {
      heading: "Palma: authentic Thai massage",
      business_ids: [IDS.phothong, IDS.jasmine, IDS.kotcha],
      body: "Palma has several genuine Thai massage studios where, as reviewers repeatedly confirm, the therapists trained in Thailand — a different, firmer experience from a spa relaxation massage. **Pho Thong Thai Spa** in Santa Catalina (4.8 stars, ~200 reviews) is widely rated among the best, with reviewers who've had massages in Thailand itself calling it the real deal for strong pressure and technique. **Jasmine Thai Massage** near the port on Avinguda de Joan Miró (4.8 stars) is another highly rated option, praised for skilled therapists who target the right muscles, finishing with tea and Thai sweets.\n\nFor a smaller, more intimate Thai studio, **Kotchakorn Thai Massage** (5.0 stars) offers a slightly gentler style that reviewers appreciate, and works well for couples booking side-by-side sessions. All are walk-in friendly but busy, so booking ahead is wise, especially in summer.",
    },
    {
      heading: "Palma: something different — Japanese head spa",
      business_ids: [IDS.japhead],
      body: "For a treatment beyond the standard massage, the **Japanese Head Spa Mallorca** near the centre (4.5 stars, ~145 reviews) specialises in the Japanese head-spa ritual — a scalp and hair treatment combined with a relaxing head and neck massage. Reviewers highlight the skilled therapists and the deeply relaxing scalp work, though a couple note the treatments can feel short for the price, so check exactly what your package includes when booking.\n\nIt's a niche but genuinely different spa experience, good if you've done the usual body massages and want something new, or if scalp tension and stress-relief are your priority. As with the Thai studios, book ahead, and confirm the treatment length and what's included so expectations match.",
    },
    {
      heading: "Southwest and interior: Santa Ponsa and Inca",
      business_ids: [IDS.nura, IDS.mentnat],
      body: "If you're staying in the busy southwest resorts and don't want to drive into Palma, **Spa Nura** in Santa Ponsa (4.7 stars, ~120 reviews) is a well-run independent day spa. Reviewers describe a small but comfortable space with a jacuzzi, cold plunge pool and two saunas, plus good massages, sometimes finished with a glass of cava — a proper little spa circuit rather than just a treatment room. Because it's compact, booking a quieter slot helps, and it's a convenient independent option for anyone around Santa Ponsa, Palmanova or Magaluf.\n\nInland in Inca, **Mentnature** (also listed as Masaje Mallorca / Terapias Naturales, 4.8 stars, ~240 reviews) is a well-regarded therapy centre focused on massage rather than a full wet-spa circuit, praised for tailored deep-tissue and sports massage and foot reflexology. It suits anyone based inland or in the north who wants a genuinely good treatment for muscle tension or recovery rather than pools and saunas — note it's weekday-focused and closes at weekends.",
    },
    {
      heading: "Open to all: the Mallorca Wellness Spa centres",
      business_ids: [IDS.wsPalma, IDS.wsPins, IDS.wsComa],
      body: "Worth knowing separately are the **Mallorca Wellness Spa** centres — a spa chain whose branches sit inside hotels but operate as their own spas and are open to non-guests, so you can book a day spa or treatment without staying there. They're a useful option for areas where independent spas are thinner on the ground. The **Playa de Palma** branch (4.7 stars, ~530 reviews) is the highest-volume, with a pool, steam room, sauna, ice bath and full-day access add-ons. On the east coast, the **Costa dels Pins** branch at Eurotel Punta Rotja (4.8 stars, ~330 reviews) and the **Sa Coma** branch (4.9 stars, ~250 reviews) cover the Cala Millor and Levante resort areas well, both strongly rated for their massages and couples' treatments.\n\nThese are the pick if you're based in the east or on Playa de Palma and want a proper wet-spa circuit (pool, sauna, steam) plus a massage in one place, rather than a standalone treatment room. Being spa-focused and open to all, they give you the hotel-spa facilities without needing to be a guest — just confirm day-access and treatment prices directly, as packages vary by branch.",
    },
    {
      heading: "Prices, booking and what to know",
      business_ids: [],
      body: "As a rough guide, a 60-minute massage at an independent spa in Mallorca commonly falls around €50–70, typically less than the equivalent at a five-star hotel spa, and hammam or thermal-circuit sessions are often surprisingly good value for the experience. Day packages combining a bathing circuit with a scrub and massage cost more but still usually undercut hotel day-spa rates. Prices vary by treatment and length, so confirm directly when booking.\n\nA few practical notes. Book ahead in summer, as the best spas and Thai studios fill quickly, especially for couples' slots and weekend times. Many independent places take bookings easily over WhatsApp. Confirm exactly what a package includes — length, whether pool and sauna access is included, and any add-ons — as reviewers' main complaint across spas is treatments feeling shorter than expected. The fully independent options are concentrated in Palma, while the open-to-all Mallorca Wellness Spa centres extend good coverage to Playa de Palma and the east coast.",
    },
  ],
  faqs: [
    { question: "Where can I get a spa day in Mallorca without staying at a hotel?", answer: "Palma has the best independent, non-hotel options: Hammam Al Ándalus for a Moorish-style thermal bathing circuit, Anaya Massage & Spa for premium massage, and several authentic Thai studios like Pho Thong Thai and Jasmine Thai. Outside Palma, Spa Nura in Santa Ponsa and Mentnature in Inca are strong independents, and the Mallorca Wellness Spa centres (open to non-guests) cover Playa de Palma and the east coast. Most take walk-ins but booking ahead is wise." },
    { question: "How much does a massage cost in Mallorca outside a hotel?", answer: "A 60-minute massage at an independent spa in Mallorca commonly costs around €50–70, usually less than the equivalent treatment at a five-star hotel spa. Hammam bathing circuits and day packages combining a scrub and massage cost more but are often good value for the experience. Prices vary by treatment and length, so confirm directly, and check whether pool and sauna access is included in the price." },
    { question: "What is the best couples spa in Mallorca outside hotels?", answer: "Hammam Al Ándalus in Palma is ideal for couples wanting a shared experience, with a thermal bathing circuit you enjoy together plus optional side-by-side massages. The Thai studios like Kotchakorn and Jasmine also offer couples' massages in the same room, Spa Nura in Santa Ponsa suits couples in the southwest, and the Mallorca Wellness Spa centres are well rated for couples' treatments on the east coast and Playa de Palma. Book couples' slots ahead, as they go quickly in summer." },
    { question: "Do you need to book a spa in Mallorca in advance?", answer: "In summer, yes — the best independent spas and Thai massage studios fill up fast, particularly for couples' slots and weekend times, so booking ahead is strongly recommended. Many places, including Anaya and the Thai studios, take bookings easily over WhatsApp. Out of season you can often walk in, but it's still worth calling ahead to confirm availability and exactly what your chosen treatment includes." },
  ],
  seo: {
    title: "Best Spa Days in Mallorca Outside Hotel Spas 2026",
    description: "The best independent, non-hotel spas in Mallorca: Hammam Al Ándalus, authentic Thai massage in Palma, plus Santa Ponsa, Inca and open-to-all spa centres. Honest prices.",
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
