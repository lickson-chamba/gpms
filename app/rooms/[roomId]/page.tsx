import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";
import { BookingForm } from "@/components/booking-form";
import { formatPrice } from "@/lib/pricing";

export default async function RoomDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ roomId: string }>;
  searchParams: Promise<{ check_in?: string; check_out?: string }>;
}) {
  const { roomId } = await params;
  const { check_in: checkIn, check_out: checkOut } = await searchParams;

  const supabase = await createClient();
  const { data: room } = await supabase
    .from("rooms")
    .select("*")
    .eq("id", roomId)
    .eq("is_active", true)
    .single();

  if (!room) {
    notFound();
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="grid gap-10 sm:grid-cols-2">
          <div>
            <div className="relative h-64 w-full overflow-hidden sm:h-80">
              {room.image_urls[0] ? (
                <Image
                  src={room.image_urls[0]}
                  alt={room.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-moss">
                  <span className="font-display text-6xl text-paper/40">
                    {room.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <h1 className="mt-6 font-display text-3xl">{room.name}</h1>
            <p className="mt-1 text-ink/60">
              A {room.room_type} room for up to {room.capacity} guest
              {room.capacity === 1 ? "" : "s"}
            </p>
            {room.description && (
              <p className="mt-4 max-w-prose text-ink/80">
                {room.description}
              </p>
            )}
            <p className="mt-4 text-lg">
              {formatPrice(room.price_per_night)}
              <span className="text-sm text-ink/60"> / night</span>
            </p>
          </div>

          <div className="bg-moss/5 rounded-sm p-6">
            <h2 className="font-display text-xl">Reserve this room</h2>
            <div className="mt-4">
              <BookingForm
                roomId={room.id}
                pricePerNight={room.price_per_night}
                defaultCheckIn={checkIn}
                defaultCheckOut={checkOut}
              />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
