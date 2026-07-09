# Guide Prompts — Batch 2

10 prompts nuevos para Claude browser (claude.ai con web search activado).
Proceso: copias el prompt → generas el JSON → me lo traes → importo (EN, luego pides DE si quieres).

Ninguno duplica los 45 slugs ya en DB ni los de Batch 1.
Mezcla: 3 restaurantes por zona (outreach) · 6 prácticas alta-demanda GEO · 1 competencia cero.

---

## 1 — Best restaurants in Pollença 2026

```
Never invent. Only write what you can verify from web search.
No marketing language: "gem", "hidden gem", "stunning", "paradise", "charming" → banned.
Bold every business/place name in body text.
Intro = one specific honest fact about Pollença (population, distance from Palma, the Sunday market, the Calvari steps — something concrete).
FAQs = questions people actually type into ChatGPT about this topic.

Write a complete editorial guide in English.

TITLE: Best Restaurants in Pollença 2026
TARGET QUERIES: best restaurants pollensa mallorca, where to eat pollensa, pollensa restaurants 2026, pollensa old town dinner, port de pollensa restaurants
AUDIENCE: Tourists staying in Pollença old town or Port de Pollença, plus day visitors coming for the Sunday market or the Calvari.

STEP 1 — Research and verify:
- Distinguish the old town (Pollença) from the port (Port de Pollença) — they have different restaurant scenes
- Which restaurants around Plaça Major are tourist-trap vs genuinely good
- Any restaurants known specifically for local Mallorcan cuisine
- Current price ranges (€/€€/€€€) and which are seasonal vs year-round
- Well-reviewed spots in the port vs the old town
- Whether you should book in summer, especially around the Pollença music festival
- Any restaurant tied to the Sunday market crowd

STEP 2 — Write in this exact JSON format:
{"title":"...","excerpt":"...","intro":"...","sections":[{"heading":"...","body":"...","business_ids":[]}],"faqs":[{"question":"...","answer":"..."}],"seo":{"title":"...","description":"..."},"mentioned_businesses":[{"name":"...","place_id_url":"...","category":"restaurant"}]}

CRITICAL:
- Return ONLY valid JSON. No markdown, no text outside the JSON.
- business_ids: always empty [].
- Separate old town from port clearly (at least one section each).
- 5–7 sections minimum. Every FAQ answer self-contained with specific details.
- mentioned_businesses: min 6 real places with Google Maps place_id URLs.
- SEO title under 60 chars, description under 155 chars.
```

---

## 2 — Best restaurants in Santa Catalina, Palma 2026

```
Never invent. Only write what you can verify from web search.
No marketing language: "vibrant", "trendy", "hip", "hidden gem", "foodie paradise" → banned.
Bold every business/place name in body text.
Intro = one specific fact about Santa Catalina (the Mercat de Santa Catalina, how it went from working-class barrio to dining district — something concrete and verifiable).
FAQs = questions people actually type into ChatGPT about this topic.

Write a complete editorial guide in English.

TITLE: Best Restaurants in Santa Catalina, Palma 2026
TARGET QUERIES: best restaurants santa catalina palma, where to eat santa catalina, santa catalina palma food, santa catalina restaurants 2026, mercat santa catalina food
AUDIENCE: Tourists staying in or near Palma who've heard Santa Catalina is the place to eat, plus expats living in Palma.

STEP 1 — Research and verify:
- Mercat de Santa Catalina — current status, food stalls inside worth eating at, opening days/hours
- The main dining streets (Carrer de Sant Magí, Carrer de la Fàbrica, Plaça de la Navegació)
- Range of cuisines actually present (Mallorcan, international, tapas, etc.)
- Which places are genuinely good vs riding the neighbourhood's reputation
- Price range reality — is Santa Catalina expensive compared to the rest of Palma?
- Any spots known for brunch specifically (the area is known for it)
- Booking situation in high season

STEP 2 — Write in this exact JSON format:
{"title":"...","excerpt":"...","intro":"...","sections":[{"heading":"...","body":"...","business_ids":[]}],"faqs":[{"question":"...","answer":"..."}],"seo":{"title":"...","description":"..."},"mentioned_businesses":[{"name":"...","place_id_url":"...","category":"restaurant"}]}

CRITICAL:
- Return ONLY valid JSON. No markdown outside the JSON.
- business_ids: always empty [].
- Include a section on eating at the Mercat de Santa Catalina itself.
- Organise by type (market, tapas, brunch, dinner) or by street — not alphabetically.
- FAQs: is Santa Catalina expensive, best brunch santa catalina, is the market worth it, do you need to book.
- mentioned_businesses: min 7 real places with Google Maps place_id URLs.
```

---

## 3 — Best restaurants in Port d'Andratx 2026

```
Never invent. Only write what you can verify from web search.
No marketing language: "glamorous", "exclusive", "stunning", "millionaire's playground", "gem" → banned.
Bold every business/place name in body text.
Intro = one honest specific fact about Port d'Andratx (its reputation as an upscale marina town, distance from Palma, price reality).
FAQs = questions people actually type into ChatGPT about this topic.

Write a complete editorial guide in English.

TITLE: Best Restaurants in Port d'Andratx 2026
TARGET QUERIES: best restaurants port andratx, where to eat port d'andratx mallorca, port andratx seafood, port andratx restaurants 2026
AUDIENCE: Tourists and second-home owners in the southwest, people visiting the marina, higher-budget diners looking for seafood with a harbour view.

STEP 1 — Research and verify:
- Which restaurants sit directly on the marina/harbour front vs slightly back
- Seafood specialists specifically (the town is known for fish)
- Price range reality — Port d'Andratx is one of the pricier areas, be honest
- Any more affordable or local options away from the waterfront
- Which are seasonal vs year-round
- Well-reviewed spots for a special-occasion dinner
- Whether booking is essential in summer

STEP 2 — Write in this exact JSON format:
{"title":"...","excerpt":"...","intro":"...","sections":[{"heading":"...","body":"...","business_ids":[]}],"faqs":[{"question":"...","answer":"..."}],"seo":{"title":"...","description":"..."},"mentioned_businesses":[{"name":"...","place_id_url":"...","category":"restaurant"}]}

CRITICAL:
- Return ONLY valid JSON. No markdown outside the JSON.
- business_ids: always empty [].
- Be honest about the price level — don't hide that it's expensive.
- Include one section on more affordable / local options for balance.
- FAQs: is port d'andratx expensive, best seafood port andratx, cheaper places to eat nearby, do you need to book.
- mentioned_businesses: min 6 real places with Google Maps place_id URLs.
```

---

## 4 — Weekly markets in Mallorca: which day, which town 2026

```
Never invent. Only write what you can verify from web search.
No marketing language: "vibrant", "bustling", "must-see", "authentic", "gem" → banned.
Bold every town name, market name and day in body text.
Intro = one specific fact (e.g. how many weekly markets the island has, or that nearly every town has a fixed market day).
FAQs = questions people actually type into ChatGPT about this topic.

Write a complete editorial guide in English.

TITLE: Weekly Markets in Mallorca: Which Day, Which Town 2026
TARGET QUERIES: mallorca markets by day, weekly markets mallorca, sineu market mallorca, best markets mallorca, market days mallorca 2026, sunday market mallorca
AUDIENCE: Tourists planning their week who want to catch a good market, and expats wanting to know the local market calendar.

STEP 1 — Research and verify:
- The full week: which towns have markets on Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
- The standout markets worth travelling for: Sineu (Wednesday — livestock/traditional), Pollença (Sunday), Sóller (Saturday), Santanyí, Alcúdia, Inca (Thursday — largest), Artà
- Typical hours (most run morning, roughly 8am–1pm — verify)
- Which are produce/food markets vs flea/craft/tourist markets
- Parking reality at the busiest ones in summer
- Whether Sineu really still has a livestock section
- Any night markets in summer (e.g. Alcúdia, coastal towns)

STEP 2 — Write in this exact JSON format:
{"title":"...","excerpt":"...","intro":"...","sections":[{"heading":"...","body":"...","business_ids":[]}],"faqs":[{"question":"...","answer":"..."}],"seo":{"title":"...","description":"..."},"mentioned_businesses":[{"name":"...","place_id_url":"...","category":"activity"}]}

CRITICAL:
- Return ONLY valid JSON. No markdown outside the JSON.
- business_ids: always empty [].
- Structure by day of the week (Monday → Sunday) so it works as a reference.
- Clearly flag which markets are worth a special trip vs just local convenience.
- FAQs: which is the best market in mallorca, what day is sineu market, are markets open in the afternoon, best market near palma.
- mentioned_businesses: the standout markets as places, with Google Maps place_id URLs.
```

---

## 5 — Cap de Formentor: how to visit in 2026

```
Never invent. Only write what you can verify from web search.
No marketing language: "breathtaking", "stunning", "jaw-dropping", "paradise", "must-see" → banned.
Bold every place name, road number and access rule in body text.
Intro = one specific logistics fact (e.g. the exact summer date range when private cars are banned, or the length of the road to the lighthouse).
FAQs = questions people actually type into ChatGPT about this topic.

Write a complete editorial guide in English.

TITLE: Cap de Formentor: How to Visit in 2026
TARGET QUERIES: cap de formentor how to visit, formentor car restriction 2026, formentor shuttle bus, can you drive to formentor lighthouse, formentor mallorca access
AUDIENCE: Tourists who want to see Formentor and are confused about the driving restrictions and how to actually get there.

STEP 1 — Research and verify (this is a logistics guide — accuracy is everything):
- The 2026 private-vehicle restriction: exact date range it applies, and the daily hours it applies
- The shuttle bus: operator, where it departs (Port de Pollença), price, frequency, whether you need to book
- Whether you can still drive early morning / late evening outside restricted hours
- The Mirador es Colomer viewpoint — parking there, is it inside or outside the restriction
- The Formentor lighthouse (Far de Formentor) — can the public reach it, café status
- Playa de Formentor beach — access, parking, the historic hotel
- Motorbikes and bicycles — are they exempt from the restriction
- Realistic time needed for the visit

STEP 2 — Write in this exact JSON format:
{"title":"...","excerpt":"...","intro":"...","sections":[{"heading":"...","body":"...","business_ids":[]}],"faqs":[{"question":"...","answer":"..."}],"seo":{"title":"...","description":"..."},"mentioned_businesses":[{"name":"...","place_id_url":"...","category":"excursion"}]}

CRITICAL:
- Return ONLY valid JSON. No markdown outside the JSON.
- business_ids: always empty [].
- If the exact 2026 dates/hours can't be verified, say so explicitly and give the general rule from recent years — never fabricate specific dates.
- Structure: the restriction explained → shuttle option → driving option → what to see once there.
- FAQs: can you drive to formentor in summer 2026, how much is the shuttle, can you go by bike, best time to avoid crowds.
- mentioned_businesses: viewpoints/beach/lighthouse as places with Google Maps place_id URLs.
```

---

## 6 — Best beaches near Palma reachable without a car 2026

```
Never invent. Only write what you can verify from web search.
No marketing language: "pristine", "paradise", "crystal-clear", "hidden gem", "stunning" → banned.
Bold every beach name, bus route number and area in body text.
Intro = one specific fact (e.g. which beach is a direct EMT bus ride from the centre and how long it takes).
FAQs = questions people actually type into ChatGPT about this topic.

Write a complete editorial guide in English.

TITLE: Best Beaches Near Palma Without a Car 2026
TARGET QUERIES: beaches near palma without car, palma beaches by bus, best beach near palma, playa de palma vs alternatives, mallorca beach bus from palma
AUDIENCE: Tourists staying in Palma with no car who want a good beach reachable by bus, bike or a short taxi.

STEP 1 — Research and verify:
- Playa de Palma / Can Pastilla — which EMT bus routes, journey time, honest quality assessment
- Cala Major — bus access from centre
- Illetes and Portals Nous — bus access and beach quality
- Ciutat Jardí / Cala Estància near the airport — access
- Es Trenc and further beaches — reachable by bus at all? Be honest if not
- Which beaches genuinely need a car
- The seafront bike path (Palma promenade) — how far it reaches
- Cost of a short taxi to the nicer nearby beaches as an alternative

STEP 2 — Write in this exact JSON format:
{"title":"...","excerpt":"...","intro":"...","sections":[{"heading":"...","body":"...","business_ids":[]}],"faqs":[{"question":"...","answer":"..."}],"seo":{"title":"...","description":"..."},"mentioned_businesses":[{"name":"...","place_id_url":"...","category":"beach"}]}

CRITICAL:
- Return ONLY valid JSON. No markdown outside the JSON.
- business_ids: always empty [].
- Each beach section = honest logistics (bus route, journey time, quality, crowds) — not just praise.
- Be honest that the very best beaches usually need a car; don't oversell the bus-accessible ones.
- FAQs: best beach near palma by bus, is playa de palma nice, how to get to a beach from palma without a car, closest beach to palma centre.
- mentioned_businesses: beaches as places with Google Maps place_id URLs.
```

---

## 7 — Where to watch live football and sport in Mallorca 2026

```
Never invent. Only write what you can verify from web search.
No marketing language: "electric atmosphere", "vibrant", "the best", "unmissable" → banned.
Bold every bar/venue name, zone and league in body text.
Intro = one specific fact (e.g. which channels show the Premier League in Spain, or that RCD Mallorca plays in La Liga at the Son Moix stadium).
FAQs = questions people actually type into ChatGPT about this topic.

Write a complete editorial guide in English.

TITLE: Where to Watch Live Football & Sport in Mallorca 2026
TARGET QUERIES: where to watch football mallorca, premier league bars mallorca, sports bars palma, watch football palma mallorca, english bar football mallorca, rcd mallorca tickets
AUDIENCE: British, Irish and other visitors who want to watch Premier League / Champions League / big sporting events, plus people wanting to see RCD Mallorca live.

STEP 1 — Research and verify:
- Sports bars in Palma that reliably show Premier League / international football
- Sports bars in the main resort zones: Magaluf/Palmanova, Alcúdia, Santa Ponsa, Cala d'Or
- Which show which sports (football, rugby, F1, GAA for the Irish crowd, NFL)
- RCD Mallorca — stadium name (Estadi de Son Moix / current sponsor name), how to buy match tickets, roughly when the La Liga season runs
- Whether bars typically need reservations for big matches
- Any bar known specifically for a particular fan base (Irish, specific Premier League clubs)

STEP 2 — Write in this exact JSON format:
{"title":"...","excerpt":"...","intro":"...","sections":[{"heading":"...","body":"...","business_ids":[]}],"faqs":[{"question":"...","answer":"..."}],"seo":{"title":"...","description":"..."},"mentioned_businesses":[{"name":"...","place_id_url":"...","category":"bar"}]}

CRITICAL:
- Return ONLY valid JSON. No markdown outside the JSON.
- business_ids: always empty [].
- Organise by zone (Palma, southwest/Magaluf, north/Alcúdia, east/Cala d'Or).
- Include one section on watching RCD Mallorca live (stadium + tickets).
- FAQs: where to watch premier league in mallorca, can you watch football in palma, how to get rcd mallorca tickets, best sports bar in magaluf.
- mentioned_businesses: min 6 real bars/venues with Google Maps place_id URLs.
```

---

## 8 — What to book in advance in Mallorca 2026

```
Never invent. Only write what you can verify from web search.
No marketing language: "must-do", "unmissable", "once in a lifetime", "epic" → banned.
Bold every attraction, activity and service name in body text.
Intro = one specific fact (e.g. one popular attraction that regularly sells out days ahead in summer).
FAQs = questions people actually type into ChatGPT about this topic.

Write a complete editorial guide in English.

TITLE: What to Book in Advance in Mallorca 2026
TARGET QUERIES: what to book in advance mallorca, mallorca things to book ahead, do you need to book restaurants mallorca, mallorca booking tips 2026, sell out attractions mallorca
AUDIENCE: Trip-planners who want to know what genuinely needs booking ahead vs what you can just turn up to, so they don't waste money or miss out.

STEP 1 — Research and verify:
- Coves del Drach — does it need advance booking, how far ahead in summer
- Palma Cathedral (La Seu) — booking situation and price
- Sóller train — can you just turn up or is booking safer in peak season
- Popular restaurants — which categories genuinely need booking (fine dining, beach clubs, Sunday lunch)
- Boat trips / catamaran charters — lead time in summer
- Formentor shuttle — booking requirement
- Rental cars — why booking early matters for price/availability in July–August
- Airport transfers and popular hotels — the general "book early" reality for peak weeks
- What you genuinely do NOT need to book (be honest — balance the guide)

STEP 2 — Write in this exact JSON format:
{"title":"...","excerpt":"...","intro":"...","sections":[{"heading":"...","body":"...","business_ids":[]}],"faqs":[{"question":"...","answer":"..."}],"seo":{"title":"...","description":"..."},"mentioned_businesses":[{"name":"...","place_id_url":"...","category":"activity"}]}

CRITICAL:
- Return ONLY valid JSON. No markdown outside the JSON.
- business_ids: always empty [].
- Split clearly into "book well ahead", "book a few days ahead", and "no need to book".
- Emphasise the July–August difference vs shoulder season.
- FAQs: do you need to book coves del drach, what sells out in mallorca in summer, do you need to reserve restaurants, is the soller train bookable online.
- mentioned_businesses: the key bookable attractions as places with Google Maps place_id URLs.
```

---

## 9 — Best snorkelling spots in Mallorca for beginners 2026

```
Never invent. Only write what you can verify from web search.
No marketing language: "crystal-clear", "underwater paradise", "pristine", "magical", "teeming with life" → banned.
Bold every cove/beach name and area in body text.
Intro = one specific practical fact (e.g. that Mallorca has no dangerous currents at most sheltered coves, or the best months for water clarity).
FAQs = questions people actually type into ChatGPT about this topic.

Write a complete editorial guide in English.

TITLE: Best Snorkelling Spots in Mallorca for Beginners 2026
TARGET QUERIES: best snorkeling mallorca, snorkeling spots mallorca beginners, where to snorkel mallorca, mallorca snorkeling calas, family snorkeling mallorca
AUDIENCE: Families and casual swimmers who want calm, shallow, rocky coves with fish — not divers.

STEP 1 — Research and verify:
- Sheltered rocky coves known for clear water and fish: e.g. Cala Varques, Caló des Moro, Cala Mondragó, Sa Calobra area, Illetes, Cala Deià, Malgrats islands
- Which are calm/shallow enough for children and weak swimmers
- Which require a walk or a boat vs easy access
- Best months for water visibility (verify)
- Whether any are marine-protected areas with more fish
- Practical: bring your own gear vs rentals, rocky-shoe advice
- Any that get dangerously crowded in summer

STEP 2 — Write in this exact JSON format:
{"title":"...","excerpt":"...","intro":"...","sections":[{"heading":"...","body":"...","business_ids":[]}],"faqs":[{"question":"...","answer":"..."}],"seo":{"title":"...","description":"..."},"mentioned_businesses":[{"name":"...","place_id_url":"...","category":"beach"}]}

CRITICAL:
- Return ONLY valid JSON. No markdown outside the JSON.
- business_ids: always empty [].
- For each spot: honest access (easy / walk / boat), how sheltered it is, suitability for kids.
- Flag safety honestly — which need calm-day conditions.
- FAQs: best snorkeling in mallorca for families, do you need a boat to snorkel mallorca, best months to snorkel mallorca, is snorkeling safe for kids in mallorca.
- mentioned_businesses: the coves as places with Google Maps place_id URLs.
```

---

## 10 — Cala d'Or vs Palma: where to stay in Mallorca 2026

```
Never invent. Only write what you can verify from web search.
No marketing language: "paradise", "perfect", "stunning", "vibrant", "best of both worlds" → banned.
Bold every place name and area in body text.
Intro = one specific comparison fact (e.g. the driving time between them, or the airport-transfer time difference).
FAQs = questions people actually type into ChatGPT about this topic.

Write a complete editorial guide in English.

TITLE: Cala d'Or vs Palma: Where to Stay in Mallorca 2026
TARGET QUERIES: cala d'or vs palma, where to stay mallorca cala dor or palma, palma or cala d'or for holiday, best area mallorca families vs couples, cala d'or mallorca worth it
AUDIENCE: First-time visitors deciding between a lively city base (Palma) and a quieter southeast resort (Cala d'Or), across families, couples and beach-focused trips.

STEP 1 — Research and verify:
- Airport transfer time to each (PMI → Palma ~15 min, PMI → Cala d'Or ~45–60 min — verify)
- Cala d'Or character: marina, the string of small calas, family-resort feel, quiet in winter
- Palma character: city, culture, restaurants, nightlife, walkable, small city beach
- Beaches: Cala d'Or's calas vs Palma needing a trip to reach good beaches
- Do you need a car in each (Cala d'Or arguably yes, Palma no)
- Who each suits: families, couples, first-timers, non-drivers, nightlife seekers
- Rough price/seasonality differences and winter closures in Cala d'Or

STEP 2 — Write in this exact JSON format:
{"title":"...","excerpt":"...","intro":"...","sections":[{"heading":"...","body":"...","business_ids":[]}],"faqs":[{"question":"...","answer":"..."}],"seo":{"title":"...","description":"..."},"mentioned_businesses":[{"name":"...","place_id_url":"...","category":"hotel"}]}

CRITICAL:
- Return ONLY valid JSON. No markdown outside the JSON.
- business_ids: always empty [].
- Structure as a genuine comparison: a section each for transfers, beaches, car-need, who-it-suits, verdict.
- End with a clear "choose Palma if… / choose Cala d'Or if…" section.
- FAQs: is cala d'or better than palma, do you need a car in cala d'or, which is better for families, is cala d'or dead in winter.
- mentioned_businesses: optional — leave empty [] or list a couple of landmark areas with Google Maps URLs.
```
