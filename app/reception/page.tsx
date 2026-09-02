export default function ReceptionDashboardPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-medium">Reception dashboard</h1>
      <p className="mt-3 text-neutral-600">
        You&apos;re signed in and this route is properly gated — only active
        receptionist and manager accounts get here. Access-code lookup,
        check-in/check-out, and the room-status board are phase 5.
      </p>
    </main>
  );
}
