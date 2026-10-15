import type { Metadata } from "next";
import { Suspense } from "react";
import { Trash } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { services } from "@/lib/labels";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { ListSkeleton } from "@/components/ui/feedback";
import { Checkbox, SubmitButton } from "@/components/ui/form";
import { PageHeader } from "@/components/ui/page-header";
import { deleteCategory, updateCategory } from "@/features/categories/actions";
import { NewCategoryForm } from "@/features/categories/new-category-form";

export const metadata: Metadata = { title: "Categorías" };

export default function CategoriesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Carta"
        title="Categorías"
        description="Las categorías que el restaurante puede habilitar cada día en el menú (ej. Almuerzo ejecutivo, Saludables, Platos extras). El orden define cómo aparecen en la web."
      />
      <Suspense fallback={<div className="mt-8"><ListSkeleton rows={6} /></div>}>
        <CategoryList />
      </Suspense>
    </>
  );
}

async function CategoryList() {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase.from("menu_categories").select("*").order("position").order("name");
  if (error) throw new Error(`No se pudieron cargar las categorías: ${error.message}`);

  return (
    <>
      <NewCategoryForm />
      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        {services.map((service) => {
          const rows = data.filter((c) => c.service === service.id);
          return (
            <section key={service.id} className="surface rounded-3xl p-5">
              <h2 className="font-display text-2xl uppercase">{service.label}</h2>
              <p className="text-xs text-cream-300">{rows.length} categorías</p>
              {rows.length === 0 ? (
                <p className="mt-4 text-sm text-cream-300">Sin categorías: la web mostrará este servicio como «No disponible».</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {rows.map((category) => (
                    <li key={category.id} className={cn("rounded-2xl bg-wine-950/40 p-3 ring-1 ring-cream-50/8", !category.active && "opacity-60")}>
                      <form action={updateCategory} className="space-y-2">
                        <input type="hidden" name="id" value={category.id} />
                        <div className="flex gap-2">
                          <input name="name" defaultValue={category.name} aria-label="Nombre" maxLength={60} className="field py-2 font-semibold" />
                          <input
                            name="position"
                            type="number"
                            min={0}
                            defaultValue={category.position}
                            aria-label="Orden"
                            title="Orden"
                            className="field w-16 py-2 text-center"
                          />
                        </div>
                        <input
                          name="description"
                          defaultValue={category.description ?? ""}
                          aria-label="Descripción"
                          placeholder="Descripción (opcional)"
                          maxLength={200}
                          className="field py-2 text-xs"
                        />
                        <div className="flex items-center justify-between gap-2">
                          <Checkbox name="active" label="Activa" defaultChecked={category.active} />
                          <SubmitButton variant="outline" size="sm" pendingLabel="…">
                            Guardar
                          </SubmitButton>
                        </div>
                      </form>
                      <form action={deleteCategory} className="mt-1 flex justify-end">
                        <input type="hidden" name="id" value={category.id} />
                        <ConfirmButton label="Eliminar categoría" message={`¿Eliminar la categoría «${category.name}»?`}>
                          <Trash className="size-4" aria-hidden />
                        </ConfirmButton>
                      </form>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
