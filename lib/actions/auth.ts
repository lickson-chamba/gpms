"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type SignInState = {
  error: string | null;
};

function safeRedirectTarget(path: string, fallback: string): string {
  // Only allow same-origin relative paths. "//evil.com" starts with "/" but
  // browsers treat it as protocol-relative — reject that too.
  if (path && path.startsWith("/") && !path.startsWith("//")) {
    return path;
  }
  return fallback;
}

export async function signIn(
  _prevState: SignInState,
  formData: FormData
): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirect_to") ?? "");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error?.code === "email_not_confirmed") {
    return {
      error:
        "This account's email isn't confirmed yet. In Supabase, run: update auth.users set email_confirmed_at = now() where email = '...'; then try again.",
    };
  }
  if (error || !data.user) {
    return { error: "Incorrect email or password." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", data.user.id)
    .single();

  if (!profile || !profile.is_active) {
    await supabase.auth.signOut();
    return { error: "This account doesn't have staff access." };
  }

  const fallback = profile.role === "manager" ? "/manager" : "/reception";
  redirect(safeRedirectTarget(redirectTo, fallback));
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
