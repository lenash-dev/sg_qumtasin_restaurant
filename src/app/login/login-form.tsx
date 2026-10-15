"use client";

import { useActionState } from "react";
import { idleState } from "@/lib/actions";
import { Alert } from "@/components/ui/feedback";
import { Field, SubmitButton } from "@/components/ui/form";
import { signIn } from "./actions";

export function LoginForm() {
  const [state, action] = useActionState(signIn, idleState);

  return (
    <form action={action} className="space-y-5" noValidate>
      {state.status === "error" && state.message && <Alert>{state.message}</Alert>}
      <Field label="Correo" htmlFor="email" error={state.fieldErrors?.email}>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className="field h-12"
          placeholder="nombre@qumtasim.com"
          aria-invalid={!!state.fieldErrors?.email}
        />
      </Field>
      <Field label="Contraseña" htmlFor="password" error={state.fieldErrors?.password}>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="field h-12"
          aria-invalid={!!state.fieldErrors?.password}
        />
      </Field>
      <SubmitButton className="h-12 w-full" pendingLabel="Entrando…">
        Entrar
      </SubmitButton>
    </form>
  );
}
