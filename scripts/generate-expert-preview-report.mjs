import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const previews = [
  {
    label: "Abogados, fiscalistas y legal",
    file: "data/expert-previews/english-speaking-lawyers-mallorca.json"
  },
  {
    label: "Arquitectos y reformas",
    file: "data/expert-previews/architects-renovation-mallorca.json"
  },
  {
    label: "Property managers y relocation",
    file: "data/expert-previews/property-managers-mallorca.json"
  },
  {
    label: "Estate agents",
    file: "data/expert-previews/estate-agents-mallorca.json"
  },
  {
    label: "Mortgage brokers",
    file: "data/expert-previews/mortgage-brokers-mallorca.json"
  },
  {
    label: "Doctores en inglés",
    file: "data/expert-previews/english-speaking-doctors-mallorca.json"
  },
  {
    label: "Dentistas en inglés",
    file: "data/expert-previews/english-speaking-dentists-mallorca.json"
  }
];

function argValue(name) {
  const arg = process.argv.slice(2).find((item) => item.startsWith(`--${name}=`));
  return arg ? arg.slice(name.length + 3).trim() : null;
}

function fileWithSuffix(file, suffix) {
  if (!suffix) return file;
  const parsed = path.parse(file);
  return path.join(parsed.dir, `${parsed.name}-${suffix}${parsed.ext}`);
}

function readJson(file) {
  if (!existsSync(file)) return [];
  return JSON.parse(readFileSync(file, "utf8"));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function cleanWebsite(url) {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

const suffix = argValue("suffix");
const groups = previews.map((preview) => ({
  ...preview,
  file: fileWithSuffix(preview.file, suffix),
  rows: readJson(fileWithSuffix(preview.file, suffix))
}));

const total = groups.reduce((sum, group) => sum + group.rows.length, 0);
const generatedAt = new Date().toISOString();

const cards = groups
  .map((group) => {
    const rows = group.rows
      .map((row) => {
        const id = row.google_place_id ?? `${row.vertical_slug}-${row.name}`;
        const types = Array.isArray(row.types) ? row.types.slice(0, 5).join(", ") : "";
        return `
          <article class="card" data-id="${escapeHtml(id)}" data-vertical="${escapeHtml(group.label)}" data-name="${escapeHtml(row.name)}" data-status="unreviewed">
            <div class="card-top">
              <div>
                <p class="vertical">${escapeHtml(group.label)}</p>
                <h2>${escapeHtml(row.name)}</h2>
              </div>
              <div class="score">
                <strong>${escapeHtml(row.rating ?? "-")}</strong>
                <span>${escapeHtml(row.reviews_count ?? 0)} reseñas</span>
              </div>
            </div>
            <dl>
              <div>
                <dt>Dirección</dt>
                <dd>${escapeHtml(row.address)}</dd>
              </div>
              <div>
                <dt>Web</dt>
                <dd><a href="${escapeHtml(row.website)}" target="_blank" rel="noreferrer">${escapeHtml(cleanWebsite(row.website))}</a></dd>
              </div>
              <div>
                <dt>Teléfono</dt>
                <dd>${escapeHtml(row.phone)}</dd>
              </div>
              <div>
                <dt>Tipo Google</dt>
                <dd>${escapeHtml(row.primary_type)} · ${escapeHtml(types)}</dd>
              </div>
              <div>
                <dt>Búsqueda origen</dt>
                <dd>${escapeHtml(row.source_query)}</dd>
              </div>
            </dl>
            <div class="links">
              ${row.google_maps_url ? `<a href="${escapeHtml(row.google_maps_url)}" target="_blank" rel="noreferrer">Google Maps</a>` : ""}
              ${row.website ? `<a href="${escapeHtml(row.website)}" target="_blank" rel="noreferrer">Web oficial</a>` : ""}
            </div>
            <div class="review-actions">
              <button type="button" data-choice="yes">Sí</button>
              <button type="button" data-choice="maybe">Duda</button>
              <button type="button" data-choice="no">No</button>
            </div>
            <textarea placeholder="Notas: encaja/no encaja, idiomas, especialidad, duplicado..."></textarea>
          </article>
        `;
      })
      .join("");

    return `
      <section class="group">
        <div class="group-heading">
          <p>${escapeHtml(group.label)}</p>
          <span>${group.rows.length} candidatos</span>
        </div>
        <div class="cards">${rows}</div>
      </section>
    `;
  })
  .join("");

const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Mallorca Verified · Revisión de candidatos Experts</title>
  <style>
    :root {
      --ink: #10253d;
      --muted: #4b5b4d;
      --green: #0e8f72;
      --gold: #c4933f;
      --line: #e7ded0;
      --paper: #fffdf7;
      --cream: #fff8ec;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: linear-gradient(180deg, var(--cream), var(--paper));
      color: var(--ink);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    header {
      position: sticky;
      top: 0;
      z-index: 10;
      border-bottom: 1px solid var(--line);
      background: rgba(255, 253, 247, 0.94);
      backdrop-filter: blur(12px);
      padding: 18px clamp(18px, 4vw, 48px);
    }
    h1 {
      margin: 0;
      font-family: Georgia, "Times New Roman", serif;
      font-size: clamp(32px, 5vw, 58px);
      line-height: 0.98;
    }
    .sub {
      margin: 10px 0 0;
      color: var(--muted);
      line-height: 1.6;
      max-width: 980px;
    }
    .toolbar {
      display: grid;
      gap: 10px;
      grid-template-columns: minmax(180px, 1fr) repeat(4, auto);
      margin-top: 18px;
      align-items: center;
    }
    input, select, textarea {
      border: 1px solid var(--line);
      border-radius: 8px;
      background: white;
      color: var(--ink);
      font: inherit;
    }
    input, select {
      min-height: 42px;
      padding: 0 12px;
    }
    .pill {
      border: 1px solid var(--line);
      border-radius: 999px;
      background: white;
      padding: 10px 14px;
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      cursor: pointer;
    }
    .pill.active {
      border-color: var(--ink);
      background: var(--ink);
      color: white;
    }
    main {
      padding: 28px clamp(18px, 4vw, 48px) 60px;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 12px;
      margin-bottom: 28px;
    }
    .metric {
      border: 1px solid var(--line);
      border-radius: 8px;
      background: white;
      padding: 16px;
    }
    .metric strong {
      display: block;
      color: var(--gold);
      font-family: Georgia, "Times New Roman", serif;
      font-size: 34px;
      line-height: 1;
    }
    .metric span {
      display: block;
      margin-top: 6px;
      color: var(--muted);
      font-size: 11px;
      font-weight: 900;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
    .group { margin-top: 28px; }
    .group-heading {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: end;
      border-bottom: 1px solid var(--line);
      padding-bottom: 10px;
      margin-bottom: 16px;
    }
    .group-heading p {
      margin: 0;
      color: var(--green);
      font-size: 12px;
      font-weight: 900;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }
    .group-heading span { color: var(--muted); font-weight: 800; }
    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
      gap: 16px;
    }
    .card {
      border: 1px solid var(--line);
      border-radius: 8px;
      background: white;
      padding: 18px;
      box-shadow: 0 16px 42px rgba(27, 46, 75, 0.06);
    }
    .card[data-status="yes"] { border-color: var(--green); box-shadow: 0 16px 42px rgba(14, 143, 114, 0.14); }
    .card[data-status="maybe"] { border-color: var(--gold); box-shadow: 0 16px 42px rgba(196, 147, 63, 0.16); }
    .card[data-status="no"] { opacity: 0.62; }
    .card.hidden { display: none; }
    .card-top {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: flex-start;
    }
    .vertical {
      margin: 0 0 6px;
      color: var(--green);
      font-size: 10px;
      font-weight: 900;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
    h2 {
      margin: 0;
      font-size: 22px;
      line-height: 1.08;
    }
    .score {
      flex: 0 0 auto;
      border: 1px solid #f1d3a2;
      border-radius: 999px;
      background: var(--cream);
      padding: 7px 10px;
      text-align: right;
      color: var(--gold);
    }
    .score strong { display: block; font-size: 18px; }
    .score span { display: block; color: var(--muted); font-size: 11px; }
    dl {
      display: grid;
      gap: 10px;
      margin: 18px 0 0;
    }
    dt {
      color: #7a6d5d;
      font-size: 10px;
      font-weight: 900;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
    dd {
      margin: 4px 0 0;
      color: var(--muted);
      font-size: 14px;
      line-height: 1.45;
      overflow-wrap: anywhere;
    }
    a { color: var(--green); font-weight: 800; text-decoration: none; }
    .links, .review-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 16px;
    }
    .links a {
      border: 1px solid var(--line);
      border-radius: 6px;
      padding: 8px 10px;
      font-size: 12px;
    }
    .review-actions button {
      flex: 1;
      min-height: 40px;
      border: 1px solid var(--line);
      border-radius: 6px;
      background: white;
      color: var(--ink);
      font-weight: 900;
      cursor: pointer;
    }
    .review-actions button.active {
      border-color: var(--ink);
      background: var(--ink);
      color: white;
    }
    textarea {
      width: 100%;
      min-height: 76px;
      resize: vertical;
      margin-top: 12px;
      padding: 10px;
      font-size: 13px;
      line-height: 1.45;
    }
    .export {
      margin-top: 18px;
      color: var(--muted);
      font-size: 13px;
      line-height: 1.6;
    }
    @media (max-width: 760px) {
      .toolbar { grid-template-columns: 1fr 1fr; }
      .toolbar input, .toolbar select { grid-column: 1 / -1; }
      .summary { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .cards { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <header>
    <h1>Revisión de candidatos Experts</h1>
    <p class="sub">Generado el ${escapeHtml(generatedAt)}. Estos candidatos vienen de Google Places y todavía no están aprobados para publicar. Revisa encaje, web oficial, idiomas, especialidad real y señales de confianza.</p>
    <div class="toolbar">
      <input id="search" type="search" placeholder="Buscar por nombre, web, dirección..." />
      <select id="vertical">
        <option value="">Todas las verticales</option>
        ${groups.map((group) => `<option value="${escapeHtml(group.label)}">${escapeHtml(group.label)}</option>`).join("")}
      </select>
      <button class="pill active" type="button" data-filter="all">Todos</button>
      <button class="pill" type="button" data-filter="yes">Sí</button>
      <button class="pill" type="button" data-filter="maybe">Duda</button>
      <button class="pill" type="button" data-filter="no">No</button>
    </div>
    <p class="export">Las decisiones se guardan en este navegador con localStorage. Usa “Exportar revisión” para copiar un JSON con tus sí/dudas/no.</p>
    <div class="links">
      <a id="export" href="#">Exportar revisión</a>
      <a id="clear" href="#">Limpiar revisión local</a>
    </div>
  </header>
  <main>
    <section class="summary">
      <div class="metric"><strong>${total}</strong><span>Candidatos</span></div>
      <div class="metric"><strong id="yesCount">0</strong><span>Sí</span></div>
      <div class="metric"><strong id="maybeCount">0</strong><span>Duda</span></div>
      <div class="metric"><strong id="noCount">0</strong><span>No</span></div>
    </section>
    ${cards}
  </main>
  <script>
    const storageKey = "mallorca-verified-expert-review";
    const cards = Array.from(document.querySelectorAll(".card"));
    const state = JSON.parse(localStorage.getItem(storageKey) || "{}");
    let activeFilter = "all";

    function save() {
      localStorage.setItem(storageKey, JSON.stringify(state));
    }

    function applyState(card) {
      const id = card.dataset.id;
      const item = state[id] || {};
      const status = item.status || "unreviewed";
      card.dataset.status = status;
      card.querySelector("textarea").value = item.note || "";
      card.querySelectorAll("[data-choice]").forEach((button) => {
        button.classList.toggle("active", button.dataset.choice === status);
      });
    }

    function updateCounts() {
      const values = Object.values(state);
      document.getElementById("yesCount").textContent = values.filter((item) => item.status === "yes").length;
      document.getElementById("maybeCount").textContent = values.filter((item) => item.status === "maybe").length;
      document.getElementById("noCount").textContent = values.filter((item) => item.status === "no").length;
    }

    function filterCards() {
      const term = document.getElementById("search").value.trim().toLowerCase();
      const vertical = document.getElementById("vertical").value;
      for (const card of cards) {
        const status = card.dataset.status;
        const matchesStatus = activeFilter === "all" || status === activeFilter;
        const matchesVertical = !vertical || card.dataset.vertical === vertical;
        const matchesTerm = !term || card.textContent.toLowerCase().includes(term);
        card.classList.toggle("hidden", !(matchesStatus && matchesVertical && matchesTerm));
      }
    }

    cards.forEach((card) => {
      applyState(card);
      card.querySelectorAll("[data-choice]").forEach((button) => {
        button.addEventListener("click", () => {
          const id = card.dataset.id;
          state[id] = state[id] || {};
          state[id].status = button.dataset.choice;
          state[id].name = card.dataset.name;
          state[id].vertical = card.dataset.vertical;
          state[id].note = card.querySelector("textarea").value;
          applyState(card);
          save();
          updateCounts();
          filterCards();
        });
      });
      card.querySelector("textarea").addEventListener("input", (event) => {
        const id = card.dataset.id;
        state[id] = state[id] || {};
        state[id].name = card.dataset.name;
        state[id].vertical = card.dataset.vertical;
        state[id].status = card.dataset.status === "unreviewed" ? undefined : card.dataset.status;
        state[id].note = event.target.value;
        save();
      });
    });

    document.querySelectorAll("[data-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        activeFilter = button.dataset.filter;
        document.querySelectorAll("[data-filter]").forEach((item) => item.classList.toggle("active", item === button));
        filterCards();
      });
    });
    document.getElementById("search").addEventListener("input", filterCards);
    document.getElementById("vertical").addEventListener("change", filterCards);
    document.getElementById("export").addEventListener("click", (event) => {
      event.preventDefault();
      const reviewed = Object.entries(state)
        .filter(([, item]) => item.status || item.note)
        .map(([id, item]) => ({ id, ...item }));
      navigator.clipboard.writeText(JSON.stringify(reviewed, null, 2));
      alert("Revisión copiada al portapapeles.");
    });
    document.getElementById("clear").addEventListener("click", (event) => {
      event.preventDefault();
      if (!confirm("¿Limpiar todas las decisiones guardadas en este navegador?")) return;
      localStorage.removeItem(storageKey);
      location.reload();
    });
    updateCounts();
    filterCards();
  </script>
</body>
</html>`;

mkdirSync("reports", { recursive: true });
const reportFile = path.join("reports", `expert-candidates-review${suffix ? `-${suffix}` : ""}.html`);
writeFileSync(reportFile, html, "utf8");
console.log(`Wrote ${reportFile}`);
