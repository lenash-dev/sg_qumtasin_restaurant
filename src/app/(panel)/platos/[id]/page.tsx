import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Trash } from "lucide-react";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { Skeleton } from "@/components/ui/feedback";
import { SubmitButton } from "@/components/ui/form";
import { PageHeader } from "@/components/ui/page-header";
import { deleteDish } from "@/features/dishes/actions";
import { DishForm } from "@/features/dishes/dish-form";
import { getDish } from "@/features/dishes/queries";

export const metadata: Metadata = { title: "Editar plato" };

export default function EditDishPage({ params }: PageProps<"/platos/[id]">) {
  return (
    <Suspense fallback={<Skeleton className="h-[36rem] max-w-3xl" />}>
      <EditDish params={params} />
    </Suspense>
  );
}

async function EditDish({ params }: Pick<PageProps<"/platos/[id]">, "params">) {
  await requireUser();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const dish = await getDish(id);
  if (!dish) notFound();

  return (
    <>
      <PageHeader
        eyebrow="Platos"
        title={dish.name}
        actions={
          <form action={deleteDish}>
            <input type="hidden" name="id" value={dish.id} />
            <SubmitButton variant="danger" size="sm" pendingLabel="Eliminando…" confirm={`¿Eliminar «${dish.name}»? Esta acción no se puede deshacer.`}>
              <Trash className="size-4" aria-hidden />
              Eliminar
            </SubmitButton>
          </form>
        }
      />
      <DishForm dish={dish} />
    </>
  );
}
