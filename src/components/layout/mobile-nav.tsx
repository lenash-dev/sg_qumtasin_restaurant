"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Barra superior y cajón de navegación para celulares y tablets.
 * El cajón se cierra solo al cambiar de página: queda "abierto" solo
 * para la ruta en la que se abrió.
 */
export function MobileNav({ brand, children }: { brand: ReactNode; children: ReactNode }) {
  const pathname = usePathname();
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpenOn(null);
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <header className="glass fixed inset-x-3 top-3 z-40 flex h-16 items-center justify-between rounded-full pr-2 pl-2">
        {brand}
        <button
          type="button"
          onClick={() => setOpenOn(open ? null : pathname)}
          aria-expanded={open}
          aria-controls="mobile-drawer"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          className="grid size-11 place-items-center rounded-full bg-cream-50/8 text-cream-50 ring-1 ring-cream-50/15"
        >
          {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
        </button>
      </header>

      <div
        aria-hidden={!open}
        onClick={() => setOpenOn(null)}
        className={cn(
          "fixed inset-0 z-40 bg-wine-950/70 transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <div
        id="mobile-drawer"
        inert={!open}
        className={cn(
          "glass fixed inset-y-3 left-3 z-50 flex w-[min(20rem,calc(100vw-1.5rem))] flex-col rounded-[1.75rem] p-4 transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-[calc(100%+1rem)]",
        )}
      >
        {brand}
        {children}
      </div>
    </div>
  );
}

/** Barra superior estática mientras se resuelve la ruta */
export function MobileNavFallback({ brand }: { brand: ReactNode }) {
  return (
    <div className="lg:hidden">
      <header className="glass fixed inset-x-3 top-3 z-40 flex h-16 items-center justify-between rounded-full pr-2 pl-2">
        {brand}
        <span aria-hidden className="grid size-11 place-items-center rounded-full bg-cream-50/8 text-cream-50 ring-1 ring-cream-50/15">
          <Menu className="size-5" />
        </span>
      </header>
    </div>
  );
}
