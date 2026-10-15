"use client";

import { startTransition, useActionState, type FormEvent } from "react";
import { idleState, type ActionState } from "./actions";

/**
 * Envía un formulario a una Server Action sin que React lo limpie al
 * terminar: si hay errores, el personal no pierde lo que escribió.
 */
export function useActionForm(action: (prev: ActionState, formData: FormData) => Promise<ActionState>) {
  const [state, dispatch, pending] = useActionState(action, idleState);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => dispatch(formData));
  }

  return { state, pending, onSubmit, errors: state.fieldErrors ?? {} };
}
