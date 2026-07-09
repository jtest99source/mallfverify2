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

function toSlug(v){return v.normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)+/g,"");}
async function getUniqueSlug(cat,base,pid){let c=base,n=2;while(true){const{data}=await sb.from("businesses").select("id,google_place_id").eq("category",cat).eq("slug",c).maybeSingle();if(!data||data.google_place_id===pid)return c;c=`${base}-${n++}`;}}
function reviewText(r){return typeof r.text==="string"?r.text:r.text?.text;}
function buildReviews(p){return (p.reviews??[]).map(r=>({authorName:r.authorAttribution?.displayName??null,authorUri:r.authorAttribution?.uri??null,rating:typeof r.rating==="number"?r.rating:null,relativeTimeDescription:r.relativePublishTimeDescription??null,text:reviewText(r)??null,languageCode:typeof r.text==="object"?r.text?.languageCode??null:null})).filter(r=>r.text);}
async function fetchPlace(apiKey,pid){
  const r=await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(pid)}`,{headers:{"X-Goog-Api-Key":apiKey,"X-Goog-FieldMask":"id,displayName,formattedAddress,location,googleMapsUri,websiteUri,nationalPhoneNumber,rating,userRatingCount,primaryType,types,photos.name,photos.authorAttributions,reviews.rating,reviews.text,reviews.relativePublishTimeDescription,reviews.authorAttribution"}});
  if(!r.ok) throw new Error(`Places API ${r.status}: ${await r.text()}`);
  return r.json();
}

// ── Import missing Es Racó ─────────────────────────────────────────────────
const RACO_PID="ChIJR8l0-XAhmBIRAfhFG9QOlqo", CAT="restaurant";
let racoId=`google-${RACO_PID}`;
const {data:racoRow}=await sb.from("businesses").select("id").eq("google_place_id",RACO_PID).maybeSingle();
if(!racoRow){
  const apiKey=process.env.GOOGLE_PLACES_API_KEY;
  if(!apiKey) throw new Error("Missing GOOGLE_PLACES_API_KEY");
  const p=await fetchPlace(apiKey,RACO_PID);
  const name=p.displayName?.text??"Es Racó d'es Puput";
  const address=p.formattedAddress??"";
  const website=p.websiteUri??null;
  const loc=inferLocationFromAddress(address);
  const wsType=detectWebsiteType(website);
  const photos=(p.photos??[]).map(x=>x.name).filter(Boolean);
  const reviews=buildReviews(p);
  const slug=await getUniqueSlug(CAT,toSlug(name),RACO_PID);
  const shortDesc=`Restaurant en ${loc.municipality||loc.city||"Andratx"} con datos verificados de Google.`;
  const {error}=await sb.from("businesses").insert({
    id:racoId,slug,name,category:CAT,short_description:shortDesc,description:"",
    rating:p.rating??null,reviews_count:p.userRatingCount??null,
    website,phone:p.nationalPhoneNumber??null,address,
    latitude:p.location?.latitude??null,longitude:p.location?.longitude??null,
    google_maps_url:p.googleMapsUri??null,primary_type:p.primaryType??null,raw_google_place:p,tags:p.types??[],
    primary_photo_name:photos[0]??null,photo_names:photos.length?photos:null,
    place_reviews:reviews,detail_enriched_at:new Date().toISOString(),
    area:loc.area,city:loc.city??null,municipality:loc.municipality??null,island:"Mallorca",
    website_type:wsType,social_profiles:createSocialProfiles(website,wsType),
    authority_score:calculateAuthorityScore({rating:p.rating,reviews_count:p.userRatingCount,website,category:CAT}),
    image:"/images/restaurant.svg",gallery:[],opening_hours:null,faqs:[],best_for:[],
    seo:{title:`${name}: restaurant en Mallorca | Mallorca Verified`,description:shortDesc},
    status:"published",source:"google_places",commercial_priority:"medium",client_potential:"medium",
    is_featured:false,is_claimed:false,instagram:null,price_level:null,
    updated_at:new Date().toISOString().slice(0,10),imported_at:new Date().toISOString(),google_place_id:RACO_PID,
  });
  if(error){console.error("Insert error:",error.message);process.exit(1);}
  console.log(`✓ Imported Es Racó: ${name} (★${p.rating}, ${p.userRatingCount} reviews, ${reviews.length} review texts)`);
}else{racoId=racoRow.id;console.log("Es Racó already in DB.");}

const ID={
  garden:"google-ChIJKyJVRvIhmBIRHLUDFGMfer4",
  fortuna:"google-ChIJwyxjirInmBIRNOPwrLdAh0M",
  universal:"google-ChIJFVzzOuknmBIRbciP8P141Qw",
  casaTon:"google-ChIJq6lHufYhmBIRAUSfKB1jlTw",
  gallega:"google-ChIJDz143qwmmBIRsrCOyjqISaE",
  galicia:"google-ChIJD3JZJq0mmBIRHChmdSQEc88",
  viva:"google-ChIJZ-7c8X0nmBIR4OT7sidfIpQ",
  canPaco:"google-ChIJMyb5SvogmBIR3GXsnPWpFUs",
  raco:racoId,
  barCubano:"google-ChIJh8ACNWOKlxIRKa9z1mvQM3A",
};

// hero from first renderable business photo
const order=[ID.garden,ID.fortuna,ID.viva,ID.casaTon,...Object.values(ID)];
const {data:photoRows}=await sb.from("businesses").select("id,primary_image_url").in("id",[...new Set(order)]);
const pmap=new Map((photoRows||[]).map(r=>[r.id,r.primary_image_url]));
const renderable=u=>typeof u==="string"&&(u.startsWith("https://lh3.googleusercontent.com")||u.startsWith("https://images.unsplash.com"));
const hero=[...new Set(order)].map(id=>pmap.get(id)).find(renderable)||null;
console.log(`Hero: ${hero?hero.slice(0,60):"NONE"}`);

const {data:existing}=await sb.from("guides").select("id").eq("slug","best-restaurants-port-andratx-2026").eq("locale","en").maybeSingle();
if(existing){console.log("Guide already exists, skipping.");process.exit(0);}

const guide={
  id:crypto.randomUUID(),
  slug:"best-restaurants-port-andratx-2026",
  locale:"en",
  title:"Best Restaurants in Port d'Andratx 2026",
  excerpt:"Where to eat in Mallorca's upscale southwest marina town — the harbour-front seafood and dining, plus the more affordable local options a short drive inland.",
  intro:"Port d'Andratx is an upscale marina town at the southwest tip of Mallorca, about 30–35 minutes from Palma, known for its yacht-lined harbour, second homes and a dining scene priced to match. It's one of the island's more expensive places to eat out, particularly the restaurants directly on the waterfront, where you pay a premium for the harbour view as much as the food. That said, there's genuinely good seafood here, a few well-priced standouts, and more affordable, local options a short drive inland in the old town of **Andratx** itself. This guide separates the harbour-front restaurants from the better-value alternatives, and is honest about what you're paying for and where.",
  sections:[
    {heading:"On the harbour: the waterfront restaurants",business_ids:[ID.garden,ID.fortuna,ID.universal],body:"The prime dining is along the **Avinguda Almirante Riera Alemany** and the promenade, where restaurants sit directly over the water. **Garden del Mar** (4.8 stars, ~80 reviews) is a well-rated waterfront spot serving fresh fish, sushi and Mediterranean dishes, with reviewers highlighting the front-row harbour tables and fresh ingredients, though noting service can be relaxed. **Fortuna** (4.8 stars, ~255 reviews) is a long-standing harbour-front seafood restaurant praised for tuna tartare, grilled fish and tempura prawns, with a good set menu that several reviewers call surprisingly good value — though, as at many busy waterfront spots, some report slow service at peak times.\n\n**La Universal** (4.7 stars, ~310 reviews) is a slightly more refined harbour-side restaurant with duck rolls, scallops and sea bass among the dishes reviewers rate, and it's honest to note that reviewers themselves say prices run a little higher than neighbouring spots, justified in their view by the quality. These are the tables for the classic Port d'Andratx experience: dinner over the water watching the boats, at waterfront prices."},
    {heading:"Seafood specialists",business_ids:[ID.casaTon,ID.gallega,ID.galicia],body:"Port d'Andratx has a cluster of dedicated seafood and shellfish restaurants, several Galician-style (the Galicians are Spain's seafood specialists). **Casa Ton** (4.7 stars, ~165 reviews) is a small, personal spot where the owner Toni serves fish caught fresh that day, simply cooked with salad and potatoes, and reviewers repeatedly single out the red prawns — though one or two flag that the simple presentation comes at a high price, so it suits those prioritising quality over frills. **Marisquería La Gallega** (4.4 stars, ~710 reviews) and **Marisquería Galicia** (4.2 stars, ~650 reviews) are the two long-running Galician seafood houses just off the harbour on Carrer Isaac Peral, both serving grilled fish, langoustines, paella and shellfish to a mix of locals and visitors.\n\nOf the two marisquerías, reviewers describe fresh fish (some flown in from Galicia) and generous portions, at prices they generally call reasonable for the town — though, being Port d'Andratx, still not cheap, with several noting the usual harbour-town mark-ups on extras like water. For a seafood-focused meal rather than a view-first one, these are the picks."},
    {heading:"Standout value: Restaurante Viva",business_ids:[ID.viva],body:"One harbour-area restaurant stands out for combining quality with value: **Restaurante Viva** (4.9 stars, ~220 reviews), a small fusion spot just back from the water on Carrer Isaac Peral. Reviewers highlight expertly prepared, creative dishes, a strong wine list and a warm, owner-run atmosphere — with a three-course menu that several describe as excellent value at around €27–40 per person, notably less than the waterfront tables for comparable quality. The owner is known for singing at the end of service, which reviewers mention fondly.\n\nIt's dinner-focused, small and popular, so booking ahead is wise. For anyone who wants a genuinely good meal in Port d'Andratx without the full waterfront premium, this is the one reviewers most consistently rate on both food and price — a useful counterpoint to the harbour-front spots."},
    {heading:"More affordable and local: the old town of Andratx",business_ids:[ID.canPaco,ID.raco,ID.barCubano],body:"For a real drop in prices, head 4 km inland to the old town of **Andratx** itself, where the restaurants serve a more local crowd at markedly lower prices than the port. **Mesón Can Paco** (4.3 stars, ~830 reviews) is a traditional restaurant with hillside terrace views, repeatedly praised for its paella, generous portions and, reviewers stress, very reasonable prices — a marked contrast to the harbour. **Es Racó d'es Puput** (4.6 stars, ~300 reviews) is a small, well-liked spot for fresh homemade food at fair prices, good for a relaxed lunch.\n\nIn the historic upper part of town, **Bar Cubano** (4.5 stars, ~880 reviews) on Plaça des Pou is a friendly café-bar for coffee, breakfast and tapas that reviewers find surprisingly good for the setting, at everyday prices. Eating in Andratx town rather than the port is the honest tip for anyone wanting good local food without the marina mark-up — you trade the harbour view for better value and a more local feel."},
    {heading:"Is Port d'Andratx expensive, and do you need to book?",business_ids:[],body:"Being direct: yes, Port d'Andratx is one of Mallorca's pricier places to eat, and the waterfront restaurants in particular charge a premium for their harbour setting — reviewers routinely note that things are 'expensive here by default', with mark-ups even on basics like bottled water. This isn't a reason to avoid it, but it's worth going in with realistic expectations: on the harbour, you're partly paying for one of the prettiest dining views on the island. The value plays are Restaurante Viva just back from the water, the Galician marisquerías for seafood, and the old town of Andratx for local prices.\n\nOn booking: in summer, the popular harbour-front tables and Restaurante Viva fill up, so booking ahead is recommended, especially for a waterfront table at sunset or for a group. Many places are dinner-focused and some close a day midweek, so check hours. For a special-occasion harbour dinner, reserve; for the inland and casual spots, you can more often just turn up."},
  ],
  faqs:[
    {question:"What are the best restaurants in Port d'Andratx?",answer:"On the harbour, Garden del Mar, Fortuna and La Universal are well-rated waterfront choices, and Casa Ton is a personal seafood spot. Restaurante Viva, just back from the water, stands out for combining high quality with better value. For Galician seafood, Marisquería La Gallega and Marisquería Galicia are the specialists. For lower prices, the old town of Andratx has Mesón Can Paco and Es Racó d'es Puput. Booking ahead is wise in summer."},
    {question:"Is Port d'Andratx expensive?",answer:"Yes — it's one of Mallorca's more expensive places to eat, especially the waterfront restaurants, where you pay a premium for the harbour view and reviewers note mark-ups even on basics like water. You can eat more affordably at Restaurante Viva just back from the water, at the Galician seafood marisquerías, or by driving 4 km inland to the old town of Andratx, where places like Mesón Can Paco serve local food at markedly lower prices."},
    {question:"Where is the best seafood in Port d'Andratx?",answer:"For simply cooked fresh fish, Casa Ton serves the day's catch and is known for its red prawns, though at a high price. The two long-running Galician marisquerías — Marisquería La Gallega and Marisquería Galicia on Carrer Isaac Peral — specialise in grilled fish, langoustines, paella and shellfish, some flown in from Galicia, at prices reviewers call reasonable for the town. Fortuna on the harbour is also well rated for its seafood and views."},
    {question:"Are there cheaper places to eat near Port d'Andratx?",answer:"Yes — drive about 4 km inland to the old town of Andratx, where prices drop noticeably. Mesón Can Paco is praised for its paella and very reasonable prices with hillside views, Es Racó d'es Puput does fresh homemade food at fair prices, and Bar Cubano in the historic upper town is good for coffee, breakfast and tapas at everyday prices. Near the harbour itself, Restaurante Viva offers the best balance of quality and value."},
  ],
  seo:{title:"Best Restaurants in Port d'Andratx 2026",description:"Where to eat in Port d'Andratx: harbour-front seafood and dining, plus better-value and local options inland. Honest picks, prices and booking tips."},
  status:"published",source:"claude_browser",is_featured:false,hero_image_url:hero,
  updated_at:new Date().toISOString().slice(0,10),imported_at:new Date().toISOString(),
};

const {error}=await sb.from("guides").insert(guide);
if(error){console.error("Error:",error);process.exit(1);}
console.log("✓ Published:",guide.slug,"("+guide.locale+")");
console.log("  Sections:",guide.sections.length,"| FAQs:",guide.faqs.length,"| business_ids:",guide.sections.flatMap(s=>s.business_ids).length,"| hero:",hero?"set":"none");
