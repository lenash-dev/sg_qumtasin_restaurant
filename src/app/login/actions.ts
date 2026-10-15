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
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    const message =
      error.code === "invalid_credentials"
        ? "Correo o contraseña incorrectos."
        : error.code === "email_not_confirmed"
          ? "Tu correo aún no está confirmado."
          : "No pudimos iniciar sesión. Intenta de nuevo.";
    return { status: "error", message };
  }
  redirect("/");
}
