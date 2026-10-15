export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

const NBSP = " ";

export function formatPrice(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";
  return `Bs${NBSP}${Number(value).toLocaleString("es-BO", { maximumFractionDigits: 2 })}`;
}

/** Lee un texto de FormData, recortado. `null` si viene vacío. */
export function formText(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

/** Lee un número de FormData. `null` si viene vacío o no es número. */
export function formNumber(formData: FormData, key: string) {
  const text = formText(formData, key);
  if (text === null) return null;
  const value = Number(text.replace(",", "."));
  return Number.isFinite(value) ? value : null;
}

export function formBool(formData: FormData, key: string) {
  const value = formData.get(key);
  return value === "on" || value === "true" || value === "1";
}
