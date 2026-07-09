# Guide Prompt — Dental Clinics in Mallorca (comprehensive)

Prompt para Claude browser (claude.ai con web search). Guía general completa.
Proceso: copias → generas JSON → me lo traes → importo (EN, luego DE).

Nota: tenemos 178 clínicas dentales publicadas y enriquecidas en la DB, así que
casi todos los place_ids que devuelva ya estarán dentro y no gastaré API al importar.

Categoría healthcare = sensible: el prompt exige tono neutral, ratings verificados
de Google y cero consejo médico.

---

```
Never invent. Only write what you can verify from web search.
No marketing language: "best-in-class", "world-class", "painless", "perfect smile", "gem" → banned.
This is a healthcare topic: stay neutral and informative. Do NOT give medical or dental advice, do NOT diagnose, and do NOT claim any clinic is medically superior. Frame everything around verified public Google ratings, languages spoken, services offered and practical logistics — not clinical quality claims.
Bold every clinic name, town, insurer and service name in body text.
Intro = one specific verifiable fact (e.g. how many dental clinics Mallorca has, or that Palma concentrates most of them, or a concrete price-comparison fact for implants vs the UK/Germany).
FAQs = questions people actually type into ChatGPT about this topic.

Write a complete editorial guide in English.

TITLE: Dental Clinics in Mallorca: The Complete 2026 Guide
TARGET QUERIES: dentist mallorca, english speaking dentist mallorca, zahnarzt mallorca, emergency dentist mallorca, dental implants mallorca, best dental clinic palma, dentist palma mallorca
AUDIENCE: Expats and residents choosing a regular dentist, tourists needing emergency dental care, and people considering treatment (implants, Invisalign, cosmetic) in Mallorca. Mix of English and German speakers.

STEP 1 — Research and verify:
- How many dental clinics are on the island / concentrated in Palma (approximate, verifiable)
- Which clinics explicitly advertise English-speaking dentists, and which advertise German-speaking (Zahnarzt / "Deutscher Zahnarzt") — this is a key need for expats and tourists
- Emergency / urgent dental care: which clinics offer urgencias / 24h / 365-day emergency service and how it typically works for a walk-in tourist
- Insurance: which big insurers operate in Mallorca (Sanitas, Adeslas, DKV, Asisa, Mapfre) and how private vs insured dental works; whether tourists with EHIC/GHIC or travel insurance can use it for dental (verify honestly — dental is usually NOT covered by EHIC)
- Cost reality: is Mallorca meaningfully cheaper than the UK or Germany for implants/cosmetic work (the "dental tourism" angle), with any concrete price ranges you can verify
- Services: which clinics are known for implants, Invisalign/orthodontics, cosmetic/aesthetic dentistry, paediatric (children's) dentistry
- Geographic spread: clinics in Palma, the southwest (Calvià, Santa Ponsa, Magaluf, Paguera), the north (Alcúdia, Pollença), the interior (Inca), and the east (Manacor) — so a visitor anywhere can find one
- How to choose a dentist as a foreigner: what to check (language, insurance accepted, emergency availability, first-consultation cost)

STEP 2 — Write in this exact JSON format:
{"title":"...","excerpt":"...","intro":"...","sections":[{"heading":"...","body":"...","business_ids":[]}],"faqs":[{"question":"...","answer":"..."}],"seo":{"title":"...","description":"..."},"mentioned_businesses":[{"name":"...","place_id_url":"...","category":"healthcare"}]}

CRITICAL:
- Return ONLY valid JSON. No markdown, no text outside the JSON.
- business_ids: always empty [].
- 6–8 sections. Suggested structure: (1) how dentistry works in Mallorca for foreigners, (2) English-speaking clinics, (3) German-speaking clinics, (4) emergency / urgent dental care, (5) implants, Invisalign & cosmetic (the treatment/dental-tourism angle), (6) insurance & paying, (7) clinics by area, (8) how to choose.
- Every clinic named must be a real, verifiable clinic with a Google Maps place_id URL in mentioned_businesses.
- Never rank clinics as medically "the best" — where you highlight one, base it on verified Google rating + review count, languages spoken or a specific service, and say so.
- Every FAQ answer self-contained with specific, verifiable details.
- FAQs must include: are there English-speaking dentists in Mallorca, how do I find an emergency dentist in Mallorca, is dental treatment cheaper in Mallorca than the UK/Germany, does EHIC/travel insurance cover a dentist in Mallorca.
- mentioned_businesses: min 12 real clinics with Google Maps place_id URLs, spread across languages, services and areas.
- SEO title under 60 chars, description under 155 chars.
```
