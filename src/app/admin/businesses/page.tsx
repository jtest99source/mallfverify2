import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase";

type AdminSearchParams = {
  q?: string;
  category?: string;
  status?: string;
  area?: string;
  client_potential?: string;
};

type BusinessAdminRow = {
  id: string;
  name: string;
  display_name: string | null;
  category: string;
  status: string;
  area: string | null;
  city: string | null;
  municipality: string | null;
  rating: number | null;
  reviews_count: number | null;
  authority_score: number | null;
  website_type: string | null;
  google_maps_url: string | null;
  is_featured: boolean;
  commercial_priority: string;
  client_potential: string;
  editorial_description: string | null;
  ai_description: string | null;
  primary_image_url: string | null;
  primary_image_source: string | null;
  primary_image_credit: string | null;
  image_status: string | null;
  image_candidate_urls: ImageCandidate[] | null;
};

type ImageCandidate = {
  url: string;
  source?: string;
  field?: string;
  pageUrl?: string;
  foundAt?: string;
};

const categories = [
  "restaurant",
  "hotel",
  "beach-club",
  "bar",
  "cafe",
  "nightlife",
  "activity",
  "boat-rental",
  "rent-a-car",
  "car-dealer",
  "gym",
  "spa",
  "healthcare",
  "real-estate"
];
const statuses = ["draft", "published", "premium", "hidden"];
const priorities = ["low", "medium", "high"];
const imageStatuses = ["missing", "editorial_placeholder", "uploaded", "google_places", "client_provided", "candidate_assigned"];

function cleanSearch(value?: string) {
  return value?.trim().replace(/[,()]/g, " ") ?? "";
}

function selected(value: string | undefined, option: string) {
  return value === option;
}

async function getAreas() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("businesses")
    .select("area")
    .not("area", "is", null)
    .order("area", { ascending: true });

  if (error) throw error;
  return Array.from(new Set((data ?? []).map((row) => row.area).filter(Boolean))) as string[];
}

async function getBusinesses(searchParams: AdminSearchParams) {
  const supabase = createSupabaseServerClient();
  let query = supabase
    .from("businesses")
    .select("id,name,display_name,category,status,area,city,municipality,rating,reviews_count,authority_score,website_type,google_maps_url,is_featured,commercial_priority,client_potential,editorial_description,ai_description,primary_image_url,primary_image_source,primary_image_credit,image_status,image_candidate_urls")
    .order("authority_score", { ascending: false, nullsFirst: false })
    .order("reviews_count", { ascending: false, nullsFirst: false })
    .limit(200);

  if (searchParams.category) query = query.eq("category", searchParams.category);
  if (searchParams.status) query = query.eq("status", searchParams.status);
  if (searchParams.area) query = query.eq("area", searchParams.area);
  if (searchParams.client_potential) query = query.eq("client_potential", searchParams.client_potential);

  const q = cleanSearch(searchParams.q);
  if (q) query = query.or(`name.ilike.%${q}%,display_name.ilike.%${q}%`);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as BusinessAdminRow[];
}

async function updateBusiness(formData: FormData) {
  "use server";

  const id = String(formData.get("id") ?? "");
  const returnTo = String(formData.get("return_to") ?? "/admin/businesses");
  if (!id) throw new Error("Missing business id.");

  const supabase = createSupabaseServerClient();
  const selectedImageCandidate = String(formData.get("selected_image_candidate") ?? "").trim();
  const primaryImageUrl = selectedImageCandidate || String(formData.get("primary_image_url") ?? "").trim() || null;
  const imageStatus = String(formData.get("image_status") ?? "missing");

  const { error } = await supabase
    .from("businesses")
    .update({
      status: String(formData.get("status") ?? "draft"),
      is_featured: formData.get("is_featured") === "on",
      commercial_priority: String(formData.get("commercial_priority") ?? "low"),
      client_potential: String(formData.get("client_potential") ?? "low"),
      display_name: String(formData.get("display_name") ?? "").trim() || null,
      editorial_description: String(formData.get("editorial_description") ?? "").trim() || null,
      ai_description: String(formData.get("ai_description") ?? "").trim() || null,
      primary_image_url: primaryImageUrl,
      primary_image_source: selectedImageCandidate ? "official_website" : String(formData.get("primary_image_source") ?? "").trim() || null,
      primary_image_credit: selectedImageCandidate ? String(formData.get("primary_image_credit") ?? "").trim() || "Imagen de la web oficial" : String(formData.get("primary_image_credit") ?? "").trim() || null,
      image_status: selectedImageCandidate && imageStatus === "missing" ? "uploaded" : imageStatus,
      area: String(formData.get("area") ?? "").trim() || "Mallorca",
      city: String(formData.get("city") ?? "").trim() || null,
      municipality: String(formData.get("municipality") ?? "").trim() || null
    })
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/admin/businesses");
  redirect(returnTo);
}

export const metadata = {
  title: "Admin businesses | Mallorca Verified",
  robots: { index: false, follow: false }
};

export default async function AdminBusinessesPage({ searchParams }: { searchParams: Promise<AdminSearchParams> }) {
  noStore();
  const params = await searchParams;
  const [businesses, areas] = await Promise.all([getBusinesses(params), getAreas()]);
  const queryString = new URLSearchParams(Object.entries(params).filter(([, value]) => Boolean(value)) as [string, string][]).toString();
  const returnTo = `/admin/businesses${queryString ? `?${queryString}` : ""}`;

  return (
    <main className="min-h-screen bg-paper px-4 py-8 text-ink sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1800px]">
        <div className="rounded-md border border-coral/30 bg-coral/10 px-4 py-3 text-sm font-semibold text-coral">
          Internal admin — protect before production
        </div>

        <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sea">Admin</p>
            <h1 className="mt-2 font-sans text-4xl font-semibold">Businesses</h1>
            <p className="mt-2 text-sm text-ink/60">Mostrando hasta 200 resultados, ordenados por authority_score.</p>
          </div>
        </div>

        <form className="mt-6 grid gap-3 rounded-md border border-ink/10 bg-white p-4 shadow-sm md:grid-cols-6">
          <label className="text-sm font-semibold">
            Buscar
            <input name="q" defaultValue={params.q ?? ""} className="mt-1 w-full rounded-md border-ink/20 text-sm" placeholder="name o display_name" />
          </label>
          <label className="text-sm font-semibold">
            Category
            <select name="category" defaultValue={params.category ?? ""} className="mt-1 w-full rounded-md border-ink/20 text-sm">
              <option value="">Todas</option>
              {categories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold">
            Status
            <select name="status" defaultValue={params.status ?? ""} className="mt-1 w-full rounded-md border-ink/20 text-sm">
              <option value="">Todos</option>
              {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold">
            Area
            <select name="area" defaultValue={params.area ?? ""} className="mt-1 w-full rounded-md border-ink/20 text-sm">
              <option value="">Todas</option>
              {areas.map((area) => <option key={area} value={area}>{area}</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold">
            Client potential
            <select name="client_potential" defaultValue={params.client_potential ?? ""} className="mt-1 w-full rounded-md border-ink/20 text-sm">
              <option value="">Todos</option>
              {priorities.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
            </select>
          </label>
          <div className="flex items-end gap-2">
            <button className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white" type="submit">Filtrar</button>
            <a href="/admin/businesses" className="rounded-md border border-ink/20 px-4 py-2 text-sm font-semibold">Limpiar</a>
          </div>
        </form>

        <div className="mt-6 space-y-4">
          {businesses.map((business) => (
            <form key={business.id} action={updateBusiness} className="rounded-md border border-ink/10 bg-white p-4 shadow-sm">
              <input type="hidden" name="id" value={business.id} />
              <input type="hidden" name="return_to" value={returnTo} />
              <div className="grid gap-4 xl:grid-cols-[1.1fr_0.7fr_1fr]">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-sea">
                    <span>{business.category}</span>
                    <span>{business.status}</span>
                    <span>{business.area ?? "No area"}</span>
                  </div>
                  <h2 className="mt-2 font-sans text-2xl font-semibold">{business.display_name || business.name}</h2>
                  <p className="mt-1 text-xs text-ink/50">{business.name}</p>
                  <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
                    <p><span className="font-semibold">Rating:</span> {business.rating ?? "—"}</p>
                    <p><span className="font-semibold">Reviews:</span> {business.reviews_count?.toLocaleString("es-ES") ?? "—"}</p>
                    <p><span className="font-semibold">Authority:</span> {business.authority_score ?? "—"}</p>
                    <p><span className="font-semibold">Website:</span> {business.website_type ?? "—"}</p>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                    <p><span className="font-semibold">Image status:</span> {business.image_status ?? "missing"}</p>
                    <p><span className="font-semibold">Image source:</span> {business.primary_image_source ?? "—"}</p>
                  </div>
                  {business.google_maps_url && <a href={business.google_maps_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-sm font-semibold text-coral">Google Maps</a>}
                  {business.primary_image_url && <a href={business.primary_image_url} target="_blank" rel="noreferrer" className="ml-4 mt-3 inline-flex text-sm font-semibold text-coral">Imagen real</a>}
                  {business.image_candidate_urls?.length ? (
                    <p className="mt-3 text-sm font-semibold text-sea">{business.image_candidate_urls.length} candidatas de web oficial</p>
                  ) : null}
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <label className="text-sm font-semibold">
                    Status
                    <select name="status" defaultValue={business.status} className="mt-1 w-full rounded-md border-ink/20 text-sm">
                      {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </label>
                  <label className="flex items-center gap-2 text-sm font-semibold">
                    <input type="checkbox" name="is_featured" defaultChecked={business.is_featured} className="rounded border-ink/30 text-coral" />
                    Featured
                  </label>
                  <label className="text-sm font-semibold">
                    Commercial priority
                    <select name="commercial_priority" defaultValue={business.commercial_priority} className="mt-1 w-full rounded-md border-ink/20 text-sm">
                      {priorities.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
                    </select>
                  </label>
                  <label className="text-sm font-semibold">
                    Client potential
                    <select name="client_potential" defaultValue={business.client_potential} className="mt-1 w-full rounded-md border-ink/20 text-sm">
                      {priorities.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
                    </select>
                  </label>
                  <label className="text-sm font-semibold">
                    Display name
                    <input name="display_name" defaultValue={business.display_name ?? ""} className="mt-1 w-full rounded-md border-ink/20 text-sm" />
                  </label>
                  <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-1">
                    <label className="text-sm font-semibold">
                      Area
                      <input name="area" defaultValue={business.area ?? ""} className="mt-1 w-full rounded-md border-ink/20 text-sm" />
                    </label>
                    <label className="text-sm font-semibold">
                      City
                      <input name="city" defaultValue={business.city ?? ""} className="mt-1 w-full rounded-md border-ink/20 text-sm" />
                    </label>
                    <label className="text-sm font-semibold">
                      Municipality
                      <input name="municipality" defaultValue={business.municipality ?? ""} className="mt-1 w-full rounded-md border-ink/20 text-sm" />
                    </label>
                  </div>
                  <label className="text-sm font-semibold">
                    Image status
                    <select name="image_status" defaultValue={business.image_status ?? "missing"} className="mt-1 w-full rounded-md border-ink/20 text-sm">
                      {imageStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </label>
                  <label className="text-sm font-semibold">
                    Primary image URL
                    <input name="primary_image_url" defaultValue={business.primary_image_url ?? ""} className="mt-1 w-full rounded-md border-ink/20 text-sm" placeholder="https://..." />
                  </label>
                  <label className="text-sm font-semibold">
                    Primary image source
                    <input name="primary_image_source" defaultValue={business.primary_image_source ?? ""} className="mt-1 w-full rounded-md border-ink/20 text-sm" placeholder="uploaded, client_provided..." />
                  </label>
                  <label className="text-sm font-semibold">
                    Primary image credit
                    <input name="primary_image_credit" defaultValue={business.primary_image_credit ?? ""} className="mt-1 w-full rounded-md border-ink/20 text-sm" placeholder="Foto: ..." />
                  </label>
                  {business.image_candidate_urls?.length ? (
                    <fieldset className="rounded-md border border-ink/10 bg-paper/60 p-3">
                      <legend className="text-sm font-semibold">Candidatas oficiales</legend>
                      <div className="mt-2 space-y-2">
                        <label className="flex items-start gap-2 text-sm">
                          <input type="radio" name="selected_image_candidate" value="" defaultChecked className="mt-1 border-ink/30 text-coral" />
                          <span>No asignar candidata</span>
                        </label>
                        {business.image_candidate_urls.slice(0, 5).map((candidate, index) => (
                          <label key={`${business.id}-candidate-${candidate.url}`} className="flex items-start gap-2 rounded border border-ink/10 bg-white p-2 text-sm">
                            <input type="radio" name="selected_image_candidate" value={candidate.url} className="mt-1 border-ink/30 text-coral" />
                            <span className="min-w-0">
                              <span className="block font-semibold">Candidata {index + 1} · {candidate.field ?? candidate.source ?? "official_website"}</span>
                              <a href={candidate.url} target="_blank" rel="noreferrer" className="block break-all text-coral">{candidate.url}</a>
                            </span>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  ) : null}
                </div>

                <div className="grid gap-3">
                  <label className="text-sm font-semibold">
                    Editorial description
                    <textarea name="editorial_description" defaultValue={business.editorial_description ?? ""} className="mt-1 min-h-24 w-full rounded-md border-ink/20 text-sm" />
                  </label>
                  <label className="text-sm font-semibold">
                    AI description
                    <textarea name="ai_description" defaultValue={business.ai_description ?? ""} className="mt-1 min-h-24 w-full rounded-md border-ink/20 text-sm" />
                  </label>
                  <div className="flex justify-end">
                    <button type="submit" className="rounded-md bg-coral px-4 py-2 text-sm font-semibold text-white">Guardar</button>
                  </div>
                </div>
              </div>
            </form>
          ))}
        </div>
      </div>
    </main>
  );
}
