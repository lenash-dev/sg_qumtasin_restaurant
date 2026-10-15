import Link from "next/link";
import { ArrowUpRight, Copy, Eye, EyeOff, Plus, Trash, X } from "lucide-react";
import { addDays } from "@/lib/dates";
import { serviceLabel } from "@/lib/labels";
import { cn, formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { Alert, EmptyState } from "@/components/ui/feedback";
import { SubmitButton } from "@/components/ui/form";
import {
  addItem,
  addSection,
  copyMenu,
  removeItem,
  removeSection,
  setItemSoldOut,
  setPublished,
  updateItemPrice,
  updateNotes,
  updateSection,
} from "./actions";
import type { DailyMenu, MealService } from "./queries";

type Props = {
  date: string;
  service: MealService;
  menu: DailyMenu | null;
  categories: { id: string; name: string }[];
  dishes: { id: string; name: string; price: number }[];
};

export function MenuEditor({ date, service, menu, categories, dishes }: Props) {
  const sections = menu?.sections ?? [];
  const usedCategories = new Set(sections.map((s) => s.category_id));
  const freeCategories = categories.filter((c) => !usedCategories.has(c.id));
  const totalDishes = sections.reduce((n, s) => n + s.items.length, 0);
  const websiteUrl = process.env.WEBSITE_URL;

  return (
    <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="space-y-5">
        {sections.length === 0 ? (
          <EmptyState
            title={`Sin ${serviceLabel[service].toLowerCase()} para este día`}
            description="Agrega una categoría para empezar o copia el menú de otro día. Mientras no se publique, la página web muestra este servicio como «No disponible»."
          />
        ) : (
          sections.map((section) => (
            <SectionCard key={section.id} section={section} dishes={dishes} />
          ))
        )}

        <AddCategory date={date} service={service} categories={freeCategories} hasAny={categories.length > 0} />
      </div>

      <aside className="space-y-4 xl:sticky xl:top-8">
        {/* Publicación */}
        <div className="surface rounded-3xl p-5">
          <p className="text-[0.68rem] font-bold tracking-[0.28em] text-cream-300 uppercase">En la página web</p>
          {menu ? (
            <>
              <div className="mt-3 flex items-center gap-3">
                <Badge tone={menu.published ? "green" : "gold"}>{menu.published ? "Publicado" : "Borrador"}</Badge>
                <span className="text-sm text-cream-300">{totalDishes} platos</span>
              </div>
              {menu.published && totalDishes === 0 && (
                <Alert className="mt-4">Está publicado pero no tiene platos: la web lo mostrará vacío.</Alert>
              )}
              <form action={setPublished} className="mt-4">
                <input type="hidden" name="menu_id" value={menu.id} />
                <input type="hidden" name="published" value={String(!menu.published)} />
                <SubmitButton
                  variant={menu.published ? "outline" : "solid"}
                  className="w-full"
                  pendingLabel={menu.published ? "Ocultando…" : "Publicando…"}
                  disabled={!menu.published && totalDishes === 0}
                >
                  {menu.published ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
                  {menu.published ? "Ocultar de la web" : "Publicar en la web"}
                </SubmitButton>
              </form>
            </>
          ) : (
            <p className="mt-3 text-sm text-cream-300">Todavía no hay menú. La web mostrará «No disponible».</p>
          )}
          {websiteUrl && (
            <a
              href={`${websiteUrl}/menu`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-cream-200 hover:text-gold-300"
            >
              Ver la carta en la web <ArrowUpRight className="size-3.5" aria-hidden />
            </a>
          )}
        </div>

        {/* Nota del día */}
        {menu && (
          <form action={updateNotes} className="surface rounded-3xl p-5">
            <input type="hidden" name="menu_id" value={menu.id} />
            <label htmlFor="notes" className="text-[0.68rem] font-bold tracking-[0.28em] text-cream-300 uppercase">
              Nota para los clientes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              maxLength={300}
              defaultValue={menu.notes ?? ""}
              placeholder="Ej. Servimos de 12:00 a 15:00."
              className="field mt-3 resize-none"
            />
            <SubmitButton variant="outline" size="sm" className="mt-3">
              Guardar nota
            </SubmitButton>
          </form>
        )}

        {/* Copiar */}
        {sections.length === 0 && (
          <form action={copyMenu} className="surface rounded-3xl p-5">
            <input type="hidden" name="to" value={date} />
            <input type="hidden" name="service" value={service} />
            <label htmlFor="copy-from" className="text-[0.68rem] font-bold tracking-[0.28em] text-cream-300 uppercase">
              Copiar de otro día
            </label>
            <p className="mt-2 text-xs text-cream-300">Trae las categorías y platos de ese día como borrador.</p>
            <input id="copy-from" name="from" type="date" defaultValue={addDays(date, -1)} className="field mt-3" />
            <SubmitButton variant="outline" size="sm" className="mt-3" pendingLabel="Copiando…">
              <Copy className="size-4" aria-hidden />
              Copiar menú
            </SubmitButton>
          </form>
        )}
      </aside>
    </div>
  );
}

function SectionCard({ section, dishes }: { section: DailyMenu["sections"][number]; dishes: Props["dishes"] }) {
  const inSection = new Set(section.items.map((i) => i.dish_id));
  const available = dishes.filter((d) => !inSection.has(d.id));
  const isCombo = section.price !== null;

  return (
    <section className="surface animate-enter rounded-3xl p-5 sm:p-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-3xl leading-none uppercase">{section.category?.name ?? "Categoría"}</h3>
          <p className="mt-1.5 text-xs text-cream-300">
            {section.items.length} platos · {isCombo ? `Combo ${formatPrice(section.price)}` : "Precio por plato"}
          </p>
        </div>
        <form action={removeSection}>
          <input type="hidden" name="section_id" value={section.id} />
          <ConfirmButton label="Quitar categoría del día" message={`¿Quitar «${section.category?.name}» y sus platos de este día?`}>
            <Trash className="size-4" aria-hidden />
          </ConfirmButton>
        </form>
      </header>

      <form action={updateSection} className="mt-4 grid gap-2 sm:grid-cols-[9rem_minmax(0,1fr)_auto]">
        <input type="hidden" name="section_id" value={section.id} />
        <input
          name="price"
          type="number"
          min={0}
          step="0.5"
          inputMode="decimal"
          defaultValue={section.price ?? ""}
          placeholder="Precio combo"
          aria-label="Precio del combo (opcional)"
          className="field"
        />
        <input
          name="note"
          defaultValue={section.note ?? ""}
          placeholder="Nota: ej. incluye sopa, segundo y refresco"
          aria-label="Nota de la categoría"
          className="field"
        />
        <SubmitButton variant="outline" size="sm" className="h-full min-h-10">
          Guardar
        </SubmitButton>
      </form>

      {section.items.length > 0 && (
        <ul className="mt-4 divide-y divide-cream-50/8 border-t border-cream-50/8">
          {section.items.map((item) => {
            const priceText =
              item.price !== null ? formatPrice(item.price) : isCombo ? "Incluido en el combo" : `${formatPrice(item.dish?.price)} · precio de carta`;
            return (
              <li key={item.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3">
                <div className="min-w-0 flex-1">
                  <p className={cn("font-semibold", item.sold_out && "text-cream-300 line-through")}>{item.dish?.name}</p>
                  <p className="text-xs text-cream-300">
                    {priceText}
                    {item.sold_out && <span className="ml-2 font-bold text-[#ff9dbb]">Agotado</span>}
                    {item.dish && !item.dish.active && <span className="ml-2 text-gold-300">Plato desactivado</span>}
                  </p>
                </div>
                <form action={updateItemPrice} className="flex items-center gap-1">
                  <input type="hidden" name="item_id" value={item.id} />
                  <input
                    name="price"
                    type="number"
                    min={0}
                    step="0.5"
                    inputMode="decimal"
                    defaultValue={item.price ?? ""}
                    placeholder={isCombo ? "Incluido" : String(item.dish?.price ?? "")}
                    aria-label={`Precio de ${item.dish?.name} hoy`}
                    className="field h-9 w-24 py-1"
                  />
                  <SubmitButton variant="ghost" size="sm" pendingLabel="…">
                    OK
                  </SubmitButton>
                </form>
                <form action={setItemSoldOut}>
                  <input type="hidden" name="item_id" value={item.id} />
                  <input type="hidden" name="sold_out" value={String(!item.sold_out)} />
                  <SubmitButton variant={item.sold_out ? "solid" : "outline"} size="sm" pendingLabel="…">
                    {item.sold_out ? "Hay de nuevo" : "Agotado"}
                  </SubmitButton>
                </form>
                <form action={removeItem}>
                  <input type="hidden" name="item_id" value={item.id} />
                  <ConfirmButton label="Quitar plato" message={`¿Quitar «${item.dish?.name}» del menú de este día?`}>
                    <X className="size-4" aria-hidden />
                  </ConfirmButton>
                </form>
              </li>
            );
          })}
        </ul>
      )}

      {available.length > 0 ? (
        <form action={addItem} className="mt-4 flex flex-wrap gap-2">
          <input type="hidden" name="section_id" value={section.id} />
          <select name="dish_id" required defaultValue="" aria-label="Plato para agregar" className="field min-w-48 flex-1">
            <option value="" disabled>
              Agregar plato…
            </option>
            {available.map((dish) => (
              <option key={dish.id} value={dish.id}>
                {dish.name} · {formatPrice(dish.price)}
              </option>
            ))}
          </select>
          <input
            name="price"
            type="number"
            min={0}
            step="0.5"
            inputMode="decimal"
            placeholder={isCombo ? "Incluido" : "Precio hoy"}
            aria-label="Precio de hoy (opcional)"
            className="field w-32"
          />
          <SubmitButton variant="outline" size="sm" className="min-h-10" pendingLabel="Agregando…">
            <Plus className="size-4" aria-hidden />
            Agregar
          </SubmitButton>
        </form>
      ) : (
        <p className="mt-4 text-xs text-cream-300">
          Ya están todos los platos activos.{" "}
          <Link href="/platos/nuevo" className="font-semibold text-gold-300 hover:underline">
            Crear un plato nuevo
          </Link>
        </p>
      )}
    </section>
  );
}

function AddCategory({
  date,
  service,
  categories,
  hasAny,
}: {
  date: string;
  service: MealService;
  categories: Props["categories"];
  hasAny: boolean;
}) {
  if (!hasAny) {
    return (
      <p className="rounded-3xl border border-dashed border-cream-50/15 p-5 text-sm text-cream-300">
        No hay categorías de {serviceLabel[service].toLowerCase()}.{" "}
        <Link href="/categorias" className="font-semibold text-gold-300 hover:underline">
          Crea una en Categorías
        </Link>
        .
      </p>
    );
  }
  if (categories.length === 0) return null;

  return (
    <form action={addSection} className="flex flex-wrap items-center gap-2 rounded-3xl border border-dashed border-cream-50/15 p-4">
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="service" value={service} />
      <select name="category_id" required defaultValue="" aria-label="Categoría para agregar" className="field min-w-48 flex-1">
        <option value="" disabled>
          Agregar categoría al día…
        </option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
      <SubmitButton size="sm" className="min-h-10" pendingLabel="Agregando…">
        <Plus className="size-4" aria-hidden />
        Agregar categoría
      </SubmitButton>
    </form>
  );
}
