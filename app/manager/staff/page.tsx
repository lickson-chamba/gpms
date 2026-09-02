import { createClient } from "@/lib/supabase/server";
import { StaffInviteForm } from "@/components/staff-invite-form";

export default async function ManagerStaffPage() {
  const supabase = await createClient();
  const { data: staff } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, is_active, created_at")
    .order("created_at", { ascending: true });

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-display text-2xl">Staff</h1>

      <ul className="mt-6 divide-y divide-ink/10">
        {(staff ?? []).map((person) => (
          <li
            key={person.id}
            className="flex items-center justify-between py-3"
          >
            <div>
              <p>{person.full_name || person.email}</p>
              <p className="text-sm text-ink/50">{person.email}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-ink/60">
              <span>{person.role}</span>
              {!person.is_active && (
                <span className="text-brick">inactive</span>
              )}
            </div>
          </li>
        ))}
        {(staff ?? []).length === 0 && (
          <li className="py-3 text-ink/60">No staff accounts yet.</li>
        )}
      </ul>

      <div className="mt-10 border-t border-ink/10 pt-8">
        <h2 className="font-display text-xl">Add staff</h2>
        <div className="mt-4 max-w-sm">
          <StaffInviteForm />
        </div>
      </div>
    </main>
  );
}
