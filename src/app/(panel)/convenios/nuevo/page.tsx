import type { Metadata } from "next";
import { Suspense } from "react";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getToday } from "@/lib/today";
import { Skeleton } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { AgreementForm } from "@/features/agreements/agreement-form";

export const metadata: Metadata = { title: "Nuevo convenio" };

export default function NewAgreementPage({ searchParams }: PageProps<"/convenios/nuevo">) {
  return (
    <>
      <PageHeader eyebrow="Convenios" title="Nuevo convenio" />
      <Suspense fallback={<Skeleton className="mt-8 h-[40rem] max-w-4xl" />}>
        <NewAgreement searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function NewAgreement({ searchParams }: Pick<PageProps<"/convenios/nuevo">, "searchParams">) {
  await requireAdmin();
  const { solicitud } = await searchParams;
  const today = await getToday();
  const requestId = typeof solicitud === "string" && z.uuid().safeParse(solicitud).success ? solicitud : undefined;

  if (!requestId) return <AgreementForm defaults={{ starts_on: today }} />;

  // Precargar con los datos de la solicitud
  const supabase = await createClient();
  const { data: request } = await supabase.from("agreement_requests").select("*").eq("id", requestId).maybeSingle();
  if (!request) return <AgreementForm defaults={{ starts_on: today }} />;

  return (
    <AgreementForm
      requestId={request.id}
      defaults={{
        company: request.company,
        contact_name: request.contact_name,
        email: request.email,
        phone: request.phone,
        people: request.people,
        period: request.plan === "semanal" ? "semanal" : "mensual",
        starts_on: request.start_date ?? today,
        notes: request.message,
      }}
    />
  );
}
