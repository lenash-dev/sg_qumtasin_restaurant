"use client";

import { requestStatus } from "@/lib/labels";
import type { Tables } from "@/lib/supabase/database.types";
import { useActionForm } from "@/lib/use-action-form";
import { Alert } from "@/components/ui/feedback";
import { Field, SubmitButton } from "@/components/ui/form";
import { updateRequest } from "./actions";

export function RequestForm({ request }: { request: Tables<"agreement_requests"> }) {
  const { state, pending, onSubmit, errors } = useActionForm(updateRequest);

  return (
    <form onSubmit={onSubmit} noValidate className="surface space-y-4 rounded-3xl p-5">
      <input type="hidden" name="id" value={request.id} />
      <p className="font-display text-2xl uppercase">Seguimiento</p>
      {state.status === "error" && state.message && <Alert>{state.message}</Alert>}
      {state.status === "success" && state.message && <Alert tone="info">{state.message}</Alert>}
      <Field label="Estado" htmlFor="status">
        <select id="status" name="status" defaultValue={request.status} className="field">
          {Object.entries(requestStatus).map(([value, { label }]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Notas internas" htmlFor="internal_notes" error={errors.internal_notes} hint="Solo las ve el equipo.">
        <textarea
          id="internal_notes"
          name="internal_notes"
          rows={5}
          maxLength={1000}
          defaultValue={request.internal_notes ?? ""}
          placeholder="Llamada, propuesta enviada, precio acordado…"
          className="field resize-none"
        />
      </Field>
      <SubmitButton pending={pending} className="w-full">
        Guardar seguimiento
      </SubmitButton>
    </form>
  );
}
