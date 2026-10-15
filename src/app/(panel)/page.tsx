import Link from "next/link";
import { Suspense } from "react";
import { ArrowUpRight, CalendarCheck, CalendarDays, Handshake, Users } from "lucide-react";
import { requireUser, type CurrentUser } from "@/lib/auth";
import { addDays, formatLongDate, formatTime } from "@/lib/dates";
import { reservationStatus, services } from "@/lib/labels";
import { createClient } from "@/lib/supabase/server";
import { getToday } from "@/lib/today";
import { cn } from "@/lib/utils";
import { Badge, Dot } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Alert, Skeleton } from "@/components/ui/feedback";
import { SectionTitle } from "@/components/ui/page-header";
import { getMenuStatusByService } from "@/features/menu/queries";

export default function DashboardPage({ searchParams }: PageProps<"/">) {
  return (
    <Suspense
      fallback={
        <>
          <Skeleton className="h-24 w-96" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="mt-8 h-80" />
        </>
      }
    >
      <Dashboard searchParams={searchParams} />
    </Suspense>
  );
}

async function Dashboard({ searchParams }: Pick<PageProps<"/">, "searchParams">) {
  const user = await requireUser();
  const params = await searchParams;
  const today = await getToday();
  const longDate = formatLongDate(today);

  return (
    <>
      <header>
        <p className="flex items-center gap-2.5 text-[0.68rem] font-bold tracking-[0.32em] text-cream-300 uppercase">
          <span aria-hidden className="size-1.5 rotate-45 bg-gold-400" />
          {longDate.charAt(0).toUpperCase() + longDate.slice(1)}
        </p>
        <h1 className="mt-2 font-display text-5xl leading-none uppercase sm:text-6xl">
          Hola, {user.name.split(" ")[0]}
          <span className="block font-serif text-[0.8em] tracking-tight normal-case italic text-gold-300">así va el día</span>
        </h1>
      </header>

      {params.acceso === "denegado" && <Alert className="mt-6 max-w-xl">Esa sección es solo para administradores.</Alert>}

      <DashboardBody user={user} today={today} />
    </>
  );
}

async function DashboardBody({ user, today }: { user: CurrentUser; today: string }) {
  const supabase = await createClient();
  const isAdmin = user.role === "admin";

  const [reservationsResult, pendingResult, menuStatus, requestsResult, agreementsResult] = await Promise.all([
    supabase
      .from("reservations")
      .select("id, customer_name, reservation_time, party_size, status, table:restaurant_tables ( label )")
      .eq("reservation_date", today)
      .not("status", "in", "(cancelada,no_asistio)")
      .order("reservation_time"),
    supabase.from("reservations").select("id", { count: "exact", head: true }).eq("status", "pendiente").gte("reservation_date", today),
    getMenuStatusByService(today),
    isAdmin ? supabase.from("agreement_requests").select("id", { count: "exact", head: true }).eq("status", "nueva") : null,
    isAdmin ? supabase.from("agreements").select("id", { count: "exact", head: true }).eq("status", "activo") : null,
  ]);
  if (reservationsResult.error) throw new Error(`No se pudieron cargar las reservas: ${reservationsResult.error.message}`);

  const reservations = reservationsResult.data;
  const people = reservations.reduce((n, r) => n + r.party_size, 0);
  const pending = pendingResult.count ?? 0;
  const published = services.filter((s) => menuStatus[s.id].state === "published").length;

  const stats = [
    { label: "Reservas hoy", value: reservations.length, detail: `${people} personas`, href: "/reservas", icon: CalendarCheck },
    { label: "Por confirmar", value: pending, detail: "hoy y próximos días", href: "/reservas?estado=pendiente", icon: Users, highlight: pending > 0 },
    { label: "Menú publicado", value: `${published}/3`, detail: "servicios de hoy", href: "/menu-del-dia", icon: CalendarDays },
    ...(isAdmin
      ? [{ label: "Solicitudes nuevas", value: requestsResult?.count ?? 0, detail: `${agreementsResult?.count ?? 0} convenios activos`, href: "/convenios", icon: Handshake, highlight: (requestsResult?.count ?? 0) > 0 }]
      : []),
  ];

  return (
    <>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, detail, href, icon: Icon, highlight }) => (
          <Link
            key={label}
            href={href}
            className={cn("surface group animate-enter rounded-3xl p-5 transition-colors hover:border-cream-50/25", highlight && "ring-1 ring-gold-400/40")}
          >
            <div className="flex items-center justify-between">
              <span className="text-[0.65rem] font-bold tracking-[0.2em] text-cream-300 uppercase">{label}</span>
              <Icon className="size-5 text-cream-300 transition-colors group-hover:text-gold-300" aria-hidden />
            </div>
            <p className={cn("mt-3 font-display text-5xl leading-none", highlight && "text-gold-300")}>{value}</p>
            <p className="mt-1 text-xs text-cream-300">{detail}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="surface rounded-3xl p-5 sm:p-6">
          <SectionTitle
            actions={
              <Link href="/reservas" className="flex items-center gap-1 text-xs font-semibold text-cream-200 hover:text-gold-300">
                Ver todas <ArrowUpRight className="size-3.5" aria-hidden />
              </Link>
            }
          >
            Reservas de hoy
          </SectionTitle>
          {reservations.length === 0 ? (
            <p className="text-sm text-cream-300">No hay reservas para hoy.</p>
          ) : (
            <ul className="divide-y divide-cream-50/8">
              {reservations.slice(0, 8).map((reservation) => {
                const status = reservationStatus[reservation.status];
                return (
                  <li key={reservation.id} className="flex items-center gap-4 py-3">
                    <span className="w-14 font-display text-2xl leading-none">{formatTime(reservation.reservation_time)}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{reservation.customer_name}</p>
                      <p className="text-xs text-cream-300">
                        {reservation.party_size} personas · {reservation.table?.label ? `Mesa ${reservation.table.label}` : "Sin mesa"}
                      </p>
                    </div>
                    <Badge tone={status.tone}>{status.label}</Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <aside className="space-y-4">
          <section className="surface rounded-3xl p-5">
            <SectionTitle>Menú de hoy</SectionTitle>
            <ul className="space-y-2">
              {services.map((service) => {
                const state = menuStatus[service.id];
                const tone = state.state === "published" ? "green" : state.state === "draft" ? "gold" : "muted";
                const text = state.state === "published" ? "Publicado" : state.state === "draft" ? "Borrador" : "No disponible en la web";
                return (
                  <li key={service.id}>
                    <Link
                      href={`/menu-del-dia?servicio=${service.id}`}
                      className="flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors hover:bg-cream-50/6"
                    >
                      <Dot tone={tone} />
                      <span className="flex-1">
                        <span className="block font-semibold">{service.label}</span>
                        <span className="text-xs text-cream-300">
                          {text}
                          {state.dishes > 0 && ` · ${state.dishes} platos`}
                        </span>
                      </span>
                      <ArrowUpRight className="size-4 text-cream-300" aria-hidden />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
          <div className="grid gap-2">
            <ButtonLink href={`/menu-del-dia?fecha=${addDays(today, 1)}`} variant="outline">
              Armar el menú de mañana
            </ButtonLink>
            <ButtonLink href="/reservas" variant="outline">
              Registrar una reserva
            </ButtonLink>
          </div>
        </aside>
      </div>
    </>
  );
}
