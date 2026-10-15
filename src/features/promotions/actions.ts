"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { dbError, describeDbError, validationError, type ActionState } from "@/lib/actions";
import { isIsoDate } from "@/lib/dates";
import { createClient } from "@/lib/supabase/server";
import { formBool, formNumber, formText } from "@/lib/utils";
import { revalidateWebsite } from "@/lib/website";

const optionalDate = z.string().nullable().refine((v) => v === null || isIsoDate(v), "Fecha no válida.");

const promotionSchema = z
  .object({
    title: z.string().trim().min(2, "Escribe el título.").max(80, "Máximo 80 caracteres."),
    kicker: z.string().trim().max(60, "Máximo 60 caracteres."),
    description: z.string().trim().max(300, "Máximo 300 caracteres."),
    price: z.number().min(0, "El precio no puede ser negativo.").nullable(),
    price_label: z.string().trim().max(40, "Máximo 40 caracteres.").nullable(),
    days: z.array(z.number().int().min(0).max(6)).nullable(),
    time_label: z.string().trim().max(40, "Máximo 40 caracteres.").nullable(),
    includes: z.array(z.string().max(80)).max(8, "Máximo 8 elementos."),
    terms: z.string().trim().max(200, "Máximo 200 caracteres.").nullable(),
    highlight: z.boolean(),
    active: z.boolean(),
    starts_on: optionalDate,
    ends_on: optionalDate,
    position: z.number().int().min(0).max(999),
  })
  .refine((p) => p.price !== null || p.price_label !== null, { path: ["price"], message: "Escribe un precio o un texto (ej. «2x1»)." })
  .refine((p) => !p.starts_on || !p.ends_on || p.ends_on >= p.starts_on, { path: ["ends_on"], message: "Debe ser posterior al inicio." });

function done() {
  revalidatePath("/promociones");
  revalidatePath("/");
  revalidateWebsite(["promotions"]);
}

export async function savePromotion(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = formText(formData, "id");
  const days = formData.getAll("days").map(Number);
  const parsed = promotionSchema.safeParse({
    title: formData.get("title") ?? "",
    kicker: formData.get("kicker") ?? "",
    description: formData.get("description") ?? "",
    price: formNumber(formData, "price"),
    price_label: formText(formData, "price_label"),
    // Sin días marcados (o los 7) = todos los días
    days: days.length === 0 || days.length === 7 ? null : days.sort(),
    time_label: formText(formData, "time_label"),
    includes: (formText(formData, "includes") ?? "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
    terms: formText(formData, "terms"),
    highlight: formBool(formData, "highlight"),
    active: formBool(formData, "active"),
    starts_on: formText(formData, "starts_on"),
    ends_on: formText(formData, "ends_on"),
    position: formNumber(formData, "position") ?? 0,
  });
  if (!parsed.success) return validationError(parsed.error);

  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("promotions").update(parsed.data).eq("id", id)
    : await supabase.from("promotions").insert(parsed.data);
  if (error) return dbError(error);

  done();
  redirect("/promociones");
}

export async function togglePromotion(formData: FormData) {
  await requireAdmin();
  const id = z.uuid().parse(formData.get("id"));
  const supabase = await createClient();
  const { error } = await supabase
    .from("promotions")
    .update({ active: formData.get("active") === "true" })
    .eq("id", id);
  if (error) throw new Error(describeDbError(error));
  done();
}

export async function deletePromotion(formData: FormData) {
  await requireAdmin();
  const id = z.uuid().parse(formData.get("id"));
  const supabase = await createClient();
  const { error } = await supabase.from("promotions").delete().eq("id", id);
  if (error) throw new Error(describeDbError(error));
  done();
  redirect("/promociones");
}
