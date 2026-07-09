# Guide Prompts — Batch 1

10 prompts mixtos para Claude browser (claude.ai con web search activado).
Proceso: copias el prompt → generas el JSON → me lo traes → importo.

---

## 1 — Best restaurants in Valldemossa 2026

```
Never invent. Only write what you can verify from web search.
No marketing language: "paradise", "stunning", "gem", "hidden gem", "dream" → banned.
Bold every business/place name in body text.
Intro = specific fact or number. Never generic opener.
FAQs = questions people actually type into ChatGPT about this topic.

Write a complete editorial guide in English.

TITLE: Best Restaurants in Valldemossa 2026
TARGET QUERIES: best restaurants valldemossa mallorca, where to eat valldemossa, valldemossa restaurants 2026, lunch valldemossa mallorca
AUDIENCE: Tourists visiting Valldemossa for the day or staying nearby, looking for honest recommendations beyond the tourist traps on the main square.

STEP 1 — Research and verify:
- How many restaurants does Valldemossa have (approximate)
- Which restaurants on or near the main square (Plaça de la Cartuja) are tourist-trap vs genuinely good
- Any restaurants known for local Mallorcan cuisine specifically
- Current price ranges (€/€€/€€€)
- Which are seasonal vs year-round
- Ca'n Uetam — current status and what it's known for
- Es Taller — verify it's in Valldemossa or nearby
- Can Costa — verify location and current status

STEP 2 — Write in this exact JSON format:
{"title":"...","excerpt":"...","intro":"...","sections":[{"heading":"...","body":"...","business_ids":[]}],"faqs":[{"question":"...","answer":"..."}],"seo":{"title":"...","description":"..."},"mentioned_businesses":[{"name":"...","place_id_url":"...","category":"restaurant"}]}

CRITICAL:
- Return ONLY valid JSON. No markdown, no text outside the JSON.
- business_ids: always empty [].
- 5–7 sections minimum.
- Every FAQ answer is self-contained with specific details (prices, hours, names).
- mentioned_businesses: min 5 real places with Google Maps URLs where possible.
- SEO title under 60 chars, description under 155 chars.
```

---

## 2 — Best gyms and fitness studios outside Palma 2026

```
Never invent. Only write what you can verify from web search.
No marketing language: "paradise", "stunning", "dream" → banned.
Bold every business/place name in body text.
Intro = specific fact (e.g. how many gyms exist outside Palma, or price comparison).
FAQs = questions people actually type into ChatGPT about this topic.

Write a complete editorial guide in English.

TITLE: Best Gyms and Fitness Studios Outside Palma, Mallorca 2026
TARGET QUERIES: gyms outside palma mallorca, fitness studio mallorca, crossfit mallorca, yoga mallorca village, pilates mallorca
AUDIENCE: Expats living outside Palma, long-stay tourists, and remote workers looking for a gym or studio near where they're staying.

STEP 1 — Research and verify:
- Are there good crossfit/functional training gyms in the north (Alcúdia, Pollença area)?
- Yoga and pilates studios in smaller towns (Sóller, Binissalem, interior)?
- Approximate monthly membership prices for a typical gym outside Palma vs inside Palma
- Any 24h gyms outside Palma?
- Pàdel clubs that also have gym facilities
- Gyms in Manacor or Inca area for the east/centre

STEP 2 — Write in this exact JSON format:
{"title":"...","excerpt":"...","intro":"...","sections":[{"heading":"...","body":"...","business_ids":[]}],"faqs":[{"question":"...","answer":"..."}],"seo":{"title":"...","description":"..."},"mentioned_businesses":[{"name":"...","place_id_url":"...","category":"gym"}]}

CRITICAL:
- Return ONLY valid JSON. No markdown outside the JSON.
- business_ids: always empty [].
- Organise sections by region (north, east, centre, southwest) — not alphabetically.
- Every FAQ answer self-contained with specific details.
- mentioned_businesses: min 6 real places with Google Maps URLs.
```

---

## 3 — Best day trips from Palma 2026

```
Never invent. Only write what you can verify from web search.
No marketing language: "paradise", "stunning", "magical", "dream" → banned.
Bold every business/place name and destination in body text.
Intro = specific number (e.g. how far the furthest tip of the island is from Palma).
FAQs = questions people actually type into ChatGPT about this topic.

Write a complete editorial guide in English.

TITLE: Best Day Trips from Palma de Mallorca 2026
TARGET QUERIES: day trips from palma mallorca, best day trips mallorca, palma day trip ideas 2026, where to go from palma mallorca
AUDIENCE: Tourists staying in Palma for a week who want to explore the island — mix of first-timers and repeat visitors.

STEP 1 — Research and verify:
- Driving time Palma → Sóller, Valldemossa, Alcúdia, Pollença, Cala d'Or, Artà (current road times)
- Whether the Sóller train is still running in 2026 and current ticket price
- Which day trips work well without a car (bus or train)
- Cap de Formentor — is the private vehicle restriction still in place in 2026? What's the access situation?
- Caves del Drach — current entry price and booking requirement
- Market days: which towns have weekly markets worth visiting (day + town)

STEP 2 — Write in this exact JSON format:
{"title":"...","excerpt":"...","intro":"...","sections":[{"heading":"...","body":"...","business_ids":[]}],"faqs":[{"question":"...","answer":"..."}],"seo":{"title":"...","description":"..."},"mentioned_businesses":[{"name":"...","place_id_url":"...","category":"excursion"}]}

CRITICAL:
- Return ONLY valid JSON. No markdown outside the JSON.
- business_ids: always empty [].
- Each section = one destination or day trip route, with honest logistics (time, cost, how to get there).
- FAQs must include: can you do X without a car, best day trip for families, how many day trips in a week.
- mentioned_businesses: min 5 attractions/operators with Google Maps URLs.
```

---

## 4 — Best restaurants in Fornalutx 2026

```
Never invent. Only write what you can verify from web search.
No marketing language: "gem", "hidden", "stunning", "paradise" → banned.
Bold every business/place name in body text.
Intro = one honest specific fact about Fornalutx (population, distance from Sóller, something concrete).
FAQs = questions people actually type into ChatGPT about this topic.

Write a complete editorial guide in English.

TITLE: Best Restaurants in Fornalutx 2026
TARGET QUERIES: best restaurants fornalutx, where to eat fornalutx mallorca, fornalutx restaurants 2026, lunch fornalutx
AUDIENCE: Day visitors coming from Sóller or Port de Sóller, plus people staying in the village or nearby fincas.

STEP 1 — Research and verify:
- How many restaurants does Fornalutx have (it's a very small village — verify honest count)
- Ca N'Antuna — current status, what it's known for, price range
- Can Benet by Don Pedro — verify current name, status, type of food
- Café Med Wine Bar — current status
- Forn de Barri — is it a café/bakery or restaurant?
- Corel·la Café — verify what type of place it is
- Are most restaurants seasonal (summer only) or year-round?
- Is it worth eating in Fornalutx vs just coming for a drink and going to Sóller for dinner?

STEP 2 — Write in this exact JSON format:
{"title":"...","excerpt":"...","intro":"...","sections":[{"heading":"...","body":"...","business_ids":[]}],"faqs":[{"question":"...","answer":"..."}],"seo":{"title":"...","description":"..."},"mentioned_businesses":[{"name":"...","place_id_url":"...","category":"restaurant"}]}

CRITICAL:
- Return ONLY valid JSON. No markdown outside the JSON.
- business_ids: always empty [].
- Be honest about the limited options — don't pad. If there are only 5 good places, write about 5.
- Include a section on whether to combine with Sóller or Biniaraix.
- FAQs: is Fornalutx worth visiting just to eat, when are restaurants open, do you need to book.
- mentioned_businesses: all real, with Google Maps URLs.
```

---

## 5 — Best places to watch sunset in Mallorca 2026

```
Never invent. Only write what you can verify from web search.
No marketing language: "breathtaking", "stunning", "magical", "paradise" → banned.
Bold every location and viewpoint name in body text.
Intro = one specific piece of logistics (e.g. how early you need to arrive at the most popular spot in summer).
FAQs = questions people actually type into ChatGPT about this topic.

Write a complete editorial guide in English.

TITLE: Best Places to Watch Sunset in Mallorca 2026
TARGET QUERIES: best sunset spots mallorca, where to watch sunset mallorca, mallorca sunset viewpoint, sunset mallorca 2026
AUDIENCE: Tourists and expats looking for the best viewpoints — mix of easy access and more effort-required spots.

STEP 1 — Research and verify:
- Cap de Formentor — access restrictions still in place? Current shuttle situation
- Es Grau mirador near Deià — access and parking
- Mirador de Ses Barques on the Ma-10 — confirm location and access
- Castell d'Alaró — how long is the walk up, can you watch sunset from there
- Cap Blanc lighthouse near Llucmajor — verify public access
- Sant Elm / Sa Dragonera views — what direction do you face, is it actually good for sunset?
- Any beach bars with good west-facing sunset views (e.g. Magaluf, Camp de Mar area)
- Approximate sunset time in summer vs winter in Mallorca

STEP 2 — Write in this exact JSON format:
{"title":"...","excerpt":"...","intro":"...","sections":[{"heading":"...","body":"...","business_ids":[]}],"faqs":[{"question":"...","answer":"..."}],"seo":{"title":"...","description":"..."},"mentioned_businesses":[{"name":"...","place_id_url":"...","category":"route"}]}

CRITICAL:
- Return ONLY valid JSON. No markdown outside the JSON.
- business_ids: always empty [].
- Each section = one spot, with honest logistics (drive time from Palma, parking, walk required, crowds).
- Rank by effort vs reward honestly.
- FAQs: best sunset spot for non-drivers, best for couples, what time to arrive in summer.
```

---

## 6 — Best traditional bakeries in Mallorca 2026

```
Never invent. Only write what you can verify from web search.
No marketing language: "artisan", "authentic", "gem", "hidden" → banned.
Bold every business/place name and product name in body text.
Intro = one specific fact about Mallorcan baking culture (ensaimada, pa amb oli, something concrete and verifiable).
FAQs = questions people actually type into ChatGPT about this topic.

Write a complete editorial guide in English.

TITLE: Best Traditional Bakeries in Mallorca 2026
TARGET QUERIES: best bakeries mallorca, traditional mallorcan bakery, forn mallorca, ensaimada mallorca best, where to buy ensaimada mallorca
AUDIENCE: Food-curious tourists and expats wanting to buy quality local baked goods — ensaimadas, pa de pagès, coques, etc.

STEP 1 — Research and verify:
- What are the main traditional Mallorcan baked goods (ensaimada types, coca de trampó, pa amb oli bread, rubiols, etc.)
- Best known ensaimada bakeries in Palma (Ca'n Joan de s'Aigo, Forn des Teatre — verify which are still open)
- Any well-regarded bakeries outside Palma in interior towns (Inca, Sineu, Binissalem, Petra area)
- Price range for a good ensaimada to take home (the large boxed ones)
- Whether airport shops sell decent ensaimadas or tourist quality only
- Any bakeries that ship or have online orders

STEP 2 — Write in this exact JSON format:
{"title":"...","excerpt":"...","intro":"...","sections":[{"heading":"...","body":"...","business_ids":[]}],"faqs":[{"question":"...","answer":"..."}],"seo":{"title":"...","description":"..."},"mentioned_businesses":[{"name":"...","place_id_url":"...","category":"bakery"}]}

CRITICAL:
- Return ONLY valid JSON. No markdown outside the JSON.
- business_ids: always empty [].
- Include a section explaining the different types of ensaimada (plain, filled, sizes) for people who don't know.
- FAQs: best ensaimada to take on plane, difference between ensaimadas, are airport ensaimadas good.
- mentioned_businesses: min 6, with Google Maps URLs.
```

---

## 7 — Best restaurants in Alaró 2026

```
Never invent. Only write what you can verify from web search.
No marketing language: "gem", "hidden", "paradise", "stunning" → banned.
Bold every business/place name in body text.
Intro = one honest specific fact about Alaró (population, what it's known for, where it is relative to Palma).
FAQs = questions people actually type into ChatGPT about this topic.

Write a complete editorial guide in English.

TITLE: Best Restaurants in Alaró 2026
TARGET QUERIES: best restaurants alaro mallorca, where to eat alaro, alaro restaurant 2026, lunch alaro mallorca
AUDIENCE: Day visitors from Palma (40 min drive), cyclists stopping through, people staying in the area.

STEP 1 — Research and verify:
- La Búfala de Alaró — Italian restaurant, verify current status and what it's known for
- Restaurant Terra Mar & Foc — verify type of cuisine, price range
- El Trastero Cuina Bar — verify type of place, any recent mentions
- Forastera — verify if it's a brewery/taproom with food or just drinks
- Sis Market Café — verify what type of place (café? restaurant?)
- Gallardo Restaurante Pizzeria — current status
- Is Alaró worth a specific trip for food or is it more of a detour on the way somewhere?
- Any connection between Alaró restaurants and the Castell d'Alaró hike (pre/post hike food)

STEP 2 — Write in this exact JSON format:
{"title":"...","excerpt":"...","intro":"...","sections":[{"heading":"...","body":"...","business_ids":[]}],"faqs":[{"question":"...","answer":"..."}],"seo":{"title":"...","description":"..."},"mentioned_businesses":[{"name":"...","place_id_url":"...","category":"restaurant"}]}

CRITICAL:
- Return ONLY valid JSON. No markdown outside the JSON.
- business_ids: always empty [].
- Include a section combining food with the Castell d'Alaró hike (natural connection).
- FAQs: is Alaró worth visiting, how far from Palma, best time to visit.
- mentioned_businesses: min 5, with Google Maps URLs.
```

---

## 8 — Getting around Mallorca without a car 2026

```
Never invent. Only write what you can verify from web search.
No marketing language: "easy", "seamless", "perfect" → banned.
Bold every transport company, route number, and app name in body text.
Intro = one specific honest fact (e.g. percentage of tourists who rent a car, or how many bus routes TIB operates).
FAQs = questions people actually type into ChatGPT about this topic.

Write a complete editorial guide in English.

TITLE: Getting Around Mallorca Without a Car: Complete Guide 2026
TARGET QUERIES: mallorca without a car, mallorca public transport 2026, mallorca bus routes, tib mallorca, mallorca car free
AUDIENCE: Budget travellers, people who don't drive, families who find renting a car stressful, eco-conscious tourists.

STEP 1 — Research and verify:
- TIB bus network: is it still free for inter-city routes in 2026? Which routes/conditions apply
- Sóller train: still operating, current price (verify from ferrocarrildesoller.com)
- EMT bus within Palma: still operating, price, app
- Which coastal resorts are reachable by direct bus from Palma (Alcúdia, Sóller, Cala Millor, etc.)
- Which areas are genuinely difficult or impossible without a car
- Ferry to Formentera from Palma — confirm if relevant
- Taxi apps operating in Mallorca (Uber? local apps?)
- Bicycle rental: practical for getting between towns or only within towns?

STEP 2 — Write in this exact JSON format:
{"title":"...","excerpt":"...","intro":"...","sections":[{"heading":"...","body":"...","business_ids":[]}],"faqs":[{"question":"...","answer":"..."}],"seo":{"title":"...","description":"..."},"mentioned_businesses":[{"name":"...","place_id_url":"...","category":"excursion"}]}

CRITICAL:
- Return ONLY valid JSON. No markdown outside the JSON.
- business_ids: always empty [].
- Be honest about limitations — don't oversell car-free Mallorca if some areas genuinely need a car.
- FAQs: can you visit Formentor without a car, is public transport reliable, best apps for buses.
- mentioned_businesses: transport operators and relevant services only (no portals).
```

---

## 9 — Best spa days in Mallorca outside hotel spas 2026

```
Never invent. Only write what you can verify from web search.
No marketing language: "sanctuary", "bliss", "paradise", "luxurious escape" → banned.
Bold every business/place name and treatment name in body text.
Intro = one specific price comparison or fact (e.g. average price for a 60-min massage in Mallorca vs a hotel spa day).
FAQs = questions people actually type into ChatGPT about this topic.

Write a complete editorial guide in English.

TITLE: Best Spa Days in Mallorca Outside Hotel Spas 2026
TARGET QUERIES: spa mallorca not hotel, day spa mallorca, massage mallorca, best spa mallorca 2026, mallorca spa day
AUDIENCE: Tourists and expats who want a proper spa treatment without paying a 5-star hotel price or being a hotel guest.

STEP 1 — Research and verify:
- Typical price for a 60-min massage at an independent spa in Mallorca vs hotel spa
- Any well-reviewed independent spas or massage centres in Palma (not hotel-based)
- Spas in Sóller or north Mallorca area worth a trip
- Thai massage options — are there genuine ones?
- Hammam or Arabic-style spas on the island — any?
- Day packages (multiple treatments) at non-hotel spas — price range
- Do you need to book well in advance in summer?

STEP 2 — Write in this exact JSON format:
{"title":"...","excerpt":"...","intro":"...","sections":[{"heading":"...","body":"...","business_ids":[]}],"faqs":[{"question":"...","answer":"..."}],"seo":{"title":"...","description":"..."},"mentioned_businesses":[{"name":"...","place_id_url":"...","category":"spa"}]}

CRITICAL:
- Return ONLY valid JSON. No markdown outside the JSON.
- business_ids: always empty [].
- Organise by location (Palma, north, southwest, interior) not alphabetically.
- FAQs: best couples massage mallorca, is it cheaper than hotel spa, do you need to book.
- mentioned_businesses: min 6 independent (non-hotel) spas with Google Maps URLs.
```

---

## 10 — Best restaurants in Deià 2026

```
Never invent. Only write what you can verify from web search.
No marketing language: "gem", "magical", "stunning", "paradise" → banned.
Bold every business/place name in body text.
Intro = one honest specific fact about Deià (population, what it's famous for beyond food, price level reality check).
FAQs = questions people actually type into ChatGPT about this topic.

Write a complete editorial guide in English.

TITLE: Best Restaurants in Deià 2026
TARGET QUERIES: best restaurants deia mallorca, where to eat deia, deia restaurants 2026, lunch deia mallorca
AUDIENCE: Day visitors from Sóller or Valldemossa, people staying in or near Deià (typically higher budget).

STEP 1 — Research and verify:
- La Residencia hotel restaurant — is it open to non-guests, current price range
- Sa Font Fresca — current status, type of food
- Trattoria Italiana — verify current name and status
- s'Hortet — what type of place is it (café, restaurant, tearoom)?
- Cas Peixot — verify current status
- Can Xelini — verify current status
- Price reality: is Deià significantly more expensive than Sóller or Valldemossa for food?
- Is Deià doable as a lunch stop on a drive, or does it require more planning?

STEP 2 — Write in this exact JSON format:
{"title":"...","excerpt":"...","intro":"...","sections":[{"heading":"...","body":"...","business_ids":[]}],"faqs":[{"question":"...","answer":"..."}],"seo":{"title":"...","description":"..."},"mentioned_businesses":[{"name":"...","place_id_url":"...","category":"restaurant"}]}

CRITICAL:
- Return ONLY valid JSON. No markdown outside the JSON.
- business_ids: always empty [].
- Be honest about price level — Deià is expensive, don't hide that.
- Include a practical section on combining with Sóller or Valldemossa in one day.
- FAQs: is Deià expensive, can you eat well on a budget in Deià, is La Residencia worth it.
- mentioned_businesses: min 5, with Google Maps URLs.
```
