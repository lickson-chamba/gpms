import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";

export default async function ReceptionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single()
    : { data: null };

  return (
    <div>
      <header className="flex items-center justify-between border-b border-ink/10 px-6 py-4">
        <p className="text-sm text-ink/50">Reception</p>
        <div className="flex items-center gap-4">
          {profile?.full_name && (
            <span className="text-sm text-ink/50">{profile.full_name}</span>
          )}
          <form action={signOut}>
            <button type="submit" className="text-sm text-ink/60 underline">
              Sign out
            </button>
          </form>
        </div>
      </header>
      {children}
    </div>
  );
}
