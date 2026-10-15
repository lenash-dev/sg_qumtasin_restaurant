"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { dbError, validationError, type ActionState } from "@/lib/actions";
import { isIsoDate } from "@/lib/dates";
import { createClient } from "@/lib/supabase/server";
import { formNumber, formText } from "@/lib/utils";

const requestUpdateSchema = z.object({
  status: z.enum(["nueva", "contactada", "aprobada", "rechazada"]),
  internal_notes: z.string().trim().max(1000, "Máximo 1000 caracteres.").nullable(),
});

export async function updateRequest(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = z.uuid().parse(formData.get("id"));
  const parsed = requestUpdateSchema.safeParse({
    status: formData.get("status"),
    internal_notes: formText(formData, "internal_notes"),
  });
  if (!parsed.success) return validationError(parsed.error);

  const supabase = await createClient();
  const { error } = await supabase.from("agreement_requests").update(parsed.data).eq("id", id);
  if (error) return dbError(error);
  revalidatePath("/convenios");
  revalidatePath("/");
  return { status: "success", message: "Solicitud actualizada." };
}

const agreementSchema = z
  .object({
    company: z.string().trim().min(2, "Escribe el nombre de la empresa.").max(120),
    contact_name: z.string().trim().min(2, "Escribe el nombre de contacto.").max(120),
    email: z.union([z.literal(""), z.email("Correo no válido.")]),
    phone: z.string().trim().max(30),
    period: z.enum(["semanal", "mensual"], "Elige el plan."),
    people: z.number("Indica cuántas personas.").int().min(1, "Mínimo 1 persona."),
    price_per_person: z.number("Indica el precio.").min(0, "No puede ser negativo."),
    services: z.array(z.enum(["desayuno", "almuerzo", "cena"])).min(1, "Elige al menos un servicio."),
    starts_on: z.string().refine(isIsoDate, "Elige la fecha de inicio."),
    ends_on: z.string().nullable().refine((v) => v === null || isIsoDate(v), "Fecha no válida."),
    status: z.enum(["activo", "pausado", "finalizado"]),
    notes: z.string().trim().max(1000).nullable(),
  })
  .refine((a) => !a.ends_on || a.ends_on >= a.starts_on, { path: ["ends_on"], message: "Debe ser posterior al inicio." });

export async function saveAgreement(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = formText(formData, "id");
  const requestId = formText(formData, "request_id");
  const parsed = agreementSchema.safeParse({
    company: formData.get("company") ?? "",
    contact_name: formData.get("contact_name") ?? "",
    email: formText(formData, "email") ?? "",
    phone: formData.get("phone") ?? "",
    period: formData.get("period"),
    people: formNumber(formData, "people"),
    price_per_person: formNumber(formData, "price_per_person"),
    services: formData.getAll("services"),
    starts_on: formData.get("starts_on") ?? "",
    ends_on: formText(formData, "ends_on"),
    status: formData.get("status") ?? "activo",
    notes: formText(formData, "notes"),
  });
  if (!parsed.success) return validationError(parsed.error);

  const values = { ...parsed.data, email: parsed.data.email || null, phone: parsed.data.phone || null };
  const supabase = await createClient();

  if (id) {
    const { error } = await supabase.from("agreements").update(values).eq("id", id);
    if (error) return dbError(error);
  } else {
    const { error } = await supabase.from("agreements").insert({ ...values, request_id: requestId });
    if (error) return dbError(error);
    // La solicitud que originó el convenio queda aprobada
    if (requestId) await supabase.from("agreement_requests").update({ status: "aprobada" }).eq("id", requestId);
  }

  revalidatePath("/convenios");
  revalidatePath("/");
  redirect("/convenios?vista=convenios");
}
