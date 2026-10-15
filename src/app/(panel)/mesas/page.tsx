import type { Metadata } from "next";
import { Suspense } from "react";
import { Trash } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { ListSkeleton } from "@/components/ui/feedback";
import { Checkbox, SubmitButton } from "@/components/ui/form";
import { PageHeader } from "@/components/ui/page-header";
import { deleteTable, updateTable } from "@/features/tables/actions";
import { NewTableForm } from "@/features/tables/new-table-form";

export const metadata: Metadata = { title: "Mesas" };

export default function TablesPage() {
  return (
    <>
      <PageHeader eyebrow="Administración" title="Mesas" description="Las mesas del local y su capacidad, para asignarlas a las reservas." />
      <Suspense fallback={<div className="mt-8"><ListSkeleton rows={4} /></div>}>
        <TableList />
      </Suspense>
    </>
  );
}

async function TableList() {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase.from("restaurant_tables").select("*").order("position").order("label");
  if (error) throw new Error(`No se pudieron cargar las mesas: ${error.message}`);
  const seats = data.filter((t) => t.active).reduce((total, t) => total + t.capacity, 0);

  return (
    <>
      <p className="mt-4 text-sm text-cream-300">
        {data.length} mesas · {seats} lugares activos
      </p>
      <NewTableForm />
      <ul className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {data.map((table) => (
          <li key={table.id} className={cn("surface rounded-3xl p-4", !table.active && "opacity-60")}>
            <form action={updateTable} className="space-y-3">
              <input type="hidden" name="id" value={table.id} />
              <div className="grid grid-cols-[minmax(0,1fr)_5rem_4.5rem] gap-2">
                <input name="label" defaultValue={table.label} aria-label="Nombre" maxLength={20} className="field font-display text-lg uppercase" />
                <input name="capacity" type="number" min={1} max={50} defaultValue={table.capacity} aria-label="Personas" title="Personas" className="field text-center" />
                <input name="position" type="number" min={0} defaultValue={table.position} aria-label="Orden" title="Orden" className="field text-center" />
              </div>
              <input name="zone" defaultValue={table.zone ?? ""} placeholder="Zona" aria-label="Zona" maxLength={40} className="field py-2 text-xs" />
              <div className="flex items-center justify-between">
                <Checkbox name="active" label="Activa" defaultChecked={table.active} />
                <SubmitButton variant="outline" size="sm" pendingLabel="…">
                  Guardar
                </SubmitButton>
              </div>
            </form>
            <form action={deleteTable} className="mt-1 flex justify-end">
              <input type="hidden" name="id" value={table.id} />
              <ConfirmButton label="Eliminar mesa" message={`¿Eliminar la mesa ${table.label}? Sus reservas quedarán sin mesa.`}>
                <Trash className="size-4" aria-hidden />
              </ConfirmButton>
            </form>
          </li>
        ))}
      </ul>
    </>
  );
}
