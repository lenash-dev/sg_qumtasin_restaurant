"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { dbError, describeDbError, validationError, type ActionState } from "@/lib/actions";
import { createClient } from "@/lib/supabase/server";
import { formBool, formNumber, formText } from "@/lib/utils";

const tableSchema = z.object({
  label: z.string().trim().min(1, "Escribe el nombre de la mesa.").max(20, "Máximo 20 caracteres."),
  capacity: z.number("Indica la capacidad.").int().min(1, "Mínimo 1.").max(50, "Máximo 50."),
  zone: z.string().trim().max(40).nullable(),
  position: z.number().int().min(0).max(999),
});

const read = (formData: FormData) =>
  tableSchema.safeParse({
    label: formData.get("label") ?? "",
    capacity: formNumber(formData, "capacity"),
    zone: formText(formData, "zone"),
    position: formNumber(formData, "position") ?? 0,
  });

function done() {
  revalidatePath("/mesas");
  revalidatePath("/reservas");
}

export async function createTable(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = read(formData);
  if (!parsed.success) return validationError(parsed.error);
  const supabase = await createClient();
  const { error } = await supabase.from("restaurant_tables").insert(parsed.data);
  if (error) return error.code === "23505" ? { status: "error", message: "Ya existe una mesa con ese nombre." } : dbError(error);
  done();
  return { status: "success", message: "Mesa creada." };
}

export async function updateTable(formData: FormData) {
  await requireAdmin();
  const id = z.uuid().parse(formData.get("id"));
  const parsed = read(formData);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Datos no válidos.");
  const supabase = await createClient();
  const { error } = await supabase
    .from("restaurant_tables")
    .update({ ...parsed.data, active: formBool(formData, "active") })
    .eq("id", id);
  if (error) throw new Error(describeDbError(error));
  done();
}

export async function deleteTable(formData: FormData) {
  await requireAdmin();
  const id = z.uuid().parse(formData.get("id"));
  const supabase = await createClient();
  const { error } = await supabase.from("restaurant_tables").delete().eq("id", id);
  if (error) throw new Error(describeDbError(error));
  done();
}
