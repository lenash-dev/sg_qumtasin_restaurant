import type { ReactNode } from "react";
import type { Tone } from "@/lib/labels";
import { cn } from "@/lib/utils";

const tones: Record<Tone, string> = {
  neutral: "bg-cream-50/10 text-cream-100 ring-cream-50/15",
  gold: "bg-gold-400/15 text-gold-300 ring-gold-400/30",
  green: "bg-aguayo-green/15 text-[#8fe0b9] ring-aguayo-green/30",
  rose: "bg-aguayo-rose/15 text-[#ff9dbb] ring-aguayo-rose/30",
  blue: "bg-aguayo-blue/15 text-[#a9c3ff] ring-aguayo-blue/30",
  muted: "bg-transparent text-cream-300 ring-cream-50/15",
};

export function Badge({ tone = "neutral", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.68rem] font-bold tracking-wide whitespace-nowrap uppercase ring-1",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Punto de estado */
export function Dot({ tone = "neutral", className }: { tone?: Tone; className?: string }) {
  const colors: Record<Tone, string> = {
    neutral: "bg-cream-200",
    gold: "bg-gold-400",
    green: "bg-emerald-400",
    rose: "bg-aguayo-rose",
    blue: "bg-aguayo-blue",
    muted: "bg-cream-50/25",
  };
  return <span aria-hidden className={cn("inline-block size-2 shrink-0 rounded-full", colors[tone], className)} />;
}
