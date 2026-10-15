import type { Metadata } from "next";
import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { Skeleton } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { DishForm } from "@/features/dishes/dish-form";

export const metadata: Metadata = { title: "Nuevo plato" };

export default function NewDishPage() {
  return (
    <>
      <PageHeader eyebrow="Platos" title="Nuevo plato" />
      <Suspense fallback={<Skeleton className="mt-8 h-[32rem] max-w-3xl" />}>
        <Guarded />
      </Suspense>
    </>
  );
}

async function Guarded() {
  await requireUser();
  return <DishForm />;
}
