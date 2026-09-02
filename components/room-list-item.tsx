import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/pricing";
import type { Room } from "@/types/database";

export function RoomListItem({
  room,
  checkIn,
  checkOut,
}: {
  room: Room;
  checkIn?: string;
  checkOut?: string;
}) {
  const href =
    checkIn && checkOut
      ? `/rooms/${room.id}?check_in=${checkIn}&check_out=${checkOut}`
      : `/rooms/${room.id}`;

  return (
    <li className="flex flex-col gap-4 border-b border-ink/10 py-8 sm:flex-row">
      <div className="relative h-48 w-full flex-shrink-0 overflow-hidden sm:h-40 sm:w-56">
        {room.image_urls[0] ? (
          <Image
            src={room.image_urls[0]}
            alt={room.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-moss">
            <span className="font-display text-4xl text-paper/40">
              {room.name.charAt(0)}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <h2 className="font-display text-xl">{room.name}</h2>
          <p className="mt-1 text-sm text-ink/60">
            A {room.room_type} room for up to {room.capacity} guest
            {room.capacity === 1 ? "" : "s"}
          </p>
          {room.description && (
            <p className="mt-3 max-w-prose text-ink/80">{room.description}</p>
          )}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-lg">
            {formatPrice(room.price_per_night)}
            <span className="text-sm text-ink/60"> / night</span>
          </p>
          <Link
            href={href}
            className="rounded-sm border border-ink/20 px-4 py-2 text-sm font-medium transition-colors hover:border-ink/40"
          >
            View room
          </Link>
        </div>
      </div>
    </li>
  );
}
