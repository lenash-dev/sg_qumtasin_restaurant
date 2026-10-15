import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Enums } from "@/lib/supabase/database.types";

export type MealService = Enums<"meal_service">;

const byPosition = <T extends { position: number }>(a: T, b: T) => a.position - b.position;

/** Menú de una fecha y servicio con sus categorías y platos, ordenados. */
export async function getDailyMenu(date: string, service: MealService) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("daily_menus")
    .select(
      `id, menu_date, service, published, notes, updated_at,
       sections:daily_menu_sections (
         id, price, note, position, category_id,
         category:menu_categories ( id, name ),
         items:daily_menu_items (
           id, price, sold_out, position, dish_id,
           dish:dishes ( id, name, price, tags, active )
         )
       )`,
    )
    .eq("menu_date", date)
    .eq("service", service)
    .maybeSingle();
  if (error) throw new Error(`No se pudo cargar el menú: ${error.message}`);
  if (!data) return null;

  return {
    ...data,
    sections: [...data.sections].sort(byPosition).map((section) => ({ ...section, items: [...section.items].sort(byPosition) })),
  };
}

export type DailyMenu = NonNullable<Awaited<ReturnType<typeof getDailyMenu>>>;

/** Estado de los tres servicios de una fecha (para pestañas y panel). */
export async function getMenuStatusByService(date: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("daily_menus")
    .select("service, published, sections:daily_menu_sections ( items:daily_menu_items ( id ) )")
    .eq("menu_date", date);
  if (error) throw new Error(`No se pudo cargar el estado del menú: ${error.message}`);

  const status: Record<MealService, { state: "none" | "draft" | "published"; dishes: number }> = {
    desayuno: { state: "none", dishes: 0 },
    almuerzo: { state: "none", dishes: 0 },
    cena: { state: "none", dishes: 0 },
  };
  for (const menu of data) {
    const dishes = menu.sections.reduce((total, section) => total + section.items.length, 0);
    status[menu.service] = { state: menu.published ? "published" : "draft", dishes };
  }
  return status;
}

export async function getCategoriesForService(service: MealService) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("menu_categories")
    .select("id, name, description, position")
    .eq("service", service)
    .eq("active", true)
    .order("position")
    .order("name");
  if (error) throw new Error(`No se pudieron cargar las categorías: ${error.message}`);
  return data;
}

export async function getActiveDishes() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("dishes").select("id, name, price").eq("active", true).order("name");
  if (error) throw new Error(`No se pudieron cargar los platos: ${error.message}`);
  return data;
}
