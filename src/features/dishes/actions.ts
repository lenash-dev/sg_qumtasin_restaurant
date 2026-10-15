"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { dbError, describeDbError, validationError, type ActionState } from "@/lib/actions";
import { createClient } from "@/lib/supabase/server";
import { formBool, formText } from "@/lib/utils";
import { revalidateWebsite } from "@/lib/website";

const tagIds = ["popular", "picante", "vegetariano", "para-compartir", "de-la-casa"] as const;

const dishSchema = z.object({
  name: z.string().trim().min(2, "Escribe el nombre del plato.").max(80, "Máximo 80 caracteres."),
  description: z.string().trim().max(300, "Máximo 300 caracteres."),
  price: z.coerce.number("Escribe el precio.").min(0, "El precio no puede ser negativo.").max(10000, "Precio demasiado alto."),
  tags: z.array(z.enum(tagIds)),
  featured: z.boolean(),
  active: z.boolean(),
  image_url: z.union([z.literal(""), z.url("Escribe un enlace válido (https://…).")]),
});

export async function saveDish(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireUser();
  const id = formText(formData, "id");
  const parsed = dishSchema.safeParse({
    name: formData.get("name") ?? "",
    description: formData.get("description") ?? "",
    price: formText(formData, "price") ?? undefined,
    tags: formData.getAll("tags"),
    featured: formBool(formData, "featured"),
    active: formBool(formData, "active"),
    image_url: formText(formData, "image_url") ?? "",
  });
  if (!parsed.success) return validationError(parsed.error);

  const values = { ...parsed.data, image_url: parsed.data.image_url || null };
  const supabase = await createClient();
  const { error } = id ? await supabase.from("dishes").update(values).eq("id", id) : await supabase.from("dishes").insert(values);
  if (error) return dbError(error);

  revalidatePath("/platos");
  revalidatePath("/menu-del-dia");
  revalidateWebsite(["menu"]);
  redirect("/platos");
}

export async function deleteDish(formData: FormData) {
  await requireUser();
  const id = z.uuid().parse(formData.get("id"));
  const supabase = await createClient();
  const { error } = await supabase.from("dishes").delete().eq("id", id);
  if (error) {
    throw new Error(
      error.code === "23503" ? "Este plato aparece en algún menú del día. Desactívalo en lugar de eliminarlo." : describeDbError(error),
    );
  }
  revalidatePath("/platos");
  redirect("/platos");
}
