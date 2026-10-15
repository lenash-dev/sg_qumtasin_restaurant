"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/** Botón de envío que pide confirmación antes de una acción destructiva. */
export function ConfirmButton({
  message,
  label,
  children,
  className,
}: {
  message: string;
  label: string;
  children: ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      aria-label={label}
      title={label}
      disabled={pending}
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-full text-cream-300 transition-colors hover:bg-aguayo-rose/15 hover:text-[#ff9dbb] disabled:opacity-50",
        className,
      )}
    >
      {pending ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : children}
    </button>
  );
}
