"use client";

import { useActionState, useState } from "react";
import { createBooking, type CreateBookingState } from "@/lib/actions/bookings";
import { nightsBetween, formatPrice } from "@/lib/pricing";

const initialState: CreateBookingState = { error: null };

export function BookingForm({
  roomId,
  pricePerNight,
  defaultCheckIn,
  defaultCheckOut,
}: {
  roomId: string;
  pricePerNight: number;
  defaultCheckIn?: string;
  defaultCheckOut?: string;
}) {
  const [state, formAction, isPending] = useActionState(
    createBooking,
    initialState
  );
  const [checkIn, setCheckIn] = useState(defaultCheckIn ?? "");
  const [checkOut, setCheckOut] = useState(defaultCheckOut ?? "");

  const nights =
    checkIn && checkOut && checkOut > checkIn
      ? nightsBetween(checkIn, checkOut)
      : 0;
  const total = nights * pricePerNight;

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="room_id" value={roomId} />

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm text-ink/70">Check-in</span>
          <input
            type="date"
            name="check_in"
            required
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="mt-1 w-full rounded-sm border border-ink/20 bg-paper px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-sm text-ink/70">Check-out</span>
          <input
            type="date"
            name="check_out"
            required
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="mt-1 w-full rounded-sm border border-ink/20 bg-paper px-3 py-2"
          />
        </label>
      </div>

      {nights > 0 && (
        <p className="text-sm text-ink/70">
          {nights} night{nights > 1 ? "s" : ""}: {formatPrice(total)} total
        </p>
      )}

      <label className="block">
        <span className="text-sm text-ink/70">Full name</span>
        <input
          type="text"
          name="guest_name"
          required
          className="mt-1 w-full rounded-sm border border-ink/20 bg-paper px-3 py-2"
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm text-ink/70">Email</span>
          <input
            type="email"
            name="guest_email"
            required
            className="mt-1 w-full rounded-sm border border-ink/20 bg-paper px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-sm text-ink/70">WhatsApp / phone</span>
          <input
            type="tel"
            name="guest_phone"
            required
            className="mt-1 w-full rounded-sm border border-ink/20 bg-paper px-3 py-2"
          />
        </label>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm text-ink/70">Payment</legend>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="payment_method"
            value="online"
            defaultChecked
          />
          <span>Pay online now</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" name="payment_method" value="at_property" />
          <span>Pay at the guesthouse on arrival</span>
        </label>
      </fieldset>
      {/* "Pay online now" doesn't charge anything yet — that's phase 3.
          Either option just records payment_method and creates the
          booking as unpaid for now. */}

      {state.error && (
        <p className="text-sm text-brick" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-sm bg-brick px-4 py-3 font-medium text-paper transition-colors hover:bg-brick-dark disabled:opacity-60"
      >
        {isPending ? "Booking…" : "Reserve this room"}
      </button>
    </form>
  );
}
