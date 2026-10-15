"use client";

import { weekdayShort } from "@/lib/dates";
import type { Tables } from "@/lib/supabase/database.types";
import { useActionForm } from "@/lib/use-action-form";
import { ButtonLink } from "@/components/ui/button";
import { Alert } from "@/components/ui/feedback";
import { Checkbox, Field, SubmitButton } from "@/components/ui/form";
import { savePromotion } from "./actions";

const weekOrder = [1, 2, 3, 4, 5, 6, 0];

export function PromotionForm({ promotion }: { promotion?: Tables<"promotions"> }) {
  const { state, pending, onSubmit, errors } = useActionForm(savePromotion);
  const p = promotion;

  return (
    <form onSubmit={onSubmit} noValidate className="surface mt-8 max-w-4xl space-y-6 rounded-3xl p-6 sm:p-8">
      {p && <input type="hidden" name="id" value={p.id} />}
      {state.status === "error" && state.message && <Alert>{state.message}</Alert>}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Título" htmlFor="title" error={errors.title}>
          <input id="title" name="title" defaultValue={p?.title} maxLength={80} className="field" aria-invalid={!!errors.title} />
        </Field>
        <Field label="Antetítulo" htmlFor="kicker" error={errors.kicker} hint="Ej. «De lunes a viernes» o «Para dos».">
          <input id="kicker" name="kicker" defaultValue={p?.kicker} maxLength={60} className="field" />
        </Field>
      </div>

      <Field label="Descripción" htmlFor="description" error={errors.description}>
        <textarea id="description" name="description" rows={2} maxLength={300} defaultValue={p?.description} className="field resize-none" />
      </Field>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Precio (Bs)" htmlFor="price" error={errors.price}>
          <input id="price" name="price" type="number" min={0} step="0.5" defaultValue={p?.price ?? ""} className="field" aria-invalid={!!errors.price} />
        </Field>
        <Field label="O un texto en lugar de precio" htmlFor="price_label" error={errors.price_label} hint="Ej. «2x1», «Postre gratis».">
          <input id="price_label" name="price_label" defaultValue={p?.price_label ?? ""} maxLength={40} className="field" />
        </Field>
        <Field label="Horario" htmlFor="time_label" error={errors.time_label} hint="Opcional. Ej. «12:00 – 15:00».">
          <input id="time_label" name="time_label" defaultValue={p?.time_label ?? ""} maxLength={40} className="field" />
        </Field>
      </div>

      <fieldset>
        <legend className="mb-2 text-[0.7rem] font-bold tracking-[0.14em] text-cream-200 uppercase">Días</legend>
        <div className="flex flex-wrap gap-2">
          {weekOrder.map((day) => (
            <label
              key={day}
              className="cursor-pointer rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-cream-50/15 transition-colors select-none has-checked:bg-cream-50 has-checked:text-wine-900"
            >
              <input type="checkbox" name="days" value={day} defaultChecked={p?.days?.includes(day) ?? false} className="sr-only" />
              {weekdayShort[day]}
            </label>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-cream-300/80">Sin días marcados = todos los días.</p>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Incluye" htmlFor="includes" error={errors.includes} hint="Un elemento por línea (máximo 8).">
          <textarea id="includes" name="includes" rows={4} defaultValue={p?.includes.join("\n")} className="field resize-none" />
        </Field>
        <Field label="Condiciones" htmlFor="terms" error={errors.terms} hint="Opcional, se muestra en letra pequeña.">
          <textarea id="terms" name="terms" rows={4} maxLength={200} defaultValue={p?.terms ?? ""} className="field resize-none" />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Desde" htmlFor="starts_on" error={errors.starts_on} hint="Opcional.">
          <input id="starts_on" name="starts_on" type="date" defaultValue={p?.starts_on ?? ""} className="field" />
        </Field>
        <Field label="Hasta" htmlFor="ends_on" error={errors.ends_on} hint="Opcional.">
          <input id="ends_on" name="ends_on" type="date" defaultValue={p?.ends_on ?? ""} className="field" />
        </Field>
        <Field label="Orden" htmlFor="position" hint="Menor = aparece primero.">
          <input id="position" name="position" type="number" min={0} defaultValue={p?.position ?? 0} className="field" />
        </Field>
      </div>

      <div className="flex flex-wrap gap-6 border-t border-cream-50/10 pt-5">
        <Checkbox name="active" label="Activa (visible en la web)" defaultChecked={p?.active ?? true} />
        <Checkbox name="highlight" label="Destacada (tarjeta grande)" defaultChecked={p?.highlight ?? false} />
      </div>

      <div className="flex flex-wrap gap-3">
        <SubmitButton pending={pending}>{p ? "Guardar cambios" : "Crear promoción"}</SubmitButton>
        <ButtonLink href="/promociones" variant="ghost">
          Cancelar
        </ButtonLink>
      </div>
    </form>
  );
}
