"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { dbError, describeDbError, validationError, type ActionState } from "@/lib/actions";
import { createClient } from "@/lib/supabase/server";
import { formBool, formText } from "@/lib/utils";
import { revalidateWebsite } from "@/lib/website";

const categorySchema = z.object({
  service: z.enum(["desayuno", "almuerzo", "cena"], "Elige el servicio."),
  name: z.string().trim().min(2, "Escribe el nombre.").max(60, "Máximo 60 caracteres."),
  description: z.string().trim().max(200, "Máximo 200 caracteres."),
  position: z.coerce.number().int().min(0).max(999),
});

function done() {
  revalidatePath("/categorias");
  revalidatePath("/menu-del-dia");
  revalidateWebsite(["menu"]);
}

export async function createCategory(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireUser();
  const parsed = categorySchema.safeParse({
    service: formData.get("service"),
    name: formData.get("name") ?? "",
    description: formData.get("description") ?? "",
    position: formText(formData, "position") ?? 0,
  });
  if (!parsed.success) return validationError(parsed.error);

  const supabase = await createClient();
  const { error } = await supabase.from("menu_categories").insert({ ...parsed.data, description: parsed.data.description || null });
  if (error) return error.code === "23505" ? { status: "error", message: "Ya existe una categoría con ese nombre en ese servicio." } : dbError(error);
  done();
  return { status: "success", message: "Categoría creada." };
}

export async function updateCategory(formData: FormData) {
  await requireUser();
  const id = z.uuid().parse(formData.get("id"));
  const parsed = categorySchema.omit({ service: true }).safeParse({
    name: formData.get("name") ?? "",
    description: formData.get("description") ?? "",
    position: formText(formData, "position") ?? 0,
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Datos no válidos.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("menu_categories")
    .update({ ...parsed.data, description: parsed.data.description || null, active: formBool(formData, "active") })
    .eq("id", id);
  if (error) throw new Error(describeDbError(error));
  done();
}

export async function deleteCategory(formData: FormData) {
  await requireUser();
  const id = z.uuid().parse(formData.get("id"));
  const supabase = await createClient();
  const { error } = await supabase.from("menu_categories").delete().eq("id", id);
  if (error) {
    throw new Error(
      error.code === "23503" ? "La categoría se usó en algún menú del día. Desactívala en lugar de eliminarla." : describeDbError(error),
    );
  }
  done();
}
