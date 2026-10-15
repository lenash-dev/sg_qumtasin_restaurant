import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Enums } from "@/lib/supabase/database.types";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: Enums<"app_role">;
};

/**
 * Capa de acceso a datos: único lugar donde se lee la sesión.
 * `cache` evita repetir la consulta dentro de una misma petición.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;

  const { data: profile } = await supabase.from("profiles").select("full_name, role").eq("id", claims.sub).maybeSingle();
  if (!profile) return null;

  const email = typeof claims.email === "string" ? claims.email : "";
  return { id: claims.sub, name: profile.full_name || email, email, role: profile.role };
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Para páginas y acciones exclusivas del administrador */
export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/?acceso=denegado");
  return user;
}
