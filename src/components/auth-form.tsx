"use client";

import { useActionState } from "react";
import type { FormState } from "@/lib/actions";

type AuthFormProps = {
  mode: "login" | "register";
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  callbackUrl?: string;
};

const initialState: FormState = {};

export function AuthForm({ mode, action, callbackUrl }: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form className="form" action={formAction}>
      {state.error && <div className="alert alert-error">{state.error}</div>}
      {callbackUrl && (
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
      )}
      {mode === "register" && (
        <label>
          Imię / nazwa
          <input name="name" type="text" required minLength={2} autoComplete="name" />
        </label>
      )}
      <label>
        E-mail
        <input name="email" type="email" required autoComplete="email" />
      </label>
      <label>
        Hasło
        <input
          name="password"
          type="password"
          required
          minLength={mode === "register" ? 6 : 1}
          autoComplete={mode === "register" ? "new-password" : "current-password"}
        />
      </label>
      <button className="btn" type="submit" disabled={pending}>
        {pending
          ? "Przetwarzanie…"
          : mode === "login"
            ? "Zaloguj się"
            : "Utwórz konto"}
      </button>
    </form>
  );
}
