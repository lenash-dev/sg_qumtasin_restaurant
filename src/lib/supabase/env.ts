/**
 * URL base del proyecto. Se queda solo con el origen para tolerar que se
 * copie la URL del endpoint REST (…supabase.co/rest/v1/) en lugar de la del
 * proyecto: con esa ruta extra, el inicio de sesión no encuentra Supabase Auth.
 */
function projectUrl(raw: string | undefined) {
  if (!raw) return "";
  try {
    return new URL(raw.trim()).origin;
  } catch {
    return "";
  }
}

export const supabaseUrl = projectUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
export const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "";

/** `false` mientras no se haya configurado .env.local */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);
