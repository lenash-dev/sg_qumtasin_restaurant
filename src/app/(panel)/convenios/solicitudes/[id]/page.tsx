import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, Handshake, Mail, Phone } from "lucide-react";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { formatShortDate } from "@/lib/dates";
import { requestPlan, requestService, requestStatus } from "@/lib/labels";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { RequestForm } from "@/features/agreements/request-form";

export const metadata: Metadata = { title: "Solicitud de convenio" };

export default function RequestPage({ params }: PageProps<"/convenios/solicitudes/[id]">) {
  return (
    <Suspense fallback={<Skeleton className="h-[30rem]" />}>
      <RequestDetail params={params} />
    </Suspense>
  );
}

async function RequestDetail({ params }: Pick<PageProps<"/convenios/solicitudes/[id]">, "params">) {
  await requireAdmin();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();

  const supabase = await createClient();
  const { data: request, error } = await supabase.from("agreement_requests").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`No se pudo cargar la solicitud: ${error.message}`);
  if (!request) notFound();
  const status = requestStatus[request.status];

  const rows = [
    { label: "Servicio", value: requestService[request.service] ?? request.service },
    { label: "Plan", value: requestPlan[request.plan] },
    { label: "Personas", value: String(request.people) },
    { label: "Fecha estimada", value: request.start_date ? formatShortDate(request.start_date) : "Sin fecha" },
    { label: "Recibida", value: formatShortDate(request.created_at.slice(0, 10)) },
  ];

  return (
    <>
      <ButtonLink href="/convenios" variant="ghost" size="sm" className="-ml-3 mb-4">
        <ArrowLeft className="size-4" aria-hidden />
        Solicitudes
      </ButtonLink>
      <PageHeader
        eyebrow="Solicitud de convenio"
        title={request.company}
        description={<Badge tone={status.tone}>{status.label}</Badge>}
        actions={
          <ButtonLink href={`/convenios/nuevo?solicitud=${request.id}`}>
            <Handshake className="size-4" aria-hidden />
            Crear convenio
          </ButtonLink>
        }
      />

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="surface rounded-3xl p-6">
          <p className="font-display text-2xl uppercase">{request.contact_name}</p>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-cream-200">
            <a href={`mailto:${request.email}`} className="flex items-center gap-1.5 hover:text-gold-300">
              <Mail className="size-4" aria-hidden />
              {request.email}
            </a>
            <a href={`tel:${request.phone}`} className="flex items-center gap-1.5 hover:text-gold-300">
              <Phone className="size-4" aria-hidden />
              {request.phone}
            </a>
          </div>
          <dl className="mt-6 grid gap-4 border-t border-cream-50/8 pt-6 sm:grid-cols-2">
            {rows.map((row) => (
              <div key={row.label}>
                <dt className="text-[0.65rem] font-bold tracking-[0.2em] text-cream-300 uppercase">{row.label}</dt>
                <dd className="mt-0.5 font-semibold">{row.value}</dd>
              </div>
            ))}
          </dl>
          {request.message && (
            <div className="mt-6 border-t border-cream-50/8 pt-6">
              <p className="text-[0.65rem] font-bold tracking-[0.2em] text-cream-300 uppercase">Mensaje</p>
              <p className="mt-2 whitespace-pre-line text-cream-100">{request.message}</p>
            </div>
          )}
        </section>
        <RequestForm request={request} />
      </div>
    </>
  );
}
