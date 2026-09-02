"use client";

import { useActionState } from "react";
import {
  createStaffAccount,
  type CreateStaffState,
} from "@/lib/actions/staff";

const initialState: CreateStaffState = { error: null, success: false };

export function StaffInviteForm() {
  const [state, formAction, isPending] = useActionState(
    createStaffAccount,
    initialState
  );

  return (
    <form action={formAction} className="space-y-4">
      <label className="block">
        <span className="text-sm text-ink/70">Full name</span>
        <input
          type="text"
          name="full_name"
          required
          className="mt-1 w-full rounded-sm border border-ink/20 bg-paper px-3 py-2"
        />
      </label>
      <label className="block">
        <span className="text-sm text-ink/70">Email</span>
        <input
          type="email"
          name="email"
          required
          className="mt-1 w-full rounded-sm border border-ink/20 bg-paper px-3 py-2"
        />
      </label>
      <label className="block">
        <span className="text-sm text-ink/70">Temporary password</span>
        <input
          type="password"
          name="password"
          required
          minLength={8}
          className="mt-1 w-full rounded-sm border border-ink/20 bg-paper px-3 py-2"
        />
      </label>
      <label className="block">
        <span className="text-sm text-ink/70">Role</span>
        <select
          name="role"
          defaultValue="receptionist"
          className="mt-1 w-full rounded-sm border border-ink/20 bg-paper px-3 py-2"
        >
          <option value="receptionist">Receptionist</option>
          <option value="manager">Manager</option>
        </select>
      </label>

      {state.error && (
        <p className="text-sm text-brick" role="alert">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="text-sm text-moss">
          Account created — share the password with them directly, outside
          this app.
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-sm bg-brick px-4 py-2 font-medium text-paper transition-colors hover:bg-brick-dark disabled:opacity-60"
      >
        {isPending ? "Creating…" : "Create account"}
      </button>
    </form>
  );
}
