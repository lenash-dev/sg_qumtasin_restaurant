import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Pencil, Plus, Search, Star } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { dishTagLabel } from "@/lib/labels";
import { cn, formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, ListSkeleton } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { listDishes } from "@/features/dishes/queries";

export const metadata: Metadata = { title: "Platos" };

const statusFilters = [
  { id: "activos", label: "Activos" },
  { id: "inactivos", label: "Inactivos" },
  { id: "todos", label: "Todos" },
] as const;

export default function DishesPage({ searchParams }: PageProps<"/platos">) {
  return (
    <>
      <PageHeader
        eyebrow="Carta"
        title="Platos"
        description="El catálogo de platos. Desde aquí se eligen para el menú de cada día."
        actions={
          <ButtonLink href="/platos/nuevo">
            <Plus className="size-4" aria-hidden />
            Nuevo plato
          </ButtonLink>
        }
      />
      <Suspense fallback={<div className="mt-8"><ListSkeleton rows={6} /></div>}>
        <DishList searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function DishList({ searchParams }: Pick<PageProps<"/platos">, "searchParams">) {
  await requireUser();
  const params = await searchParams;
  const search = typeof params.q === "string" ? params.q.trim() : "";
  const status = statusFilters.find((f) => f.id === params.estado)?.id ?? "activos";
  const dishes = await listDishes({ search, status });

  return (
    <>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form className="relative sm:w-80" role="search">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-cream-300" aria-hidden />
          <input name="q" type="search" defaultValue={search} placeholder="Buscar plato…" aria-label="Buscar plato" className="field pl-10" />
          <input type="hidden" name="estado" value={status} />
        </form>
        <div className="surface flex gap-1 self-start rounded-full p-1">
          {statusFilters.map((filter) => (
            <Link
              key={filter.id}
              href={`/platos?${new URLSearchParams({ estado: filter.id, ...(search && { q: search }) })}`}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-bold transition-colors",
                filter.id === status ? "bg-cream-50 text-wine-900" : "text-cream-200 hover:text-cream-50",
              )}
            >
              {filter.label}
            </Link>
          ))}
        </div>
      </div>

      {dishes.length === 0 ? (
        <EmptyState
          className="mt-6"
          title="No hay platos"
          description={search ? `Nada coincide con «${search}».` : "Crea el primer plato de la carta."}
          action={<ButtonLink href="/platos/nuevo">Nuevo plato</ButtonLink>}
        />
      ) : (
        <ul className="mt-6 grid gap-3 md:grid-cols-2">
          {dishes.map((dish) => (
            <li key={dish.id}>
              <Link
                href={`/platos/${dish.id}`}
                className={cn("surface group flex h-full gap-4 rounded-2xl p-4 transition-colors hover:border-cream-50/25", !dish.active && "opacity-60")}
              >
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 font-display text-xl uppercase">
                    {dish.name}
                    {dish.featured && <Star className="size-4 fill-gold-400 text-gold-400" aria-label="Destacado" />}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-cream-300">{dish.description || "Sin descripción"}</p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {!dish.active && <Badge tone="muted">Inactivo</Badge>}
                    {dish.tags.map((tag) => (
                      <Badge key={tag} tone={tag === "picante" ? "rose" : tag === "vegetariano" ? "green" : "gold"}>
                        {dishTagLabel[tag] ?? tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <span className="font-display text-xl text-gold-300">{formatPrice(dish.price)}</span>
                  <Pencil className="size-4 text-cream-300 transition-colors group-hover:text-cream-50" aria-hidden />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
