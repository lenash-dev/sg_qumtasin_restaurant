"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Armchair,
  BadgePercent,
  CalendarCheck,
  CalendarDays,
  Handshake,
  LayoutDashboard,
  Soup,
  Tags,
  type LucideIcon,
} from "lucide-react";
import type { Enums } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: LucideIcon; adminOnly?: boolean };

const groups: { title: string; items: NavItem[] }[] = [
  {
    title: "Día a día",
    items: [
      { href: "/", label: "Panel", icon: LayoutDashboard },
      { href: "/menu-del-dia", label: "Menú del día", icon: CalendarDays },
      { href: "/reservas", label: "Reservas", icon: CalendarCheck },
    ],
  },
  {
    title: "Carta",
    items: [
      { href: "/platos", label: "Platos", icon: Soup },
      { href: "/categorias", label: "Categorías", icon: Tags },
      { href: "/promociones", label: "Promociones", icon: BadgePercent, adminOnly: true },
    ],
  },
  {
    title: "Administración",
    items: [
      { href: "/convenios", label: "Convenios", icon: Handshake, adminOnly: true },
      { href: "/mesas", label: "Mesas", icon: Armchair, adminOnly: true },
    ],
  },
];

const isActive = (pathname: string, href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

/** Navegación con la página actual resaltada (debe ir dentro de <Suspense>) */
export function ActiveNavLinks({ role }: { role: Enums<"app_role"> }) {
  return <NavLinks role={role} pathname={usePathname()} />;
}

/** Sin `pathname` es estática: sirve como fallback instantáneo del prerender. */
export function NavLinks({ role, pathname }: { role: Enums<"app_role">; pathname?: string }) {
  return (
    <nav aria-label="Secciones" className="space-y-6">
      {groups.map((group) => {
        const items = group.items.filter((item) => !item.adminOnly || role === "admin");
        if (items.length === 0) return null;
        return (
          <div key={group.title}>
            <p className="mb-2 px-3 text-[0.62rem] font-bold tracking-[0.3em] text-cream-300/70 uppercase">{group.title}</p>
            <ul className="space-y-0.5">
              {items.map(({ href, label, icon: Icon }) => {
                const active = pathname !== undefined && isActive(pathname, href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors duration-200",
                        active ? "bg-cream-50 text-wine-900" : "text-cream-200/80 hover:bg-cream-50/8 hover:text-cream-50",
                      )}
                    >
                      <Icon className={cn("size-[18px]", active ? "text-wine-700" : "text-cream-300 group-hover:text-gold-300")} aria-hidden />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}
