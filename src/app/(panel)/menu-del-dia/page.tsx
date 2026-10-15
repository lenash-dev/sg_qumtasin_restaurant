import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { formatLongDate, isIsoDate } from "@/lib/dates";
import { services } from "@/lib/labels";
import { getToday } from "@/lib/today";
import { cn } from "@/lib/utils";
import { Dot } from "@/components/ui/badge";
import { DateNav } from "@/components/ui/date-nav";
import { ListSkeleton, Skeleton } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { MenuEditor } from "@/features/menu/menu-editor";
import { getActiveDishes, getCategoriesForService, getDailyMenu, getMenuStatusByService, type MealService } from "@/features/menu/queries";

export const metadata: Metadata = { title: "Menú del día" };

const stateTone = { none: "muted", draft: "gold", published: "green" } as const;
const stateText = { none: "Sin menú", draft: "Borrador", published: "Publicado" } as const;

export default function MenuDayPage({ searchParams }: PageProps<"/menu-del-dia">) {
  return (
    <Suspense
      fallback={
        <>
          <Skeleton className="h-20 w-80" />
          <Skeleton className="mt-6 h-12 w-96" />
          <div className="mt-6">
            <ListSkeleton rows={3} />
          </div>
        </>
      }
    >
      <MenuDay searchParams={searchParams} />
    </Suspense>
  );
}

async function MenuDay({ searchParams }: Pick<PageProps<"/menu-del-dia">, "searchParams">) {
  await requireUser();
  const params = await searchParams;
  const today = await getToday();
  const date = isIsoDate(params.fecha) ? params.fecha : today;
  const service: MealService = services.some((s) => s.id === params.servicio) ? (params.servicio as MealService) : "almuerzo";

  const [menu, status, categories, dishes] = await Promise.all([
    getDailyMenu(date, service),
    getMenuStatusByService(date),
    getCategoriesForService(service),
    getActiveDishes(),
  ]);

  const longDate = formatLongDate(date);

  return (
    <>
      <PageHeader
        eyebrow={date === today ? "Menú de hoy" : "Menú del día"}
        title={longDate.charAt(0).toUpperCase() + longDate.slice(1)}
        description="Arma las categorías y platos de cada servicio. Lo publicado aparece en la página web."
        actions={<DateNav date={date} today={today} basePath="/menu-del-dia" params={{ servicio: service }} />}
      />

      <nav aria-label="Servicios" className="mt-8 flex gap-2 overflow-x-auto pb-1">
        {services.map((item) => {
          const active = item.id === service;
          const state = status[item.id];
          return (
            <Link
              key={item.id}
              href={`/menu-del-dia?${new URLSearchParams({ fecha: date, servicio: item.id })}`}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 transition-colors",
                active ? "bg-cream-50 text-wine-900" : "surface text-cream-100 hover:border-cream-50/25",
              )}
            >
              <Dot tone={stateTone[state.state]} />
              <span>
                <span className="block font-display text-xl leading-none uppercase">{item.label}</span>
                <span className={cn("text-xs", active ? "text-wine-700" : "text-cream-300")}>
                  {stateText[state.state]}
                  {state.dishes > 0 && ` · ${state.dishes} platos`}
                </span>
              </span>
            </Link>
          );
        })}
      </nav>

      <MenuEditor key={`${date}-${service}`} date={date} service={service} menu={menu} categories={categories} dishes={dishes} />
    </>
  );
}
