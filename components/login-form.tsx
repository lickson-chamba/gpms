"use client";

import { useActionState } from "react";
import { signIn, type SignInState } from "@/lib/actions/auth";

const initialState: SignInState = { error: null };

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [state, formAction, isPending] = useActionState(
    signIn,
    initialState
  );

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="redirect_to" value={redirectTo ?? ""} />

      <label className="block">
        <span className="text-sm text-ink/70">Email</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className="mt-1 w-full rounded-sm border border-ink/20 bg-paper px-3 py-2"
        />
      </label>

      <label className="block">
        <span className="text-sm text-ink/70">Password</span>
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className="mt-1 w-full rounded-sm border border-ink/20 bg-paper px-3 py-2"
        />
      </label>

      {state.error && (
        <p className="text-sm text-brick" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-sm bg-brick px-4 py-3 font-medium text-paper transition-colors hover:bg-brick-dark disabled:opacity-60"
      >
        {isPending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
