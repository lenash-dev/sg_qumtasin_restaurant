"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { dbError, describeDbError, validationError, type ActionState } from "@/lib/actions";
import { isIsoDate } from "@/lib/dates";
import { createClient } from "@/lib/supabase/server";
import { formNumber, formText } from "@/lib/utils";

const statusSchema = z.enum(["pendiente", "confirmada", "sentada", "completada", "cancelada", "no_asistio"]);

const reservationSchema = z.object({
  customer_name: z.string().trim().min(2, "Escribe el nombre.").max(120),
  phone: z.string().trim().min(6, "Escribe un teléfono válido.").max(30),
  email: z.union([z.literal(""), z.email("Correo no válido.")]),
  reservation_date: z.string().refine(isIsoDate, "Elige la fecha."),
  reservation_time: z.string().regex(/^\d{2}:\d{2}$/, "Elige la hora."),
  party_size: z.number("Indica cuántas personas.").int().min(1, "Mínimo 1 persona.").max(60, "Máximo 60 personas."),
  source: z.enum(["telefono", "whatsapp", "local", "web"]),
  table_id: z.union([z.literal(""), z.uuid()]),
  notes: z.string().trim().max(500, "Máximo 500 caracteres."),
});

function done() {
  revalidatePath("/reservas");
  revalidatePath("/");
}

export async function createReservation(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireUser();
  const parsed = reservationSchema.safeParse({
    customer_name: formData.get("customer_name") ?? "",
    phone: formData.get("phone") ?? "",
    email: formText(formData, "email") ?? "",
    reservation_date: formData.get("reservation_date") ?? "",
    reservation_time: formData.get("reservation_time") ?? "",
    party_size: formNumber(formData, "party_size"),
    source: formData.get("source") ?? "telefono",
    table_id: formText(formData, "table_id") ?? "",
    notes: formData.get("notes") ?? "",
  });
  if (!parsed.success) return validationError(parsed.error);

  const { email, table_id, notes, ...rest } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.from("reservations").insert({
    ...rest,
    email: email || null,
    table_id: table_id || null,
    notes: notes || null,
    // Las reservas que registra el personal ya están confirmadas
    status: "confirmada",
  });
  if (error) return dbError(error);
  done();
  return { status: "success", message: `Reserva de ${rest.customer_name} registrada.` };
}

export async function setReservationStatus(formData: FormData) {
  await requireUser();
  const id = z.uuid().parse(formData.get("id"));
  const status = statusSchema.parse(formData.get("status"));
  const supabase = await createClient();
  const { error } = await supabase.from("reservations").update({ status }).eq("id", id);
  if (error) throw new Error(describeDbError(error));
  done();
}

export async function assignTable(formData: FormData) {
  await requireUser();
  const id = z.uuid().parse(formData.get("id"));
  const tableId = formText(formData, "table_id");
  if (tableId !== null) z.uuid().parse(tableId);
  const supabase = await createClient();
  const { error } = await supabase.from("reservations").update({ table_id: tableId }).eq("id", id);
  if (error) throw new Error(describeDbError(error));
  done();
}
