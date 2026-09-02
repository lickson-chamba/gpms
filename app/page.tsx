import { createClient } from "@/lib/supabase/server";
import { DateSearchForm } from "@/components/date-search-form";
import { RoomListItem } from "@/components/room-list-item";
import { SiteHeader } from "@/components/site-header";
import type { Room } from "@/types/database";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ check_in?: string; check_out?: string }>;
}) {
  const { check_in: checkIn, check_out: checkOut } = await searchParams;
  const supabase = await createClient();

  const hasValidRange = !!checkIn && !!checkOut && checkOut > checkIn;

  const { data: rooms } = hasValidRange
    ? await supabase.rpc("available_rooms", {
        p_check_in: checkIn,
        p_check_out: checkOut,
      })
    : await supabase
        .from("rooms")
        .select("*")
        .eq("is_active", true)
        .order("price_per_night", { ascending: true });

  const roomList = (rooms ?? []) as Room[];

  return (
    <>
      <SiteHeader />
      <section className="bg-moss px-6 py-16 text-paper">
        <div className="mx-auto max-w-4xl">
          <h1 className="font-display text-4xl leading-tight sm:text-5xl">
            A room, ready when you arrive
          </h1>
          <p className="mt-4 max-w-md text-paper/80">
            Pick your dates and book directly. You&apos;ll get a code to
            give reception when you get here.
          </p>
          <div className="mt-8">
            <DateSearchForm
              defaultCheckIn={checkIn}
              defaultCheckOut={checkOut}
            />
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-4xl px-6 py-12">
        {hasValidRange && (
          <p className="mb-6 text-sm text-ink/60">
            {roomList.length > 0
              ? `${roomList.length} room${
                  roomList.length > 1 ? "s" : ""
                } available, ${checkIn} to ${checkOut}`
              : `Nothing available ${checkIn} to ${checkOut} — try different dates.`}
          </p>
        )}

        {roomList.length > 0 ? (
          <ul>
            {roomList.map((room) => (
              <RoomListItem
                key={room.id}
                room={room}
                checkIn={checkIn}
                checkOut={checkOut}
              />
            ))}
          </ul>
        ) : (
          !hasValidRange && (
            <p className="text-ink/60">
              No rooms published yet — add some from the manager dashboard.
            </p>
          )
        )}
      </main>
    </>
  );
}
