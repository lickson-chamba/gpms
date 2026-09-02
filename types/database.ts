// Hand-written to match supabase/migrations/0001_init.sql.
// Once the project is linked to Supabase, prefer generating these instead:
//   supabase gen types typescript --linked > types/database.ts

export type StaffRole = "receptionist" | "manager";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "checked_in"
  | "checked_out"
  | "cancelled";

export type PaymentStatus = "unpaid" | "paid" | "refunded";

export type PaymentMethodType = "online" | "at_property";

export interface Profile {
  id: string;
  full_name: string;
  email: string | null;
  role: StaffRole;
  phone: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Room {
  id: string;
  name: string;
  room_type: string;
  description: string | null;
  capacity: number;
  price_per_night: number;
  image_urls: string[];
  is_active: boolean;
  created_at: string;
}

export interface Booking {
  id: string;
  room_id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in: string; // date, ISO "YYYY-MM-DD"
  check_out: string; // date, ISO "YYYY-MM-DD"
  status: BookingStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethodType;
  total_price: number;
  access_code: string;
  access_code_redeemed_at: string | null;
  checked_in_at: string | null;
  checked_out_at: string | null;
  checked_in_by: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  provider: string | null;
  provider_reference: string | null;
  status: PaymentStatus;
  paid_at: string | null;
  created_at: string;
}
