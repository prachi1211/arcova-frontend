import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Booking, BookingStatus, PropertyStatus } from '@/types';

// ─── Raw backend shape (snake_case + Supabase join) ───────────────────────────

interface RawProperty {
  id: string;
  name: string;
  city: string;
  country: string;
  star_rating: number;
  images: string[];
  amenities: string[];
  status: string;
}

interface RawRoomType {
  id: string;
  name: string;
  max_guests: number;
  base_price_cents: number;
}

interface RawBooking {
  id: string;
  traveller_id: string;
  property_id: string;
  room_type_id: string;
  check_in: string;
  check_out: string;
  num_guests: number;
  total_price_cents: number;
  net_revenue_cents: number;
  status: BookingStatus;
  booked_at: string;
  cancelled_at: string | null;
  properties: RawProperty | null;
  room_types: RawRoomType | null;
}

// ─── Transform ────────────────────────────────────────────────────────────────

function toBooking(raw: RawBooking): Booking {
  const nights = Math.round(
    (new Date(raw.check_out).getTime() - new Date(raw.check_in).getTime()) / 86400000,
  );

  const prop = raw.properties;
  const rt = raw.room_types;

  return {
    id: raw.id,
    travellerId: raw.traveller_id,
    propertyId: raw.property_id,
    roomTypeId: raw.room_type_id,
    checkIn: raw.check_in,
    checkOut: raw.check_out,
    nights,
    guests: raw.num_guests,
    status: raw.status,
    totalPriceCents: raw.total_price_cents,
    netRevenueCents: raw.net_revenue_cents,
    bookedAt: raw.booked_at,
    ...(raw.cancelled_at ? { cancelledAt: raw.cancelled_at } : {}),
    ...(prop
      ? {
          property: {
            id: prop.id,
            name: prop.name,
            city: prop.city,
            country: prop.country,
            starRating: prop.star_rating ?? 0,
            thumbnailUrl: prop.images?.[0] ?? '',
            amenities: prop.amenities ?? [],
            status: prop.status as PropertyStatus,
            basePriceCents: rt?.base_price_cents ?? 0,
          },
        }
      : {}),
    ...(rt
      ? {
          roomType: {
            id: rt.id,
            name: rt.name,
            maxGuests: rt.max_guests ?? 0,
          },
        }
      : {}),
  };
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useBookings(statusFilter?: BookingStatus) {
  return useQuery({
    queryKey: ['bookings', statusFilter],
    queryFn: async (): Promise<Booking[]> => {
      const params: Record<string, string | number> = { page: 0, limit: 50 };
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get('/bookings', { params });
      return (data.results as RawBooking[]).map(toBooking);
    },
  });
}

export function useRecentBookings(limit = 3) {
  return useQuery({
    queryKey: ['bookings', 'recent', limit],
    queryFn: async (): Promise<Booking[]> => {
      const { data } = await api.get('/bookings', { params: { page: 0, limit } });
      return (data.results as RawBooking[]).map(toBooking);
    },
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: ['bookings', id],
    queryFn: async (): Promise<Booking> => {
      const { data } = await api.get(`/bookings/${id}`);
      return toBooking(data as RawBooking);
    },
    enabled: !!id,
  });
}

export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch(`/bookings/${id}/cancel`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      property_id: string;
      room_type_id: string;
      check_in: string;
      check_out: string;
      num_guests: number;
      num_rooms: number;
      special_requests?: string;
    }): Promise<{ id: string; total_price_cents: number }> => {
      const { data } = await api.post('/bookings', input);
      return data as { id: string; total_price_cents: number };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      qc.invalidateQueries({ queryKey: ['traveller-stats'] });
    },
  });
}

export function useCreatePaymentIntent() {
  return useMutation({
    mutationFn: async (bookingId: string): Promise<{ clientSecret: string; amountCents: number }> => {
      const { data } = await api.post('/payments/create-intent', { booking_id: bookingId });
      return {
        clientSecret: data.clientSecret as string,
        amountCents: (data.payment as { amount_cents: number }).amount_cents,
      };
    },
  });
}

// ─── Traveller KPI derivation ─────────────────────────────────────────────────

export function useTravellerStats() {
  return useQuery({
    queryKey: ['traveller-stats'],
    queryFn: async (): Promise<{ upcoming: number; total: number; spent: number }> => {
      const { data } = await api.get('/bookings/traveller-stats');
      return data as { upcoming: number; total: number; spent: number };
    },
  });
}
