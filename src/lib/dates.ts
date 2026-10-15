/**
 * Fechas en la zona horaria del restaurante. Las fechas se manejan como
 * texto ISO "AAAA-MM-DD" (igual que las columnas `date` de Postgres).
 */
export const TIME_ZONE = "America/La_Paz";

const isoFormatter = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" });

/** Hoy en La Paz. En Server Components, llamar después de `await connection()` o de leer la sesión. */
export function todayIso(now = new Date()) {
  return isoFormatter.format(now);
}

export function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

const toUtcDate = (iso: string) => new Date(`${iso}T00:00:00Z`);

export function addDays(iso: string, days: number) {
  const date = toUtcDate(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** 0 = domingo … 6 = sábado */
export function weekdayOf(iso: string) {
  return toUtcDate(iso).getUTCDay();
}

const longFormatter = new Intl.DateTimeFormat("es-BO", { timeZone: "UTC", weekday: "long", day: "numeric", month: "long" });
const shortFormatter = new Intl.DateTimeFormat("es-BO", { timeZone: "UTC", day: "numeric", month: "short", year: "numeric" });

/** "miércoles, 14 de octubre" */
export function formatLongDate(iso: string) {
  return longFormatter.format(toUtcDate(iso));
}

/** "14 oct 2026" */
export function formatShortDate(iso: string) {
  return shortFormatter.format(toUtcDate(iso));
}

/** "13:00:00" → "13:00" */
export function formatTime(time: string) {
  return time.slice(0, 5);
}

export const weekdayShort = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
