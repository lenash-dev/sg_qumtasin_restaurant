"use client";

import { useRef } from "react";
import { Plus } from "lucide-react";
import { useActionForm } from "@/lib/use-action-form";
import { Alert } from "@/components/ui/feedback";
import { Field, SubmitButton } from "@/components/ui/form";
import { createTable } from "./actions";

export function NewTableForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const { state, pending, onSubmit, errors } = useActionForm(async (prev, formData) => {
    const result = await createTable(prev, formData);
    if (result.status === "success") formRef.current?.reset();
    return result;
  });

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="surface mt-8 rounded-3xl p-5 sm:p-6">
      <p className="mb-4 font-display text-2xl uppercase">Nueva mesa</p>
      {state.status === "error" && state.message && <Alert className="mb-4">{state.message}</Alert>}
      <div className="grid gap-4 sm:grid-cols-[8rem_7rem_minmax(0,1fr)_6rem_auto] sm:items-end">
        <Field label="Nombre" htmlFor="t-label" error={errors.label}>
          <input id="t-label" name="label" placeholder="M7" maxLength={20} className="field" aria-invalid={!!errors.label} />
        </Field>
        <Field label="Personas" htmlFor="t-capacity" error={errors.capacity}>
          <input id="t-capacity" name="capacity" type="number" min={1} max={50} defaultValue={4} className="field" />
        </Field>
        <Field label="Zona" htmlFor="t-zone">
          <input id="t-zone" name="zone" placeholder="Salón, Terraza…" maxLength={40} className="field" />
        </Field>
        <Field label="Orden" htmlFor="t-position">
          <input id="t-position" name="position" type="number" min={0} defaultValue={0} className="field" />
        </Field>
        <SubmitButton pending={pending} className="min-h-[2.75rem]" pendingLabel="Creando…">
          <Plus className="size-4" aria-hidden />
          Crear
        </SubmitButton>
      </div>
    </form>
  );
}
