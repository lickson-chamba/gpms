"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { nightsBetween } from "@/lib/pricing";

export type CreateBookingState = {
  error: string | null;
};

export async function createBooking(
  _prevState: CreateBookingState,
  formData: FormData
): Promise<CreateBookingState> {
  const roomId = String(formData.get("room_id") ?? "");
  const checkIn = String(formData.get("check_in") ?? "");
  const checkOut = String(formData.get("check_out") ?? "");
  const guestName = String(formData.get("guest_name") ?? "").trim();
  const guestEmail = String(formData.get("guest_email") ?? "").trim();
  const guestPhone = String(formData.get("guest_phone") ?? "").trim();
  const paymentMethod = String(formData.get("payment_method") ?? "online");

  if (
    !roomId ||
    !checkIn ||
    !checkOut ||
    !guestName ||
    !guestEmail ||
    !guestPhone
  ) {
    return { error: "Please fill in every field." };
  }

  const today = new Date().toISOString().slice(0, 10);
  if (checkIn < today) {
    return { error: "Check-in can't be in the past." };
  }
  if (checkOut <= checkIn) {
    return { error: "Check-out must be after check-in." };
  }
  if (paymentMethod !== "online" && paymentMethod !== "at_property") {
    return { error: "Pick a valid payment method." };
  }

  const supabase = await createClient();

  // Re-fetch the room's price server-side — never trust a client-submitted
  // total.
  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select("id, price_per_night, is_active")
    .eq("id", roomId)
    .single();

  if (roomError || !room || !room.is_active) {
    return { error: "That room isn't available anymore." };
  }

  const nights = nightsBetween(checkIn, checkOut);
  const totalPrice = Number((nights * room.price_per_night).toFixed(2));

  const { data: booking, error: insertError } = await supabase
    .from("bookings")
    .insert({
      room_id: roomId,
      guest_name: guestName,
      guest_email: guestEmail,
      guest_phone: guestPhone,
      check_in: checkIn,
      check_out: checkOut,
      payment_method: paymentMethod,
      total_price: totalPrice,
    })
    .select("id")
    .single();

  if (insertError || !booking) {
    // Most likely cause: enforce_room_availability rejected it because
    // someone else booked the same room for an overlapping range between
    // this guest loading the page and submitting the form.
    return {
      error:
        "Sorry — that room was just booked for those dates. Try different dates or another room.",
    };
  }

  redirect(`/booking/confirmation/${booking.id}`);
}
