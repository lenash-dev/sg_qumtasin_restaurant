import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="flex items-center gap-2.5 text-[0.68rem] font-bold tracking-[0.32em] text-cream-300 uppercase">
            <span aria-hidden className="size-1.5 rotate-45 bg-gold-400" />
            {eyebrow}
          </p>
        )}
        <h1 className="mt-2 font-display text-4xl leading-none uppercase sm:text-5xl">{title}</h1>
        {description && <div className="mt-2 max-w-2xl text-sm text-cream-200/75">{description}</div>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function SectionTitle({ children, actions }: { children: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <h2 className="font-display text-2xl uppercase">{children}</h2>
      {actions}
    </div>
  );
}
