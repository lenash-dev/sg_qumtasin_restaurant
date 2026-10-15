import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Trash } from "lucide-react";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Skeleton } from "@/components/ui/feedback";
import { SubmitButton } from "@/components/ui/form";
import { PageHeader } from "@/components/ui/page-header";
import { deletePromotion } from "@/features/promotions/actions";
import { PromotionForm } from "@/features/promotions/promotion-form";

export const metadata: Metadata = { title: "Editar promoción" };

export default function EditPromotionPage({ params }: PageProps<"/promociones/[id]">) {
  return (
    <Suspense fallback={<Skeleton className="h-[44rem] max-w-4xl" />}>
      <EditPromotion params={params} />
    </Suspense>
  );
}

async function EditPromotion({ params }: Pick<PageProps<"/promociones/[id]">, "params">) {
  await requireAdmin();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();

  const supabase = await createClient();
  const { data: promotion, error } = await supabase.from("promotions").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`No se pudo cargar la promoción: ${error.message}`);
  if (!promotion) notFound();

  return (
    <>
      <PageHeader
        eyebrow="Promociones"
        title={promotion.title}
        actions={
          <form action={deletePromotion}>
            <input type="hidden" name="id" value={promotion.id} />
            <SubmitButton variant="danger" size="sm" pendingLabel="Eliminando…" confirm={`¿Eliminar «${promotion.title}»?`}>
              <Trash className="size-4" aria-hidden />
              Eliminar
            </SubmitButton>
          </form>
        }
      />
      <PromotionForm promotion={promotion} />
    </>
  );
}
