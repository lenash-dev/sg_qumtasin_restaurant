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
 * Distingue "sin sesión" de "con sesión pero sin perfil" (usuario creado
 * antes de instalar el esquema, o al que se le quitó el acceso).
 * `cache` evita repetir la consulta dentro de una misma petición.
 */
const getAuthState = cache(async (): Promise<{ signedIn: false } | { signedIn: true; user: CurrentUser | null }> => {
  if (!isSupabaseConfigured) return { signedIn: false };
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return { signedIn: false };

  const { data: profile } = await supabase.from("profiles").select("full_name, role").eq("id", claims.sub).maybeSingle();
  if (!profile) return { signedIn: true, user: null };

  const email = typeof claims.email === "string" ? claims.email : "";
  return { signedIn: true, user: { id: claims.sub, name: profile.full_name || email, email, role: profile.role } };
});

export async function getCurrentUser() {
  const state = await getAuthState();
  return state.signedIn ? state.user : null;
}

export async function requireUser() {
  const state = await getAuthState();
  if (!state.signedIn) redirect("/login");
  // Con sesión pero sin perfil: mandarlo al login crearía un bucle (el proxy lo
  // devuelve al panel). Se le explica qué falta.
  if (!state.user) redirect("/sin-acceso");
  return state.user;
}

/** Para páginas y acciones exclusivas del administrador */
export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/?acceso=denegado");
  return user;
}
