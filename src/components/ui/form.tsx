"use client";

import { useFormStatus } from "react-dom";
import type { ComponentProps, ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export function Field({
  label,
  htmlFor,
  error,
  hint,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[0.7rem] font-bold tracking-[0.14em] text-cream-200 uppercase">
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-xs font-medium text-[#ff9dbb]">{error}</p>
      ) : (
        hint && <p className="mt-1 text-xs text-cream-300/80">{hint}</p>
      )}
    </div>
  );
}

/**
 * Botón de envío que muestra "guardando" mientras la acción corre.
 * `pending` permite indicarlo a mano (formularios con `useActionForm`);
 * `confirm` pide confirmación antes de enviar.
 */
export function SubmitButton({
  children,
  pendingLabel = "Guardando…",
  pending,
  confirm,
  disabled,
  ...props
}: Omit<ComponentProps<typeof Button>, "type"> & { pendingLabel?: string; pending?: boolean; confirm?: string }) {
  const status = useFormStatus();
  const isPending = pending ?? status.pending;
  return (
    <Button
      type="submit"
      disabled={isPending || disabled}
      aria-busy={isPending}
      onClick={confirm ? (event) => !window.confirm(confirm) && event.preventDefault() : undefined}
      {...props}
    >
      {isPending && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
      {isPending ? pendingLabel : children}
    </Button>
  );
}

export function Checkbox({ label, className, ...props }: { label: ReactNode } & Omit<ComponentProps<"input">, "type">) {
  return (
    <label className={cn("flex cursor-pointer items-center gap-2.5 text-sm text-cream-100 select-none", className)}>
      <input type="checkbox" className="size-4 rounded accent-gold-400" {...props} />
      {label}
    </label>
  );
}
