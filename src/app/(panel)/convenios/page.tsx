import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ChevronRight, Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { formatShortDate } from "@/lib/dates";
import { agreementPeriod, agreementStatus, requestPlan, requestService, requestStatus, serviceLabel } from "@/lib/labels";
import { createClient } from "@/lib/supabase/server";
import { cn, formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, ListSkeleton } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Convenios" };

export default function AgreementsPage({ searchParams }: PageProps<"/convenios">) {
  return (
    <>
      <PageHeader
        eyebrow="Administración"
        title="Convenios"
        description="Solicitudes que llegan desde la página web y convenios con empresas por plan semanal o mensual."
        actions={
          <ButtonLink href="/convenios/nuevo">
            <Plus className="size-4" aria-hidden />
            Nuevo convenio
          </ButtonLink>
        }
      />
      <Suspense fallback={<div className="mt-8"><ListSkeleton rows={5} /></div>}>
        <AgreementsView searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function AgreementsView({ searchParams }: Pick<PageProps<"/convenios">, "searchParams">) {
  await requireAdmin();
  const params = await searchParams;
  const view = params.vista === "convenios" ? "convenios" : "solicitudes";
  const supabase = await createClient();

  const [{ count: newRequests }, { count: activeAgreements }] = await Promise.all([
    supabase.from("agreement_requests").select("id", { count: "exact", head: true }).eq("status", "nueva"),
    supabase.from("agreements").select("id", { count: "exact", head: true }).eq("status", "activo"),
  ]);

  const tabs = [
    { id: "solicitudes", label: "Solicitudes", count: newRequests ?? 0, hint: "nuevas" },
    { id: "convenios", label: "Convenios", count: activeAgreements ?? 0, hint: "activos" },
  ];

  return (
    <>
      <nav aria-label="Vista" className="mt-8 flex gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={`/convenios?vista=${tab.id}`}
            aria-current={view === tab.id ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors",
              view === tab.id ? "bg-cream-50 text-wine-900" : "surface text-cream-100 hover:border-cream-50/25",
            )}
          >
            <span className="font-display text-xl uppercase">{tab.label}</span>
            <span className={cn("rounded-full px-2 py-0.5 text-xs font-bold", view === tab.id ? "bg-wine-900 text-cream-50" : "bg-cream-50/10")}>
              {tab.count} {tab.hint}
            </span>
          </Link>
        ))}
      </nav>
      {view === "solicitudes" ? <RequestList /> : <AgreementList />}
    </>
  );
}

async function RequestList() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("agreement_requests").select("*").order("created_at", { ascending: false }).limit(100);
  if (error) throw new Error(`No se pudieron cargar las solicitudes: ${error.message}`);

  if (data.length === 0) {
    return <EmptyState className="mt-6" title="Sin solicitudes" description="Las solicitudes del formulario de empresas de la web aparecerán aquí." />;
  }

  return (
    <ul className="mt-6 space-y-3">
      {data.map((request) => {
        const status = requestStatus[request.status];
        return (
          <li key={request.id}>
            <Link
              href={`/convenios/solicitudes/${request.id}`}
              className={cn("surface group flex items-center gap-4 rounded-3xl p-4 transition-colors hover:border-cream-50/25 sm:p-5", request.status === "nueva" && "ring-1 ring-gold-400/40")}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display text-xl uppercase">{request.company}</p>
                  <Badge tone={status.tone}>{status.label}</Badge>
                </div>
                <p className="mt-1 text-sm text-cream-200/80">
                  {request.contact_name} · {requestService[request.service] ?? request.service} · {requestPlan[request.plan]} · {request.people} personas
                </p>
                <p className="mt-0.5 text-xs text-cream-300">Recibida el {formatShortDate(request.created_at.slice(0, 10))}</p>
              </div>
              <ChevronRight className="size-5 text-cream-300 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

async function AgreementList() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("agreements").select("*").order("status").order("starts_on", { ascending: false });
  if (error) throw new Error(`No se pudieron cargar los convenios: ${error.message}`);

  if (data.length === 0) {
    return (
      <EmptyState
        className="mt-6"
        title="Sin convenios"
        description="Crea un convenio desde una solicitud o directamente."
        action={<ButtonLink href="/convenios/nuevo">Nuevo convenio</ButtonLink>}
      />
    );
  }

  return (
    <ul className="mt-6 grid gap-3 lg:grid-cols-2">
      {data.map((agreement) => {
        const status = agreementStatus[agreement.status];
        return (
          <li key={agreement.id}>
            <Link
              href={`/convenios/${agreement.id}`}
              className={cn("surface flex h-full flex-col rounded-3xl p-5 transition-colors hover:border-cream-50/25", agreement.status !== "activo" && "opacity-70")}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-display text-2xl leading-none uppercase">{agreement.company}</p>
                <Badge tone={status.tone}>{status.label}</Badge>
              </div>
              <p className="mt-1 text-sm text-cream-300">{agreement.contact_name}</p>
              <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-cream-50/8 pt-4 text-sm">
                <div>
                  <dt className="text-[0.62rem] font-bold tracking-[0.2em] text-cream-300 uppercase">Plan</dt>
                  <dd className="mt-0.5 font-semibold">{agreementPeriod[agreement.period]}</dd>
                </div>
                <div>
                  <dt className="text-[0.62rem] font-bold tracking-[0.2em] text-cream-300 uppercase">Personas</dt>
                  <dd className="mt-0.5 font-semibold">{agreement.people}</dd>
                </div>
                <div>
                  <dt className="text-[0.62rem] font-bold tracking-[0.2em] text-cream-300 uppercase">Por día</dt>
                  <dd className="mt-0.5 font-semibold text-gold-300">{formatPrice(agreement.people * agreement.price_per_person)}</dd>
                </div>
              </dl>
              <p className="mt-3 text-xs text-cream-300">
                {agreement.services.map((s) => serviceLabel[s]).join(", ")} · desde {formatShortDate(agreement.starts_on)}
                {agreement.ends_on && ` hasta ${formatShortDate(agreement.ends_on)}`}
              </p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
