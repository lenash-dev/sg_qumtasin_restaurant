import type { Metadata } from "next";
import { Ban, LogOut } from "lucide-react";
import { signOut } from "@/app/(panel)/session-actions";
import { SubmitButton } from "@/components/ui/form";

export const metadata: Metadata = { title: "Sin acceso" };

/** Sesión válida pero sin perfil en el sistema: se explica en vez de redirigir en bucle. */
export default function NoAccessPage() {
  return (
    <main className="grid min-h-dvh place-items-center px-5">
      <div className="surface w-full max-w-md animate-enter rounded-3xl p-8 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-aguayo-rose/15 text-[#ff9dbb]">
          <Ban className="size-6" aria-hidden />
        </span>
        <h1 className="mt-4 font-display text-4xl uppercase">Sin acceso</h1>
        <p className="mt-2 text-sm text-cream-300">
          Tu cuenta existe, pero todavía no tiene un perfil en el sistema. Pide al administrador que te dé acceso.
        </p>
        <form action={signOut} className="mt-6">
          <SubmitButton variant="outline" pendingLabel="Saliendo…">
            <LogOut className="size-4" aria-hidden />
            Cerrar sesión
          </SubmitButton>
        </form>
      </div>
    </main>
  );
}
