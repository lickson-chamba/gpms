import Link from "next/link";

export default function ManagerDashboardPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-medium">Manager dashboard</h1>
      <p className="mt-3 text-neutral-600">
        Room inventory and reporting are phase 6. Staff accounts are already
        working —{" "}
        <Link href="/manager/staff" className="text-brick underline">
          manage staff
        </Link>
        .
      </p>
    </main>
  );
}
