"use client";

import { useMemo } from "react";

type Locale = "es" | "en" | "de";

type HoursRange = {
  start: number;
  end: number;
  closeLabel: string;
};

type HoursRow = {
  dayIndex: number;
  day: string;
  time: string;
  closed: boolean;
  open24h: boolean;
  ranges: HoursRange[];
};

const DAY_LABELS: Record<Locale, string[]> = {
  es: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  de: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"]
};

const DAY_INDEX: Record<string, number> = {
  sunday: 0,
  domingo: 0,
  sonntag: 0,
  monday: 1,
  lunes: 1,
  montag: 1,
  tuesday: 2,
  martes: 2,
  dienstag: 2,
  wednesday: 3,
  miercoles: 3,
  mittwoch: 3,
  thursday: 4,
  jueves: 4,
  donnerstag: 4,
  friday: 5,
  viernes: 5,
  freitag: 5,
  saturday: 6,
  sabado: 6,
  samstag: 6
};

const COPY: Record<Locale, { title: string; open: string; open24h: string; closed: string; closes: string; opens: string; at: string }> = {
  es: {
    title: "Horario",
    open: "Abierto ahora",
    open24h: "Abierto 24h",
    closed: "Cerrado",
    closes: "cierra a las",
    opens: "abre",
    at: "a las"
  },
  en: {
    title: "Hours",
    open: "Open now",
    open24h: "Open 24h",
    closed: "Closed",
    closes: "closes at",
    opens: "opens",
    at: "at"
  },
  de: {
    title: "Öffnungszeiten",
    open: "Jetzt geöffnet",
    open24h: "24 Std. geöffnet",
    closed: "Geschlossen",
    closes: "schließt um",
    opens: "öffnet",
    at: "um"
  }
};

function getLocale(locale: string): Locale {
  return locale === "en" || locale === "de" ? locale : "es";
}

function normalizeDay(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function isOpen24h(time: string) {
  return /open\s*24\s*hours|24\s*hours|abierto\s*24\s*h(?:oras)?|24\s*h|24\/7|0:00\s*[-–]\s*24:00|00:00\s*[-–]\s*24:00/i.test(time);
}

function parseTime(value: string) {
  const trimmed = value.trim().replace(/\s+/g, " ");
  const twelveHour = trimmed.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (twelveHour) {
    let hours = Number(twelveHour[1]);
    const minutes = Number(twelveHour[2] ?? 0);
    const period = twelveHour[3].toUpperCase();
    if (period === "AM" && hours === 12) hours = 0;
    if (period === "PM" && hours !== 12) hours += 12;
    return hours * 60 + minutes;
  }

  const twentyFourHour = trimmed.match(/^(\d{1,2})(?::(\d{2}))?$/);
  if (!twentyFourHour) return null;
  const hours = Number(twentyFourHour[1]);
  const minutes = Number(twentyFourHour[2] ?? 0);
  if (hours === 24 && minutes === 0) return 24 * 60;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function displayTime(minutes: number) {
  if (minutes >= 24 * 60) return "24:00";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

function parseRanges(time: string) {
  if (/closed|cerrado|geschlossen/i.test(time)) return [];
  if (isOpen24h(time)) return [{ start: 0, end: 24 * 60, closeLabel: "24:00" }];

  return time
    .split(",")
    .map((part) => part.trim())
    .map((part) => {
      const [startRaw, endRaw] = part.split(/\s*[-–]\s*/);
      const start = parseTime(startRaw ?? "");
      let end = parseTime(endRaw ?? "");
      if (start === null || end === null) return null;
      if (end <= start) end += 24 * 60;
      return { start, end, closeLabel: displayTime(end) };
    })
    .filter((range): range is HoursRange => Boolean(range));
}

function formatDisplayTime(time: string, locale: Locale) {
  const copy = COPY[locale];
  if (/closed|cerrado|geschlossen/i.test(time)) return copy.closed;
  if (isOpen24h(time)) return copy.open24h;
  return time.replace(/\s*[-–]\s*/g, "–");
}

function parseRows(openingHours: string, locale: Locale): HoursRow[] {
  const labels = DAY_LABELS[locale];

  return openingHours
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separator = line.indexOf(":");
      if (separator === -1) return null;

      const rawDay = line.slice(0, separator).trim();
      const time = line.slice(separator + 1).trim().replace(/\s+/g, " ");
      const dayIndex = DAY_INDEX[normalizeDay(rawDay)];
      if (typeof dayIndex !== "number") return null;

      const closed = /closed|cerrado|geschlossen/i.test(time);
      const open24h = isOpen24h(time);

      return {
        dayIndex,
        day: labels[dayIndex],
        time: formatDisplayTime(time, locale),
        closed,
        open24h,
        ranges: parseRanges(time)
      };
    })
    .filter((row): row is HoursRow => Boolean(row));
}

function madridNow() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Madrid",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(new Date());

  const weekday = parts.find((part) => part.type === "weekday")?.value.toLowerCase() ?? "monday";
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);
  return { dayIndex: DAY_INDEX[weekday] ?? 1, minutes: hour * 60 + minute };
}

function getOpenState(rows: HoursRow[], todayIndex: number, nowMinutes: number, locale: Locale) {
  const copy = COPY[locale];
  const ordered = [...rows].sort((a, b) => a.dayIndex - b.dayIndex);
  const today = ordered.find((row) => row.dayIndex === todayIndex);

  if (today?.open24h) return { open: true, text: copy.open24h };

  for (const row of ordered) {
    const dayOffset = (row.dayIndex - todayIndex + 7) % 7;
    for (const range of row.ranges) {
      const start = dayOffset * 24 * 60 + range.start;
      const end = dayOffset * 24 * 60 + range.end;
      if (dayOffset === 0 && nowMinutes >= start && nowMinutes < end) {
        return { open: true, text: `${copy.open} · ${copy.closes} ${range.closeLabel}` };
      }
      if (dayOffset === 0 && nowMinutes < start) {
        return { open: false, text: `${copy.closed} · ${copy.opens} ${copy.at} ${displayTime(range.start)}` };
      }
      if (dayOffset > 0) {
        return { open: false, text: `${copy.closed} · ${copy.opens} ${row.day} ${copy.at} ${displayTime(range.start)}` };
      }
    }
  }

  return today?.closed ? { open: false, text: copy.closed } : null;
}

export function BusinessHours({ openingHours, locale = "es" }: { openingHours?: string; locale?: string }) {
  const data = useMemo(() => {
    if (!openingHours?.trim()) return null;

    const normalizedLocale = getLocale(locale);
    const rows = parseRows(openingHours, normalizedLocale);
    if (!rows.length) return null;

    const now = madridNow();
    const orderedRows = [...rows].sort((a, b) => ((a.dayIndex - now.dayIndex + 7) % 7) - ((b.dayIndex - now.dayIndex + 7) % 7));
    return { rows: orderedRows, now, locale: normalizedLocale, openState: getOpenState(rows, now.dayIndex, now.minutes, normalizedLocale) };
  }, [openingHours, locale]);

  if (!data) return null;
  const c = COPY[data.locale];

  return (
    <section className="border-b border-linen py-6">
      <p className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink">{c.title}</p>
      {data.openState && (
        <div className={`open-now ${data.openState.open ? "open" : "closed"}`}>
          <span className="dot" aria-hidden="true" />
          {data.openState.text}
        </div>
      )}
      <div className="mt-3">
        {data.rows.map((row) => (
          <div key={row.dayIndex} className={`hours-row ${row.dayIndex === data.now.dayIndex ? "today" : ""}`}>
            <span className="hours-day">{row.day}</span>
            <span className={row.closed ? "hours-time hours-closed" : "hours-time"}>{row.time}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
