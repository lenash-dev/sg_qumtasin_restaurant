import type { z } from "zod";

/** Estado que devuelven las Server Actions usadas con `useActionState` */
export type ActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string | undefined>;
};

export const idleState: ActionState = { status: "idle" };

export function validationError(error: z.ZodError): ActionState {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "");
    fieldErrors[key] ??= issue.message;
  }
  return { status: "error", message: "Revisa los campos marcados.", fieldErrors };
}

/** Traduce los errores más comunes de Postgres/Supabase para el personal */
type DbError = { code?: string; message: string };

export function describeDbError(error: DbError) {
  switch (error.code) {
    case "23505":
      return "Ya existe un registro con esos datos.";
    case "23503":
      return "No se puede eliminar porque está en uso. Puedes desactivarlo en su lugar.";
    case "23514":
      return "Algún valor no es válido. Revisa los datos.";
    case "42501":
      return "No tienes permiso para hacer esto.";
    case "P0002":
      return error.message;
    default:
      return `No se pudo guardar: ${error.message}`;
  }
}

export function dbError(error: DbError): ActionState {
  return { status: "error", message: describeDbError(error) };
}
