import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
function loadEnv(){ if(!existsSync(".env.local"))return; for(const l of readFileSync(".env.local","utf8").split(/\r?\n/)){const i=l.indexOf("=");if(i<0)continue;const k=l.slice(0,i).trim(),v=l.slice(i+1).trim().replace(/^["']|["']$/g,"");if(!process.env[k])process.env[k]=v;}}
loadEnv();
const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);
const {data}=await sb.from("businesses").select("name,status,rating,reviews_count,detail_enriched_at,primary_image_url,primary_photo_name,place_reviews").eq("id","google-ChIJV9IGy11JlhIRdT9diTL4r38").maybeSingle();
console.log("name:", data.name);
console.log("rating:", data.rating, "| reviews_count:", data.reviews_count);
console.log("place_reviews:", Array.isArray(data.place_reviews)?data.place_reviews.length+" texts":"none");
console.log("detail_enriched_at:", data.detail_enriched_at || "NULL");
console.log("primary_image_url (cover):", data.primary_image_url || "NULL");
console.log("primary_photo_name (candidate):", data.primary_photo_name ? "present" : "NULL");
