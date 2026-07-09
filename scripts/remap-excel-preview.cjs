// Preview: remap Excel businesses to correct DB categories
const xlsx = require('xlsx');

const wb = xlsx.readFile('mallorca_verified_negocios_nuevos (2).xlsx');

function extractPlaceId(url) {
  const m = (url || '').match(/place_id:([A-Za-z0-9_-]+)/);
  return m ? m[1] : null;
}
function toRow(r, cat, note) {
  const pid = extractPlaceId(r['Google Maps URL']);
  const nota = (r['Nota'] || '').toLowerCase();
  if (!pid || nota.includes('excluido') || nota.includes('<4.0')) return null;
  if ((parseFloat(r['Rating']) || 0) < 4.0) return null;
  return { name: r['Nombre'], muni: r['Municipio'], rating: parseFloat(r['Rating']), reviews: parseInt(r['Nº reviews'])||0, place_id: pid, category: cat, note: note||'' };
}

const all = [];
const skip = [];

const DIRECT = {
  'Restaurantes': 'restaurant', 'Hoteles': 'hotel', 'Cafés': 'cafe', 'Bares': 'bar',
  'Panaderías': 'bakery', 'Inmobiliarias': 'real-estate', 'Salud': 'healthcare', 'Veterinarios': 'veterinarian',
};
for (const [sheet, cat] of Object.entries(DIRECT)) {
  const ws = wb.Sheets[sheet];
  if (!ws) continue;
  xlsx.utils.sheet_to_json(ws, { defval: '' }).filter(r => r['Nombre']).forEach(r => { const b = toRow(r, cat); if (b) all.push(b); });
}

const bcWs = wb.Sheets['Beach Clubs'];
if (bcWs) xlsx.utils.sheet_to_json(bcWs, { defval: '' }).filter(r => r['Nombre']).forEach(r => { const b = toRow(r, 'beach-club'); if (b) all.push(b); });

const onWs = wb.Sheets['Ocio nocturno'];
if (onWs) xlsx.utils.sheet_to_json(onWs, { defval: '' }).filter(r => r['Nombre']).forEach(r => { const b = toRow(r, 'nightlife'); if (b) all.push(b); });

const boatWs = wb.Sheets['Boat Charter'];
if (boatWs) xlsx.utils.sheet_to_json(boatWs, { defval: '' }).filter(r => r['Nombre']).forEach(r => { const b = toRow(r, 'boat-rental'); if (b) all.push(b); });

const gymWs = wb.Sheets['Gimnasios'];
if (gymWs) {
  xlsx.utils.sheet_to_json(gymWs, { defval: '' }).filter(r => r['Nombre']).forEach(r => {
    const name = r['Nombre'];
    let cat = 'gym', note = '';
    if (name.includes('Golf')) { cat = 'activity'; note = 'reclasificado de Gimnasios'; }
    else if (name.includes('Aparthotel') || name.includes('Hotel')) { cat = 'hotel'; note = 'reclasificado de Gimnasios'; }
    const b = toRow(r, cat, note);
    if (b) all.push(b);
  });
}

const actMap = {
  'Bodega Ribas': 'activity', 'Bodegas Suau': 'activity', 'Celler Tianna Negre': 'activity',
  'Celler Macià Batle': 'activity', 'Bodegues José L. Ferrer': 'activity',
  'Miquel Oliver Vinyes i Bodegues': 'activity', 'Vins Miquel Gelabert': 'activity',
  'Bodegues Castell Miquel': 'activity', 'Mesquida Mora': 'activity', '4Kilos': 'activity',
  'T Golf Calvia': 'activity', 'Capdepera Golf': 'activity', 'Golf Maioris': 'activity',
  'Club de Golf de Son Servera': 'activity', 'Pula Golf Resort': 'activity',
  'Coves de Campanet': 'activity', 'Jardins d\'Alfàbia': 'activity',
  'Rafa Nadal Museum': 'museum', 'Fundació Miró Mallorca': 'museum',
  'Gordiola (Vidrierías/Museu)': 'museum', 'Museu La Granja d\'Esporles': 'museum',
  'Globus Mallorca Balloons': 'activity', 'Observatorio Astronómico de Mallorca': 'activity',
  'Circuit Mallorca Llucmajor': 'activity', 'Western Water Park': 'activity',
  'Cinesa Festival Park': 'activity',
  'Restaurant & Tafona Son Catiu': 'restaurant',
};

const actWs = wb.Sheets['Actividades'];
if (actWs) {
  xlsx.utils.sheet_to_json(actWs, { defval: '' }).filter(r => r['Nombre']).forEach(r => {
    const name = r['Nombre'];
    const cat = actMap[name];
    if (!cat) { skip.push(name); return; }
    const b = toRow(r, cat, 'reclasificado de Actividades');
    if (b) all.push(b);
  });
}

const byCat = {};
for (const b of all) { if (!byCat[b.category]) byCat[b.category] = []; byCat[b.category].push(b); }

console.log('TOTAL:', all.length, '\n');
for (const [cat, arr] of Object.entries(byCat).sort()) {
  console.log(`[${cat}] ${arr.length}`);
  for (const b of arr) {
    const flag = b.note ? `  <- ${b.note}` : '';
    console.log(`  ${b.rating.toFixed(1)} (${String(b.reviews).padStart(4)}r)  ${b.name} [${b.muni}]${flag}`);
  }
}
if (skip.length) { console.log('\nSIN MAPEO (omitidos):'); skip.forEach(s => console.log(' ', s)); }
