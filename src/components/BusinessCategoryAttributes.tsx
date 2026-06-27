import type { AnyCategoryAttributes, BusinessCategory } from "@/types/business";

type FieldConfig = {
  key: string;
  label: string;
  presentation?: "chips" | "text";
};

const titleByCategory: Partial<Record<BusinessCategory, string>> = {
  restaurant: "Mesa y ambiente",
  hotel: "Estancia y servicios",
  "beach-club": "Plan y ambiente",
  "boat-rental": "La experiencia en barco",
  activity: "La actividad",
  beach: "La playa"
};

const fieldConfigs: Partial<Record<BusinessCategory, FieldConfig[]>> = {
  restaurant: [
    { key: "cuisine_types", label: "Tipo de cocina" },
    { key: "signature_items", label: "Platos destacados" },
    { key: "atmosphere_tags", label: "Ambiente" },
    { key: "reservation_notes", label: "Reservas" },
    { key: "dietary_notes", label: "Opciones especiales" },
    { key: "best_for", label: "Encaja para" }
  ],
  hotel: [
    { key: "stay_type", label: "Tipo de estancia" },
    { key: "amenities", label: "Servicios del hotel" },
    { key: "room_notes", label: "Habitaciones", presentation: "text" },
    { key: "food_board_notes", label: "Comida y r\u00e9gimen", presentation: "text" },
    { key: "family_friendliness", label: "Familias", presentation: "text" },
    { key: "location_strengths", label: "Ubicaci\u00f3n" },
    { key: "best_for", label: "Encaja para" }
  ],
  "beach-club": [
    { key: "setting", label: "Entorno" },
    { key: "food_drink_highlights", label: "Comida y bebida" },
    { key: "daybed_or_pool_facilities", label: "Tumbonas y piscina" },
    { key: "music_vibe", label: "M\u00fasica" },
    { key: "access_to_sea", label: "Acceso al mar" },
    { key: "atmosphere_tags", label: "Ambiente" },
    { key: "reservation_notes", label: "Reservas" },
    { key: "best_for", label: "Encaja para" }
  ],
  "boat-rental": [
    { key: "experience_type", label: "Tipo de salida" },
    { key: "guided_or_skippered", label: "Patr\u00f3n y gu\u00eda" },
    { key: "duration_notes", label: "Duraci\u00f3n" },
    { key: "route_or_stops", label: "Ruta y paradas" },
    { key: "included_extras", label: "Incluye" },
    { key: "safety_or_accessibility_notes", label: "Acceso y seguridad" },
    { key: "group_fit", label: "Tipo de grupo" },
    { key: "best_for", label: "Encaja para" }
  ],
  activity: [
    { key: "activity_type", label: "Tipo de actividad" },
    { key: "main_highlights", label: "Lo principal" },
    { key: "duration_notes", label: "Duraci\u00f3n" },
    { key: "ticket_or_booking_notes", label: "Entradas y reserva" },
    { key: "access_notes", label: "Acceso" },
    { key: "crowd_timing_notes", label: "Afluencia" },
    { key: "guided_experience", label: "Gu\u00eda" },
    { key: "physical_difficulty", label: "Dificultad" },
    { key: "best_for", label: "Encaja para" }
  ],
  beach: [
    { key: "landscape_tags", label: "Paisaje" },
    { key: "water_conditions", label: "Agua" },
    { key: "terrain", label: "Terreno" },
    { key: "crowding", label: "Afluencia" },
    { key: "access_and_parking", label: "Acceso y parking" },
    { key: "facilities", label: "Servicios" },
    { key: "rentals_or_prices", label: "Alquileres" },
    { key: "family_accessibility", label: "Familias y accesibilidad" },
    { key: "nearby_food", label: "Comida cerca" },
    { key: "best_time_notes", label: "Mejor momento" }
  ]
};

const valueLabels: Record<string, string> = {
  party_boat: "Barco con ambiente",
  jet_ski: "Moto de agua",
  private_sailing: "Velero privado",
  charter: "Charter privado",
  boat_tour: "Tour en barco",
  unknown: "Salida en barco",
  good_value: "Buena relaci\u00f3n calidad-precio",
  fair: "Precio equilibrado",
  expensive: "Por encima de la media",
  mixed: "Percepci\u00f3n variable"
};

function normalizeValue(value: unknown) {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  if (typeof value === "string" && value.trim()) return [valueLabels[value] ?? value];
  return [];
}

function displayValues(row: FieldConfig & { values: string[] }) {
  if (row.presentation !== "text") return row.values;
  return row.values.slice(0, 3).map((value) => (value.length > 150 ? `${value.slice(0, 147).trim()}...` : value));
}

export function BusinessCategoryAttributes({ category, attributes }: { category: BusinessCategory; attributes?: AnyCategoryAttributes }) {
  if (!attributes?.data) return null;
  const config = fieldConfigs[category];
  if (!config?.length) return null;
  const data = attributes.data as Record<string, unknown>;
  const rows = config
    .map((field) => ({ ...field, values: normalizeValue(data[field.key]) }))
    .filter((field) => field.values.length > 0);

  if (!rows.length) return null;

  return (
    <section className="mt-10 rounded-md border border-white/[0.10] bg-[#0C1A2E] p-5 shadow-[0_12px_35px_rgba(0,0,0,0.22)]">
      <h2 className="border-b border-borderline pb-3 font-sans text-2xl font-bold leading-tight text-ink sm:text-3xl">
        {titleByCategory[category] ?? "Información útil"}
      </h2>
      <dl className="mt-5 grid gap-4">
        {rows.map((row) => (
          <div key={row.key} className="grid gap-2 text-sm leading-6 text-earth sm:grid-cols-[150px_1fr]">
            <dt className="text-[10px] font-black uppercase tracking-[0.1em] text-[#0A0A0A]">{row.label}</dt>
            {row.presentation === "text" ? (
              <dd className="grid gap-1.5 text-sm leading-6 text-earth">
                {displayValues(row).map((value) => (
                  <p key={value}>{valueLabels[value] ?? value}</p>
                ))}
              </dd>
            ) : (
              <dd className="flex flex-wrap gap-2">
                {row.values.map((value) => (
                  <span key={value} className="rounded-sm border border-borderline bg-paper px-2.5 py-1 text-xs text-ink">
                    {valueLabels[value] ?? value}
                  </span>
                ))}
              </dd>
            )}
          </div>
        ))}
      </dl>
    </section>
  );
}
