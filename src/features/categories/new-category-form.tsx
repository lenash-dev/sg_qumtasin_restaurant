"use client";

import { useRef } from "react";
import { Plus } from "lucide-react";
import { services } from "@/lib/labels";
import { useActionForm } from "@/lib/use-action-form";
import { Alert } from "@/components/ui/feedback";
import { Field, SubmitButton } from "@/components/ui/form";
import { createCategory } from "./actions";

export function NewCategoryForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const { state, pending, onSubmit, errors } = useActionForm(async (prev, formData) => {
    const result = await createCategory(prev, formData);
    if (result.status === "success") formRef.current?.reset();
    return result;
  });

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="surface mt-8 rounded-3xl p-5 sm:p-6">
      <p className="mb-4 font-display text-2xl uppercase">Nueva categoría</p>
      {state.status === "error" && state.message && <Alert className="mb-4">{state.message}</Alert>}
      <div className="grid gap-4 md:grid-cols-[10rem_minmax(0,1fr)_minmax(0,1.4fr)_6rem_auto] md:items-end">
        <Field label="Servicio" htmlFor="new-service" error={errors.service}>
          <select id="new-service" name="service" defaultValue="almuerzo" className="field">
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Nombre" htmlFor="new-name" error={errors.name}>
          <input id="new-name" name="name" placeholder="Ej. Saludables" maxLength={60} className="field" aria-invalid={!!errors.name} />
        </Field>
        <Field label="Descripción" htmlFor="new-description" error={errors.description}>
          <input id="new-description" name="description" placeholder="Opcional, se ve en la web" maxLength={200} className="field" />
        </Field>
        <Field label="Orden" htmlFor="new-position">
          <input id="new-position" name="position" type="number" min={0} defaultValue={0} className="field" />
        </Field>
        <SubmitButton pending={pending} className="min-h-[2.75rem]" pendingLabel="Creando…">
          <Plus className="size-4" aria-hidden />
          Crear
        </SubmitButton>
      </div>
    </form>
  );
}
