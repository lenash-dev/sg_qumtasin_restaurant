import { Suspense, type ReactNode } from "react";
import { LogOut } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { signOut } from "@/app/(panel)/session-actions";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/feedback";
import { Brand } from "./brand";
import { ActiveNavLinks, NavLinks } from "./nav-links";
import { MobileNav, MobileNavFallback } from "./mobile-nav";

/** Navegación según el rol. Mientras carga la sesión se muestran los accesos del personal. */
async function RoleNav() {
  const user = await getCurrentUser();
  return <ActiveNavLinks role={user?.role ?? "staff"} />;
}

async function UserCard() {
  const user = await getCurrentUser();
  if (!user) return null;
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-cream-50/5 p-3 ring-1 ring-cream-50/10">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gold-400 font-display text-sm text-wine-900 uppercase">
        {user.name.slice(0, 1)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{user.name}</p>
        <Badge tone={user.role === "admin" ? "gold" : "neutral"} className="mt-0.5 px-2 py-0.5 text-[0.58rem]">
          {user.role === "admin" ? "Administrador" : "Personal"}
        </Badge>
      </div>
      <form action={signOut}>
        <button
          type="submit"
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
          className="grid size-9 place-items-center rounded-full text-cream-300 transition-colors hover:bg-cream-50/10 hover:text-cream-50"
        >
          <LogOut className="size-4" aria-hidden />
        </button>
      </form>
    </div>
  );
}

function Navigation() {
  return (
    <Suspense fallback={<NavLinks role="staff" />}>
      <RoleNav />
    </Suspense>
  );
}

function Account() {
  return (
    <Suspense fallback={<Skeleton className="h-[62px]" />}>
      <UserCard />
    </Suspense>
  );
}

function SidebarBody({ header }: { header?: ReactNode }) {
  return (
    <>
      {header}
      <div className="mt-8 flex-1 overflow-y-auto pr-1">
        <Navigation />
      </div>
      <div className="mt-6">
        <Account />
      </div>
    </>
  );
}

export function Sidebar() {
  return (
    <>
      <aside className="glass fixed inset-y-3 left-3 z-40 hidden w-64 flex-col overflow-hidden rounded-[1.75rem] p-4 lg:flex">
        <div aria-hidden className="aguayo-stripe absolute inset-x-0 top-0 h-1 opacity-80" />
        <SidebarBody header={<Brand />} />
      </aside>
      {/* usePathname() en rutas dinámicas debe ir dentro de <Suspense> */}
      <Suspense fallback={<MobileNavFallback brand={<Brand />} />}>
        <MobileNav brand={<Brand />}>
          <SidebarBody />
        </MobileNav>
      </Suspense>
    </>
  );
}
