export type BookingAdmin = {
  id: string;
  profile_id: string;
  slug: string;
  display_name: string;
  booking_title: string;
  bio: string | null;
  avatar_url: string | null;
  timezone: string;
  active: boolean;
  accepting_bookings: boolean;
};

export type BookingEventType = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  duration_minutes: 5 | 10 | 15 | 30;
};

export type BookingSlot = {
  start: string;
  end: string;
  label: string;
};
