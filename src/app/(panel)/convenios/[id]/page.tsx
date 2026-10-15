import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Skeleton } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { AgreementForm } from "@/features/agreements/agreement-form";

export const metadata: Metadata = { title: "Editar convenio" };

export default function EditAgreementPage({ params }: PageProps<"/convenios/[id]">) {
  return (
    <Suspense fallback={<Skeleton className="h-[44rem] max-w-4xl" />}>
      <EditAgreement params={params} />
    </Suspense>
  );
}

async function EditAgreement({ params }: Pick<PageProps<"/convenios/[id]">, "params">) {
  await requireAdmin();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();

  const supabase = await createClient();
  const { data: agreement, error } = await supabase.from("agreements").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`No se pudo cargar el convenio: ${error.message}`);
  if (!agreement) notFound();

  return (
    <>
      <PageHeader eyebrow="Convenios" title={agreement.company} />
      <AgreementForm agreement={agreement} />
    </>
  );
}
