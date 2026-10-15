"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addDays } from "@/lib/dates";

/** Navegador de fechas: día anterior / siguiente, selector y "Hoy". Usa ?fecha= en la URL. */
export function DateNav({
  date,
  today,
  basePath,
  params = {},
}: {
  date: string;
  today: string;
  basePath: string;
  params?: Record<string, string>;
}) {
  const router = useRouter();
  const href = (value: string) => `${basePath}?${new URLSearchParams({ ...params, fecha: value })}`;
  const arrow = "grid size-9 place-items-center rounded-full text-cream-200 transition-colors hover:bg-cream-50/10 hover:text-cream-50";

  return (
    <div className="surface flex items-center gap-1 rounded-full p-1">
      <Link href={href(addDays(date, -1))} aria-label="Día anterior" className={arrow}>
        <ChevronLeft className="size-4" aria-hidden />
      </Link>
      <input
        type="date"
        value={date}
        aria-label="Elegir fecha"
        onChange={(event) => event.target.value && router.push(href(event.target.value))}
        className="h-9 rounded-full bg-transparent px-2 text-sm font-semibold text-cream-50 outline-none focus:ring-2 focus:ring-gold-400/50"
      />
      <Link href={href(addDays(date, 1))} aria-label="Día siguiente" className={arrow}>
        <ChevronRight className="size-4" aria-hidden />
      </Link>
      {date !== today && (
        <Link
          href={href(today)}
          className="ml-1 rounded-full bg-cream-50 px-3 py-1.5 text-xs font-bold text-wine-900 transition-colors hover:bg-gold-300"
        >
          Hoy
        </Link>
      )}
    </div>
  );
}
