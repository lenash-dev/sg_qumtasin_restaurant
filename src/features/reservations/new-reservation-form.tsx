"use client";

import { useRef } from "react";
import { Plus } from "lucide-react";
import { reservationSource } from "@/lib/labels";
import { useActionForm } from "@/lib/use-action-form";
import { Alert } from "@/components/ui/feedback";
import { Field, SubmitButton } from "@/components/ui/form";
import { createReservation } from "./actions";

type TableOption = { id: string; label: string; capacity: number; zone: string | null };

export function NewReservationForm({ date, tables }: { date: string; tables: TableOption[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const { state, pending, onSubmit, errors } = useActionForm(async (prev, formData) => {
    const result = await createReservation(prev, formData);
    if (result.status === "success") formRef.current?.reset();
    return result;
  });

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="surface space-y-4 rounded-3xl p-5">
      <p className="font-display text-2xl uppercase">Nueva reserva</p>
      <p className="-mt-3 text-xs text-cream-300">Para reservas por teléfono, WhatsApp o en el local. Quedan confirmadas.</p>
      {state.status === "error" && state.message && <Alert>{state.message}</Alert>}
      {state.status === "success" && state.message && <Alert tone="info">{state.message}</Alert>}

      <Field label="Nombre" htmlFor="r-name" error={errors.customer_name}>
        <input id="r-name" name="customer_name" autoComplete="off" className="field" aria-invalid={!!errors.customer_name} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Teléfono" htmlFor="r-phone" error={errors.phone}>
          <input id="r-phone" name="phone" type="tel" className="field" aria-invalid={!!errors.phone} />
        </Field>
        <Field label="Personas" htmlFor="r-party" error={errors.party_size}>
          <input id="r-party" name="party_size" type="number" min={1} max={60} defaultValue={2} className="field" />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Fecha" htmlFor="r-date" error={errors.reservation_date}>
          <input id="r-date" name="reservation_date" type="date" defaultValue={date} className="field" />
        </Field>
        <Field label="Hora" htmlFor="r-time" error={errors.reservation_time}>
          <input id="r-time" name="reservation_time" type="time" step={900} defaultValue="13:00" className="field" />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Canal" htmlFor="r-source">
          <select id="r-source" name="source" defaultValue="telefono" className="field">
            {(["telefono", "whatsapp", "local"] as const).map((source) => (
              <option key={source} value={source}>
                {reservationSource[source]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Mesa" htmlFor="r-table">
          <select id="r-table" name="table_id" defaultValue="" className="field">
            <option value="">Sin asignar</option>
            {tables.map((table) => (
              <option key={table.id} value={table.id}>
                {table.label} · {table.capacity} pers.
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Correo" htmlFor="r-email" error={errors.email} hint="Opcional.">
        <input id="r-email" name="email" type="email" className="field" />
      </Field>
      <Field label="Notas" htmlFor="r-notes" error={errors.notes}>
        <textarea id="r-notes" name="notes" rows={2} maxLength={500} placeholder="Cumpleaños, silla de bebé…" className="field resize-none" />
      </Field>
      <SubmitButton pending={pending} className="w-full" pendingLabel="Registrando…">
        <Plus className="size-4" aria-hidden />
        Registrar reserva
      </SubmitButton>
    </form>
  );
}
