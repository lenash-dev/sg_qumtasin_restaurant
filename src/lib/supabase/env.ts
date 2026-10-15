export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

/** `false` mientras no se haya configurado .env.local */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);
