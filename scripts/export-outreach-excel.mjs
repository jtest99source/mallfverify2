import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
}

const sb = createClient(supabaseUrl, supabaseKey);

const CANAL = {
  'restaurant':   'WhatsApp',
  'bar':          'WhatsApp',
  'cafe':         'WhatsApp',
  'nightlife':    'WhatsApp',
  'bakery':       'WhatsApp',
  'spa':          'Mix',
  'gym':          'Email',
  'veterinarian': 'Mix',
  'activity':     'Email',
  'real-estate':  'Email',
  'healthcare':   'Email',
  'car-dealer':   'Email',
  'rent-a-car':   'Email',
  'casino':       'Mix',
};

const CAT_LABEL = {
  'restaurant':   'Restaurante',
  'bar':          'Bar',
  'cafe':         'Cafetería',
  'nightlife':    'Nightlife',
  'bakery':       'Panadería-Pastelería',
  'spa':          'Spa-Masajes',
  'gym':          'Gimnasio-Deporte',
  'veterinarian': 'Veterinario',
  'activity':     'Actividad-Turismo',
  'real-estate':  'Inmobiliaria',
  'healthcare':   'Salud-Clinica',
  'car-dealer':   'Concesionario',
  'rent-a-car':   'Alquiler de coches',
  'casino':       'Casino-Bingo',
};

const CATS = Object.keys(CANAL);

async function run() {
  const wb = XLSX.utils.book_new();
  const allRows = [];

  for (const cat of CATS) {
    const { data, error } = await sb
      .from('businesses')
      .select('name, category, website, phone, rating, reviews_count, area, city')
      .eq('category', cat)
      .eq('status', 'published')
      .order('reviews_count', { ascending: false })
      .limit(30);

    if (error || !data?.length) continue;

    const sheetRows = data.map((b, i) => ({
      '#':            i + 1,
      'Nombre':       b.name,
      'Categoría':    CAT_LABEL[cat] || cat,
      'Zona':         b.area || b.city || '',
      'Rating':       b.rating,
      'Reseñas':      b.reviews_count,
      'Teléfono':     b.phone || '',
      'Web':          b.website || '',
      'Canal':        CANAL[cat],
    }));

    // Hoja por categoría
    const ws = XLSX.utils.json_to_sheet(sheetRows);
    ws['!cols'] = [
      { wch: 4 },   // #
      { wch: 45 },  // Nombre
      { wch: 22 },  // Categoría
      { wch: 22 },  // Zona
      { wch: 7 },   // Rating
      { wch: 9 },   // Reseñas
      { wch: 18 },  // Teléfono
      { wch: 40 },  // Web
      { wch: 12 },  // Canal
    ];
    XLSX.utils.book_append_sheet(wb, ws, CAT_LABEL[cat]?.substring(0, 31) || cat);

    allRows.push(...sheetRows);
  }

  // Hoja resumen con todos
  const wsFull = XLSX.utils.json_to_sheet(allRows);
  wsFull['!cols'] = [
    { wch: 4 }, { wch: 45 }, { wch: 22 }, { wch: 22 },
    { wch: 7 }, { wch: 9 }, { wch: 18 }, { wch: 40 }, { wch: 12 },
  ];
  XLSX.utils.book_append_sheet(wb, wsFull, 'TODOS');

  const outPath = 'reports/outreach-top30-por-categoria.xlsx';
  XLSX.writeFile(wb, outPath);
  console.log(`✅ Excel generado: ${outPath} (${allRows.length} negocios)`);
}

run().catch(console.error);
