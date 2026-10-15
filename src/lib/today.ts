import "server-only";
import { connection } from "next/server";
import { todayIso } from "./dates";

/** Fecha de hoy calculada en cada petición (nunca en el prerender). */
export async function getToday() {
  await connection();
  return todayIso();
}
