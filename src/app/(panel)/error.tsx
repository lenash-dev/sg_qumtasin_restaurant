"use client";

import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PanelError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="surface mx-auto mt-10 max-w-lg rounded-3xl p-8 text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-aguayo-rose/15 text-[#ff9dbb]">
        <TriangleAlert className="size-6" aria-hidden />
      </span>
      <h1 className="mt-4 font-display text-3xl uppercase">Algo salió mal</h1>
      <p className="mt-2 text-sm text-cream-300">
        {error.message || "No pudimos completar la operación."} Si el problema sigue, revisa la conexión con Supabase.
      </p>
      <Button className="mt-6" onClick={reset}>
        Intentar de nuevo
      </Button>
    </div>
  );
}
