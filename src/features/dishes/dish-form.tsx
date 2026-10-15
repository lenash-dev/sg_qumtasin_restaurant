"use client";

import { dishTags } from "@/lib/labels";
import type { Tables } from "@/lib/supabase/database.types";
import { useActionForm } from "@/lib/use-action-form";
import { ButtonLink } from "@/components/ui/button";
import { Alert } from "@/components/ui/feedback";
import { Checkbox, Field, SubmitButton } from "@/components/ui/form";
import { saveDish } from "./actions";

export function DishForm({ dish }: { dish?: Tables<"dishes"> }) {
  const { state, pending, onSubmit, errors } = useActionForm(saveDish);

  return (
    <form onSubmit={onSubmit} noValidate className="surface mt-8 max-w-3xl space-y-6 rounded-3xl p-6 sm:p-8">
      {dish && <input type="hidden" name="id" value={dish.id} />}
      {state.status === "error" && state.message && <Alert>{state.message}</Alert>}

      <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_10rem]">
        <Field label="Nombre" htmlFor="name" error={errors.name}>
          <input id="name" name="name" defaultValue={dish?.name} className="field" aria-invalid={!!errors.name} maxLength={80} />
        </Field>
        <Field label="Precio de carta (Bs)" htmlFor="price" error={errors.price}>
          <input
            id="price"
            name="price"
            type="number"
            min={0}
            step="0.5"
            inputMode="decimal"
            defaultValue={dish?.price}
            className="field"
            aria-invalid={!!errors.price}
          />
        </Field>
      </div>

      <Field label="Descripción" htmlFor="description" error={errors.description} hint="Se muestra en la página web.">
        <textarea id="description" name="description" rows={3} maxLength={300} defaultValue={dish?.description} className="field resize-none" />
      </Field>

      <fieldset>
        <legend className="mb-2 text-[0.7rem] font-bold tracking-[0.14em] text-cream-200 uppercase">Etiquetas</legend>
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          {dishTags.map((tag) => (
            <Checkbox key={tag.id} name="tags" value={tag.id} label={tag.label} defaultChecked={dish?.tags.includes(tag.id)} />
          ))}
        </div>
      </fieldset>

      <Field label="Foto (enlace)" htmlFor="image_url" error={errors.image_url} hint="Opcional. Enlace público a la imagen del plato.">
        <input id="image_url" name="image_url" type="url" defaultValue={dish?.image_url ?? ""} placeholder="https://…" className="field" />
      </Field>

      <div className="flex flex-wrap gap-6 border-t border-cream-50/10 pt-5">
        <Checkbox name="active" label="Activo (se puede usar en los menús)" defaultChecked={dish?.active ?? true} />
        <Checkbox name="featured" label="Destacado en la página de inicio" defaultChecked={dish?.featured ?? false} />
      </div>

      <div className="flex flex-wrap gap-3">
        <SubmitButton pending={pending}>{dish ? "Guardar cambios" : "Crear plato"}</SubmitButton>
        <ButtonLink href="/platos" variant="ghost">
          Cancelar
        </ButtonLink>
      </div>
    </form>
  );
}
