import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Pencil, Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { formatShortDate, weekdayShort } from "@/lib/dates";
import { createClient } from "@/lib/supabase/server";
import { cn, formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, ListSkeleton } from "@/components/ui/feedback";
import { SubmitButton } from "@/components/ui/form";
import { PageHeader } from "@/components/ui/page-header";
import { togglePromotion } from "@/features/promotions/actions";

export const metadata: Metadata = { title: "Promociones" };

export default function PromotionsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Carta"
        title="Promociones"
        description="Las promociones activas y vigentes se muestran en la página web, en el orden indicado."
        actions={
          <ButtonLink href="/promociones/nueva">
            <Plus className="size-4" aria-hidden />
            Nueva promoción
          </ButtonLink>
        }
      />
      <Suspense fallback={<div className="mt-8"><ListSkeleton rows={4} /></div>}>
        <PromotionList />
      </Suspense>
    </>
  );
}

function daysText(days: number[] | null) {
  if (!days || days.length === 0) return "Todos los días";
  return [1, 2, 3, 4, 5, 6, 0].filter((d) => days.includes(d)).map((d) => weekdayShort[d]).join(" · ");
}

async function PromotionList() {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase.from("promotions").select("*").order("position").order("created_at");
  if (error) throw new Error(`No se pudieron cargar las promociones: ${error.message}`);

  if (data.length === 0) {
    return (
      <EmptyState
        className="mt-8"
        title="Sin promociones"
        description="Crea la primera y aparecerá en la página web."
        action={<ButtonLink href="/promociones/nueva">Nueva promoción</ButtonLink>}
      />
    );
  }

  return (
    <ul className="mt-8 grid gap-4 lg:grid-cols-2">
      {data.map((promo) => (
        <li key={promo.id} className={cn("surface flex flex-col rounded-3xl p-5 sm:p-6", !promo.active && "opacity-60", promo.highlight && "ring-1 ring-gold-400/40")}>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[0.65rem] font-bold tracking-[0.28em] text-cream-300 uppercase">{promo.kicker || "Promoción"}</p>
              <h2 className="mt-1 font-display text-3xl leading-none uppercase">{promo.title}</h2>
            </div>
            <span className="shrink-0 text-right font-display text-3xl leading-none text-gold-300">
              {promo.price !== null ? formatPrice(promo.price) : <span className="text-xl uppercase">{promo.price_label}</span>}
            </span>
          </div>
          <p className="mt-2 line-clamp-2 text-sm text-cream-200/80">{promo.description}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            <Badge tone={promo.active ? "green" : "muted"}>{promo.active ? "Activa" : "Inactiva"}</Badge>
            {promo.highlight && <Badge tone="gold">Destacada</Badge>}
            <Badge>{daysText(promo.days)}</Badge>
            {promo.time_label && <Badge>{promo.time_label}</Badge>}
            {(promo.starts_on || promo.ends_on) && (
              <Badge tone="blue">
                {promo.starts_on ? formatShortDate(promo.starts_on) : "…"} → {promo.ends_on ? formatShortDate(promo.ends_on) : "…"}
              </Badge>
            )}
          </div>
          <div className="mt-5 flex items-center gap-2 border-t border-cream-50/10 pt-4">
            <form action={togglePromotion}>
              <input type="hidden" name="id" value={promo.id} />
              <input type="hidden" name="active" value={String(!promo.active)} />
              <SubmitButton variant="outline" size="sm" pendingLabel="…">
                {promo.active ? "Desactivar" : "Activar"}
              </SubmitButton>
            </form>
            <Link href={`/promociones/${promo.id}`} className="ml-auto flex items-center gap-1.5 text-sm font-semibold text-cream-200 hover:text-gold-300">
              <Pencil className="size-4" aria-hidden />
              Editar
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}
