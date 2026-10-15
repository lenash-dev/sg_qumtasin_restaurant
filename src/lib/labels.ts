import type { Enums } from "@/lib/supabase/database.types";

export type Tone = "neutral" | "gold" | "green" | "rose" | "blue" | "muted";

export const services: { id: Enums<"meal_service">; label: string }[] = [
  { id: "desayuno", label: "Desayuno" },
  { id: "almuerzo", label: "Almuerzo" },
  { id: "cena", label: "Cena" },
];

export const serviceLabel = Object.fromEntries(services.map((s) => [s.id, s.label])) as Record<Enums<"meal_service">, string>;

export const reservationStatus: Record<Enums<"reservation_status">, { label: string; tone: Tone }> = {
  pendiente: { label: "Pendiente", tone: "gold" },
  confirmada: { label: "Confirmada", tone: "green" },
  sentada: { label: "En mesa", tone: "blue" },
  completada: { label: "Completada", tone: "muted" },
  cancelada: { label: "Cancelada", tone: "rose" },
  no_asistio: { label: "No asistió", tone: "rose" },
};

export const reservationSource: Record<Enums<"reservation_source">, string> = {
  web: "Página web",
  telefono: "Teléfono",
  whatsapp: "WhatsApp",
  local: "En el local",
};

export const requestStatus: Record<Enums<"request_status">, { label: string; tone: Tone }> = {
  nueva: { label: "Nueva", tone: "gold" },
  contactada: { label: "Contactada", tone: "blue" },
  aprobada: { label: "Aprobada", tone: "green" },
  rechazada: { label: "Rechazada", tone: "rose" },
};

export const requestPlan: Record<Enums<"request_plan">, string> = {
  semanal: "Plan semanal",
  mensual: "Plan mensual",
  evento: "Evento único",
};

export const requestService: Record<string, string> = {
  almuerzos: "Almuerzos corporativos",
  catering: "Catering para eventos",
  "coffee-break": "Coffee break andino",
  convenios: "Convenios y cuentas",
  otro: "Otro / a medida",
};

export const agreementPeriod: Record<Enums<"agreement_period">, string> = {
  semanal: "Semanal",
  mensual: "Mensual",
};

export const agreementStatus: Record<Enums<"agreement_status">, { label: string; tone: Tone }> = {
  activo: { label: "Activo", tone: "green" },
  pausado: { label: "Pausado", tone: "gold" },
  finalizado: { label: "Finalizado", tone: "muted" },
};

export const dishTags = [
  { id: "popular", label: "Popular" },
  { id: "picante", label: "Picante" },
  { id: "vegetariano", label: "Vegetariano" },
  { id: "para-compartir", label: "Para compartir" },
  { id: "de-la-casa", label: "De la casa" },
] as const;

export const dishTagLabel = Object.fromEntries(dishTags.map((t) => [t.id, t.label])) as Record<string, string>;
