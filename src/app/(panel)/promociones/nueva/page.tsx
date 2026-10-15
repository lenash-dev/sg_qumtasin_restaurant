import type { Metadata } from "next";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { Skeleton } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { PromotionForm } from "@/features/promotions/promotion-form";

export const metadata: Metadata = { title: "Nueva promoción" };

export default function NewPromotionPage() {
  return (
    <>
      <PageHeader eyebrow="Promociones" title="Nueva promoción" />
      <Suspense fallback={<Skeleton className="mt-8 h-[40rem] max-w-4xl" />}>
        <Guarded />
      </Suspense>
    </>
  );
}

async function Guarded() {
  await requireAdmin();
  return <PromotionForm />;
}
