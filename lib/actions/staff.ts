"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type CreateStaffState = {
  error: string | null;
  success: boolean;
};

export async function createStaffAccount(
  _prevState: CreateStaffState,
  formData: FormData
): Promise<CreateStaffState> {
  // Defense in depth: middleware already keeps non-managers out of
  // /manager/*, but a Server Action is a callable endpoint in its own
  // right, so it re-checks the caller's role itself rather than trusting
  // the route it happened to be rendered from.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in.", success: false };
  }

  const { data: callerProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (callerProfile?.role !== "manager") {
    return { error: "Only managers can add staff.", success: false };
  }

  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "receptionist");

  if (!fullName || !email || !password) {
    return { error: "Fill in every field.", success: false };
  }
  if (password.length < 8) {
    return {
      error: "Password needs to be at least 8 characters.",
      success: false,
    };
  }
  if (role !== "receptionist" && role !== "manager") {
    return { error: "Pick a valid role.", success: false };
  }

  // Bypasses RLS — that's expected and safe here, since the role check
  // above already gated who can reach this point.
  const admin = createAdminClient();
  const { error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role },
  });

  if (createError) {
    return { error: createError.message, success: false };
  }

  revalidatePath("/manager/staff");
  return { error: null, success: true };
}
