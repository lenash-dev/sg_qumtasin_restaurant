import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Mail, Phone, Users } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { formatLongDate, formatTime, isIsoDate } from "@/lib/dates";
import { reservationSource, reservationStatus } from "@/lib/labels";
import type { Enums } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";
import { getToday } from "@/lib/today";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { DateNav } from "@/components/ui/date-nav";
import { EmptyState, ListSkeleton, Skeleton } from "@/components/ui/feedback";
import { SubmitButton } from "@/components/ui/form";
import { PageHeader } from "@/components/ui/page-header";
import { assignTable, setReservationStatus } from "@/features/reservations/actions";
import { NewReservationForm } from "@/features/reservations/new-reservation-form";

export const metadata: Metadata = { title: "Reservas" };

type Status = Enums<"reservation_status">;

/** Acciones disponibles según el estado actual */
const nextSteps: Record<Status, { status: Status; label: string; variant: "solid" | "outline" | "danger" }[]> = {
  pendiente: [
    { status: "confirmada", label: "Confirmar", variant: "solid" },
    { status: "cancelada", label: "Cancelar", variant: "danger" },
  ],
  confirmada: [
    { status: "sentada", label: "Llegó", variant: "solid" },
    { status: "no_asistio", label: "No asistió", variant: "outline" },
    { status: "cancelada", label: "Cancelar", variant: "danger" },
  ],
  sentada: [{ status: "completada", label: "Completar", variant: "outline" }],
  completada: [],
  cancelada: [{ status: "pendiente", label: "Reabrir", variant: "outline" }],
  no_asistio: [{ status: "pendiente", label: "Reabrir", variant: "outline" }],
};

const filters: { id: "todas" | Status; label: string }[] = [
  { id: "todas", label: "Todas" },
  { id: "pendiente", label: "Pendientes" },
  { id: "confirmada", label: "Confirmadas" },
  { id: "sentada", label: "En mesa" },
  { id: "cancelada", label: "Canceladas" },
];

const toMinutes = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));

export default function ReservationsPage({ searchParams }: PageProps<"/reservas">) {
  return (
    <Suspense
      fallback={
        <>
          <Skeleton className="h-20 w-80" />
          <div className="mt-8">
            <ListSkeleton rows={5} />
          </div>
        </>
      }
    >
      <Reservations searchParams={searchParams} />
    </Suspense>
  );
}

async function Reservations({ searchParams }: Pick<PageProps<"/reservas">, "searchParams">) {
  await requireUser();
  const params = await searchParams;
  const today = await getToday();
  const date = isIsoDate(params.fecha) ? params.fecha : today;
  const filter = filters.find((f) => f.id === params.estado)?.id ?? "todas";

  const supabase = await createClient();
  const [{ data: reservations, error }, { data: tables, error: tablesError }] = await Promise.all([
    supabase.from("reservations").select("*, table:restaurant_tables ( id, label )").eq("reservation_date", date).order("reservation_time"),
    supabase.from("restaurant_tables").select("id, label, capacity, zone").eq("active", true).order("position"),
  ]);
  if (error) throw new Error(`No se pudieron cargar las reservas: ${error.message}`);
  if (tablesError) throw new Error(`No se pudieron cargar las mesas: ${tablesError.message}`);

  const live = reservations.filter((r) => !["cancelada", "no_asistio"].includes(r.status));
  const people = live.reduce((total, r) => total + r.party_size, 0);
  const pending = reservations.filter((r) => r.status === "pendiente").length;
  const shown = filter === "todas" ? reservations : reservations.filter((r) => r.status === filter);

  /** Mesas ocupadas por otra reserva activa en ±90 minutos */
  const busyTables = (reservation: (typeof reservations)[number]) => {
    const at = toMinutes(reservation.reservation_time);
    return new Set(
      live
        .filter((r) => r.id !== reservation.id && r.table_id && Math.abs(toMinutes(r.reservation_time) - at) < 90)
        .map((r) => r.table_id as string),
    );
  };

  const longDate = formatLongDate(date);

  return (
    <>
      <PageHeader
        eyebrow={date === today ? "Reservas de hoy" : "Reservas"}
        title={longDate.charAt(0).toUpperCase() + longDate.slice(1)}
        actions={<DateNav date={date} today={today} basePath="/reservas" params={filter === "todas" ? {} : { estado: filter }} />}
      />

      <dl className="mt-8 grid grid-cols-3 gap-3 sm:max-w-xl">
        {[
          { label: "Reservas", value: live.length },
          { label: "Personas", value: people },
          { label: "Por confirmar", value: pending, highlight: pending > 0 },
        ].map((stat) => (
          <div key={stat.label} className={cn("surface rounded-2xl p-4", stat.highlight && "ring-1 ring-gold-400/40")}>
            <dt className="text-[0.65rem] font-bold tracking-[0.2em] text-cream-300 uppercase">{stat.label}</dt>
            <dd className={cn("mt-1 font-display text-4xl leading-none", stat.highlight && "text-gold-300")}>{stat.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div>
          <nav aria-label="Filtrar por estado" className="mb-4 flex gap-1 overflow-x-auto">
            {filters.map((f) => (
              <Link
                key={f.id}
                href={`/reservas?${new URLSearchParams({ fecha: date, ...(f.id !== "todas" && { estado: f.id }) })}`}
                className={cn(
                  "shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-colors",
                  f.id === filter ? "bg-cream-50 text-wine-900" : "text-cream-200 hover:bg-cream-50/8",
                )}
              >
                {f.label}
              </Link>
            ))}
          </nav>

          {shown.length === 0 ? (
            <EmptyState title="Sin reservas" description="No hay reservas para este día con ese filtro." />
          ) : (
            <ul className="space-y-3">
              {shown.map((reservation) => {
                const status = reservationStatus[reservation.status];
                const busy = busyTables(reservation);
                const closed = ["completada", "cancelada", "no_asistio"].includes(reservation.status);
                return (
                  <li key={reservation.id} className={cn("surface rounded-3xl p-4 sm:p-5", closed && "opacity-60")}>
                    <div className="flex flex-wrap items-start gap-4">
                      <div className="w-16 shrink-0 text-center">
                        <p className="font-display text-3xl leading-none">{formatTime(reservation.reservation_time)}</p>
                        <p className="mt-1 flex items-center justify-center gap-1 text-xs text-cream-300">
                          <Users className="size-3.5" aria-hidden />
                          {reservation.party_size}
                        </p>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">{reservation.customer_name}</p>
                          <Badge tone={status.tone}>{status.label}</Badge>
                          <Badge tone="muted">{reservationSource[reservation.source]}</Badge>
                        </div>
                        <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-cream-300">
                          <a href={`tel:${reservation.phone}`} className="flex items-center gap-1 hover:text-gold-300">
                            <Phone className="size-3.5" aria-hidden />
                            {reservation.phone}
                          </a>
                          {reservation.email && (
                            <a href={`mailto:${reservation.email}`} className="flex items-center gap-1 hover:text-gold-300">
                              <Mail className="size-3.5" aria-hidden />
                              {reservation.email}
                            </a>
                          )}
                        </p>
                        {reservation.notes && <p className="mt-2 text-sm text-cream-200/80">“{reservation.notes}”</p>}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-cream-50/8 pt-3">
                      <form action={assignTable} className="flex items-center gap-1.5">
                        <input type="hidden" name="id" value={reservation.id} />
                        <select
                          name="table_id"
                          defaultValue={reservation.table_id ?? ""}
                          aria-label="Mesa asignada"
                          className="field h-9 w-44 py-1 text-xs"
                          disabled={closed}
                        >
                          <option value="">Sin mesa</option>
                          {tables.map((table) => (
                            <option key={table.id} value={table.id}>
                              {table.label} · {table.capacity} pers.
                              {busy.has(table.id) ? " · ocupada" : table.capacity < reservation.party_size ? " · pequeña" : ""}
                            </option>
                          ))}
                        </select>
                        {!closed && (
                          <SubmitButton variant="ghost" size="sm" pendingLabel="…">
                            Asignar
                          </SubmitButton>
                        )}
                      </form>
                      <div className="ml-auto flex flex-wrap gap-2">
                        {nextSteps[reservation.status].map((step) => (
                          <form key={step.status} action={setReservationStatus}>
                            <input type="hidden" name="id" value={reservation.id} />
                            <input type="hidden" name="status" value={step.status} />
                            <SubmitButton variant={step.variant} size="sm" pendingLabel="…">
                              {step.label}
                            </SubmitButton>
                          </form>
                        ))}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="xl:sticky xl:top-8">
          <NewReservationForm key={date} date={date} tables={tables} />
        </div>
      </div>
    </>
  );
}
