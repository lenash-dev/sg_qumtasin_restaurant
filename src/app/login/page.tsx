import type { Metadata } from "next";
import Image from "next/image";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { Alert } from "@/components/ui/feedback";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh lg:grid-cols-2">
      {/* Marca */}
      <section className="relative hidden overflow-hidden border-r border-cream-50/10 bg-wine-900 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div aria-hidden className="bg-andean absolute inset-0 opacity-[0.05]" />
        <div aria-hidden className="absolute -right-1/4 -bottom-1/4 size-[80%] rounded-full bg-[radial-gradient(circle,rgb(240_181_77/0.18),transparent_65%)]" />
        <div aria-hidden className="aguayo-stripe absolute inset-x-0 top-0 h-1.5" />
        <Image src="/brand/wordmark.png" alt="Qumt'asim" width={924} height={194} priority className="relative h-9 w-auto self-start" />
        <div className="relative">
          <Image
            src="/brand/cholita.png"
            alt=""
            width={443}
            height={469}
            priority
            className="w-72 [mask-image:linear-gradient(to_bottom,#000_80%,transparent)]"
          />
          <h1 className="mt-6 font-display text-6xl leading-[0.9] uppercase">
            Sistema
            <span className="block font-serif text-[0.85em] tracking-tight normal-case italic text-gold-300">de gestión</span>
          </h1>
          <p className="mt-4 max-w-sm text-cream-200/80">Menú del día, promociones, reservas y convenios en un solo lugar.</p>
        </div>
      </section>

      {/* Formulario */}
      <section className="flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-sm animate-enter">
          <Image src="/brand/wordmark.png" alt="Qumt'asim" width={924} height={194} priority className="mb-10 h-7 w-auto lg:hidden" />
          <p className="flex items-center gap-2.5 text-[0.68rem] font-bold tracking-[0.32em] text-cream-300 uppercase">
            <span aria-hidden className="size-1.5 rotate-45 bg-gold-400" />
            Acceso del personal
          </p>
          <h2 className="mt-2 font-display text-5xl uppercase">Bienvenido</h2>
          <p className="mt-2 mb-8 text-sm text-cream-300">Ingresa con la cuenta que te dio el administrador.</p>

          {isSupabaseConfigured ? (
            <LoginForm />
          ) : (
            <Alert tone="info">
              Falta conectar Supabase. Copia <code className="font-semibold">.env.example</code> como{" "}
              <code className="font-semibold">.env.local</code>, completa la URL y la clave pública del proyecto y reinicia el servidor.
              El paso a paso está en el README.
            </Alert>
          )}
        </div>
      </section>
    </main>
  );
}
