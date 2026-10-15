"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { validationError, type ActionState } from "@/lib/actions";

const schema = z.object({
  email: z.string().trim().pipe(z.email("Escribe un correo válido.")),
  password: z.string().min(1, "Escribe tu contraseña."),
});

export async function signIn(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured) {
    return { status: "error", message: "El sistema aún no está conectado a Supabase." };
  }
  const parsed = schema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return validationError(parsed.error);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    if (error.code === "invalid_credentials") return { status: "error", message: "Correo o contraseña incorrectos." };
    if (error.code === "email_not_confirmed") {
      return { status: "error", message: "Tu correo aún no está confirmado. El administrador puede confirmarlo en Supabase (Authentication → Users)." };
    }
    // Errores de configuración (URL o clave): se registran para poder diagnosticarlos
    console.error("[login] Supabase respondió:", error.status, error.code ?? "", error.message);
    return {
      status: "error",
      message:
        error.status === 404 || error.status === 401
          ? "No se pudo conectar con Supabase. Revisa NEXT_PUBLIC_SUPABASE_URL y la clave pública en .env.local."
          : "No pudimos iniciar sesión. Intenta de nuevo.",
    };
  }

  // Sin perfil no hay rol: se cierra la sesión y se explica qué falta
  const { data: profile } = await supabase.from("profiles").select("id").eq("id", data.user.id).maybeSingle();
  if (!profile) {
    await supabase.auth.signOut();
    return {
      status: "error",
      message: "Tu usuario existe pero no tiene acceso al sistema. Un administrador debe crear tu perfil (ver README, paso 2).",
    };
  }
  redirect("/");
}
