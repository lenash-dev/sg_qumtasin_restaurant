"use client";

import { agreementPeriod, agreementStatus, services } from "@/lib/labels";
import type { Tables } from "@/lib/supabase/database.types";
import { useActionForm } from "@/lib/use-action-form";
import { ButtonLink } from "@/components/ui/button";
import { Alert } from "@/components/ui/feedback";
import { Checkbox, Field, SubmitButton } from "@/components/ui/form";
import { saveAgreement } from "./actions";

type Defaults = Partial<Tables<"agreements">>;

export function AgreementForm({ agreement, defaults, requestId }: { agreement?: Tables<"agreements">; defaults?: Defaults; requestId?: string }) {
  const { state, pending, onSubmit, errors } = useActionForm(saveAgreement);
  const a: Defaults = agreement ?? defaults ?? {};

  return (
    <form onSubmit={onSubmit} noValidate className="surface mt-8 max-w-4xl space-y-6 rounded-3xl p-6 sm:p-8">
      {agreement && <input type="hidden" name="id" value={agreement.id} />}
      {requestId && <input type="hidden" name="request_id" value={requestId} />}
      {state.status === "error" && state.message && <Alert>{state.message}</Alert>}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Empresa" htmlFor="company" error={errors.company}>
          <input id="company" name="company" defaultValue={a.company} className="field" aria-invalid={!!errors.company} />
        </Field>
        <Field label="Contacto" htmlFor="contact_name" error={errors.contact_name}>
          <input id="contact_name" name="contact_name" defaultValue={a.contact_name} className="field" aria-invalid={!!errors.contact_name} />
        </Field>
        <Field label="Correo" htmlFor="email" error={errors.email}>
          <input id="email" name="email" type="email" defaultValue={a.email ?? ""} className="field" />
        </Field>
        <Field label="Teléfono" htmlFor="phone" error={errors.phone}>
          <input id="phone" name="phone" type="tel" defaultValue={a.phone ?? ""} className="field" />
        </Field>
      </div>

      <fieldset>
        <legend className="mb-2 text-[0.7rem] font-bold tracking-[0.14em] text-cream-200 uppercase">Plan</legend>
        <div className="flex flex-wrap gap-2">
          {(["semanal", "mensual"] as const).map((period) => (
            <label
              key={period}
              className="cursor-pointer rounded-full px-5 py-2.5 text-sm font-semibold ring-1 ring-cream-50/15 transition-colors select-none has-checked:bg-cream-50 has-checked:text-wine-900"
            >
              <input type="radio" name="period" value={period} defaultChecked={(a.period ?? "mensual") === period} className="sr-only" />
              {agreementPeriod[period]}
            </label>
          ))}
        </div>
        {errors.period && <p className="mt-1 text-xs text-[#ff9dbb]">{errors.period}</p>}
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-4">
        <Field label="Personas" htmlFor="people" error={errors.people}>
          <input id="people" name="people" type="number" min={1} defaultValue={a.people} className="field" aria-invalid={!!errors.people} />
        </Field>
        <Field label="Bs por persona/día" htmlFor="price_per_person" error={errors.price_per_person}>
          <input
            id="price_per_person"
            name="price_per_person"
            type="number"
            min={0}
            step="0.5"
            defaultValue={a.price_per_person}
            className="field"
            aria-invalid={!!errors.price_per_person}
          />
        </Field>
        <Field label="Inicio" htmlFor="starts_on" error={errors.starts_on}>
          <input id="starts_on" name="starts_on" type="date" defaultValue={a.starts_on} className="field" aria-invalid={!!errors.starts_on} />
        </Field>
        <Field label="Fin" htmlFor="ends_on" error={errors.ends_on} hint="Opcional.">
          <input id="ends_on" name="ends_on" type="date" defaultValue={a.ends_on ?? ""} className="field" />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <fieldset>
          <legend className="mb-2 text-[0.7rem] font-bold tracking-[0.14em] text-cream-200 uppercase">Servicios incluidos</legend>
          <div className="flex flex-wrap gap-5">
            {services.map((service) => (
              <Checkbox
                key={service.id}
                name="services"
                value={service.id}
                label={service.label}
                defaultChecked={(a.services ?? ["almuerzo"]).includes(service.id)}
              />
            ))}
          </div>
          {errors.services && <p className="mt-1 text-xs text-[#ff9dbb]">{errors.services}</p>}
        </fieldset>
        <Field label="Estado" htmlFor="status">
          <select id="status" name="status" defaultValue={a.status ?? "activo"} className="field">
            {Object.entries(agreementStatus).map(([value, { label }]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Notas" htmlFor="notes" hint="Condiciones, horarios de entrega, facturación…">
        <textarea id="notes" name="notes" rows={3} maxLength={1000} defaultValue={a.notes ?? ""} className="field resize-none" />
      </Field>

      <div className="flex flex-wrap gap-3">
        <SubmitButton pending={pending}>{agreement ? "Guardar cambios" : "Crear convenio"}</SubmitButton>
        <ButtonLink href="/convenios?vista=convenios" variant="ghost">
          Cancelar
        </ButtonLink>
      </div>
    </form>
  );
}
