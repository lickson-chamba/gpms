import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";
import { formatPrice } from "@/lib/pricing";

export default async function BookingConfirmationPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .rpc("get_booking_confirmation", { p_booking_id: bookingId })
    .maybeSingle();

  if (!data) {
    notFound();
  }

  const firstName = data.guest_name.split(" ")[0];

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-lg px-6 py-16">
        <h1 className="font-display text-3xl">You&apos;re booked, {firstName}</h1>
        <p className="mt-2 text-ink/70">
          {data.room_name} — {data.check_in} to {data.check_out}
        </p>

        <div className="mt-8 rounded-sm bg-moss px-6 py-8 text-center text-paper">
          <p className="text-sm text-paper/70">
            Give this code to reception when you arrive
          </p>
          <p className="mt-2 font-display text-5xl tracking-widest">
            {data.access_code}
          </p>
        </div>

        <dl className="mt-8 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink/60">Total</dt>
            <dd>{formatPrice(data.total_price)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink/60">Payment</dt>
            <dd>
              {data.payment_method === "online"
                ? data.payment_status === "paid"
                  ? "Paid online"
                  : "Online payment pending"
                : "Pay at the guesthouse on arrival"}
            </dd>
          </div>
        </dl>
      </main>
    </>
  );
}
