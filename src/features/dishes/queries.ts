import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function listDishes({ search, status }: { search?: string; status?: "activos" | "inactivos" | "todos" }) {
  const supabase = await createClient();
  let query = supabase.from("dishes").select("id, name, description, price, tags, featured, active").order("name");
  if (status !== "todos") query = query.eq("active", status !== "inactivos");
  if (search) query = query.ilike("name", `%${search.replace(/[%_]/g, "")}%`);
  const { data, error } = await query;
  if (error) throw new Error(`No se pudieron cargar los platos: ${error.message}`);
  return data;
}

export async function getDish(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("dishes").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`No se pudo cargar el plato: ${error.message}`);
  return data;
}
