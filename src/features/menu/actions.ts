"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { describeDbError } from "@/lib/actions";
import { isIsoDate } from "@/lib/dates";
import { createClient } from "@/lib/supabase/server";
import { formNumber, formText } from "@/lib/utils";
import { revalidateWebsite } from "@/lib/website";

/*
 * Acciones rápidas del editor del menú del día. Se usan directamente como
 * `action` de formularios pequeños: si algo falla lanzan un error que
 * muestra la página de error del panel.
 */

const serviceSchema = z.enum(["desayuno", "almuerzo", "cena"]);
const uuid = z.uuid();

function done() {
  revalidatePath("/menu-del-dia");
  revalidatePath("/");
  revalidateWebsite(["menu"]);
}

function fail(error: { code?: string; message: string }): never {
  throw new Error(describeDbError(error));
}

function readDate(formData: FormData, key: string) {
  const value = formText(formData, key);
  if (!isIsoDate(value)) throw new Error("Fecha no válida.");
  return value;
}

/** Devuelve el id del menú de esa fecha y servicio; lo crea (sin publicar) si no existe. */
async function ensureMenu(date: string, service: z.infer<typeof serviceSchema>) {
  const supabase = await createClient();
  const { data: existing, error: readError } = await supabase
    .from("daily_menus")
    .select("id")
    .eq("menu_date", date)
    .eq("service", service)
    .maybeSingle();
  if (readError) fail(readError);
  if (existing) return existing.id;

  const { data, error } = await supabase.from("daily_menus").insert({ menu_date: date, service }).select("id").single();
  if (error) fail(error);
  return data.id;
}

export async function addSection(formData: FormData) {
  await requireUser();
  const date = readDate(formData, "date");
  const service = serviceSchema.parse(formData.get("service"));
  const categoryId = uuid.parse(formData.get("category_id"));

  const menuId = await ensureMenu(date, service);
  const supabase = await createClient();
  const { count } = await supabase.from("daily_menu_sections").select("id", { count: "exact", head: true }).eq("daily_menu_id", menuId);
  const { error } = await supabase
    .from("daily_menu_sections")
    .insert({ daily_menu_id: menuId, category_id: categoryId, position: (count ?? 0) + 1 });
  if (error) fail(error);
  done();
}

export async function updateSection(formData: FormData) {
  await requireUser();
  const id = uuid.parse(formData.get("section_id"));
  const price = formNumber(formData, "price");
  if (price !== null && price < 0) throw new Error("El precio no puede ser negativo.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("daily_menu_sections")
    .update({ price, note: formText(formData, "note") })
    .eq("id", id);
  if (error) fail(error);
  done();
}

export async function removeSection(formData: FormData) {
  await requireUser();
  const id = uuid.parse(formData.get("section_id"));
  const supabase = await createClient();
  const { error } = await supabase.from("daily_menu_sections").delete().eq("id", id);
  if (error) fail(error);
  done();
}

export async function addItem(formData: FormData) {
  await requireUser();
  const sectionId = uuid.parse(formData.get("section_id"));
  const dishId = uuid.parse(formData.get("dish_id"));
  const price = formNumber(formData, "price");
  if (price !== null && price < 0) throw new Error("El precio no puede ser negativo.");

  const supabase = await createClient();
  const { count } = await supabase.from("daily_menu_items").select("id", { count: "exact", head: true }).eq("section_id", sectionId);
  const { error } = await supabase
    .from("daily_menu_items")
    .insert({ section_id: sectionId, dish_id: dishId, price, position: (count ?? 0) + 1 });
  if (error) fail(error);
  done();
}

export async function updateItemPrice(formData: FormData) {
  await requireUser();
  const id = uuid.parse(formData.get("item_id"));
  const price = formNumber(formData, "price");
  if (price !== null && price < 0) throw new Error("El precio no puede ser negativo.");

  const supabase = await createClient();
  const { error } = await supabase.from("daily_menu_items").update({ price }).eq("id", id);
  if (error) fail(error);
  done();
}

export async function setItemSoldOut(formData: FormData) {
  await requireUser();
  const id = uuid.parse(formData.get("item_id"));
  const soldOut = formData.get("sold_out") === "true";

  const supabase = await createClient();
  const { error } = await supabase.from("daily_menu_items").update({ sold_out: soldOut }).eq("id", id);
  if (error) fail(error);
  done();
}

export async function removeItem(formData: FormData) {
  await requireUser();
  const id = uuid.parse(formData.get("item_id"));
  const supabase = await createClient();
  const { error } = await supabase.from("daily_menu_items").delete().eq("id", id);
  if (error) fail(error);
  done();
}

export async function setPublished(formData: FormData) {
  await requireUser();
  const id = uuid.parse(formData.get("menu_id"));
  const published = formData.get("published") === "true";

  const supabase = await createClient();
  const { error } = await supabase.from("daily_menus").update({ published }).eq("id", id);
  if (error) fail(error);
  done();
}

export async function updateNotes(formData: FormData) {
  await requireUser();
  const id = uuid.parse(formData.get("menu_id"));
  const notes = formText(formData, "notes");
  if (notes && notes.length > 300) throw new Error("La nota puede tener hasta 300 caracteres.");

  const supabase = await createClient();
  const { error } = await supabase.from("daily_menus").update({ notes }).eq("id", id);
  if (error) fail(error);
  done();
}

/** Copia categorías y platos de otro día (queda sin publicar para revisarlo). */
export async function copyMenu(formData: FormData) {
  await requireUser();
  const from = readDate(formData, "from");
  const to = readDate(formData, "to");
  const service = serviceSchema.parse(formData.get("service"));
  if (from === to) throw new Error("Elige un día distinto para copiar.");

  const supabase = await createClient();
  const { error } = await supabase.rpc("copy_daily_menu", { p_from: from, p_to: to, p_service: service });
  if (error) fail(error);
  done();
}
