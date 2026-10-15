import type { ReactNode } from "react";
import { Inbox, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("surface flex flex-col items-center rounded-3xl px-6 py-14 text-center", className)}>
      <span className="grid size-12 place-items-center rounded-2xl bg-cream-50/8 text-cream-300">
        {icon ?? <Inbox className="size-6" aria-hidden />}
      </span>
      <p className="mt-4 font-display text-2xl uppercase">{title}</p>
      {description && <div className="mt-1.5 max-w-md text-sm text-cream-300">{description}</div>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function Alert({ tone = "error", children, className }: { tone?: "error" | "info"; children: ReactNode; className?: string }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-3 rounded-2xl px-4 py-3 text-sm ring-1",
        tone === "error" ? "bg-aguayo-rose/10 text-[#ffc2d4] ring-aguayo-rose/30" : "bg-gold-400/10 text-gold-300 ring-gold-400/25",
        className,
      )}
    >
      <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div>{children}</div>
    </div>
  );
}

/** Bloques grises mientras cargan los datos */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded-2xl bg-cream-50/6", className)} />;
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-label="Cargando">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-16" />
      ))}
    </div>
  );
}
