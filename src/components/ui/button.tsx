import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type Variant = "solid" | "outline" | "ghost" | "danger";
type Size = "sm" | "md";

const base =
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap select-none " +
  "transition-[background-color,border-color,color,transform] duration-200 active:scale-[0.97] " +
  "disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  solid: "bg-cream-50 text-wine-900 hover:bg-gold-300",
  outline: "border border-cream-50/15 bg-cream-50/5 text-cream-50 hover:border-cream-50/35 hover:bg-cream-50/10",
  ghost: "text-cream-200 hover:bg-cream-50/8 hover:text-cream-50",
  danger: "border border-aguayo-rose/40 bg-aguayo-rose/10 text-[#ff9dbb] hover:bg-aguayo-rose/20",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-xs",
  md: "h-11 px-5 text-sm",
};

export function buttonClasses({ variant = "solid", size = "md" }: { variant?: Variant; size?: Size } = {}) {
  return cn(base, variants[variant], sizes[size]);
}

export function Button({ variant, size, className, type = "button", ...props }: { variant?: Variant; size?: Size } & ComponentProps<"button">) {
  return <button type={type} className={cn(buttonClasses({ variant, size }), className)} {...props} />;
}

export function ButtonLink({ variant, size, className, ...props }: { variant?: Variant; size?: Size } & ComponentProps<typeof Link>) {
  return <Link className={cn(buttonClasses({ variant, size }), className)} {...props} />;
}

/** Botón redondo solo con ícono (requiere `aria-label`) */
export function IconButton({ className, type = "button", ...props }: ComponentProps<"button"> & { "aria-label": string }) {
  return (
    <button
      type={type}
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-full text-cream-200 transition-colors hover:bg-cream-50/10 hover:text-cream-50 disabled:opacity-40",
        className,
      )}
      {...props}
    />
  );
}
