import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Booking, BookingStatus } from '@/types';

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'bk-001',
    travellerId: 'usr-1',
    propertyId: 'prop-1',
    roomTypeId: 'rt-1',
    checkIn: '2026-03-15',
    checkOut: '2026-03-20',
    nights: 5,
    guests: 2,
    status: 'confirmed',
    totalPriceCents: 325000,
    netRevenueCents: 276250,
    bookedAt: '2026-02-10T10:00:00Z',
    property: {
      id: 'prop-1',
      name: 'The Grand Palazzo',
      city: 'Venice',
      country: 'Italy',
      starRating: 5,
      thumbnailUrl:
        'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80',
      amenities: ['wifi', 'spa', 'restaurant', 'bar', 'concierge'],
      status: 'active',
      basePriceCents: 65000,
    },
    roomType: { id: 'rt-1', name: 'Deluxe Canal Suite', maxGuests: 2 },
  },
  {
    id: 'bk-002',
    travellerId: 'usr-1',
    propertyId: 'prop-2',
    roomTypeId: 'rt-2',
    checkIn: '2026-04-22',
    checkOut: '2026-04-28',
    nights: 6,
    guests: 2,
    status: 'confirmed',
    totalPriceCents: 478000,
    netRevenueCents: 406300,
    bookedAt: '2026-02-15T14:30:00Z',
    property: {
      id: 'prop-2',
      name: 'Santorini Clifftop Resort',
      city: 'Oia',
      country: 'Greece',
      starRating: 5,
      thumbnailUrl:
        'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80',
      amenities: ['wifi', 'pool', 'spa', 'restaurant', 'concierge'],
      status: 'active',
      basePriceCents: 79000,
    },
    roomType: { id: 'rt-2', name: 'Premium Caldera View', maxGuests: 2 },
  },
  {
    id: 'bk-003',
    travellerId: 'usr-1',
    propertyId: 'prop-3',
    roomTypeId: 'rt-3',
    checkIn: '2026-05-01',
    checkOut: '2026-05-08',
    nights: 7,
    guests: 2,
    status: 'confirmed',
    totalPriceCents: 895000,
    netRevenueCents: 760750,
    bookedAt: '2026-02-20T09:15:00Z',
    property: {
      id: 'prop-3',
      name: 'Maldives Water Villa',
      city: 'Malé Atoll',
      country: 'Maldives',
      starRating: 5,
      thumbnailUrl:
        'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=800&q=80',
      amenities: ['wifi', 'pool', 'spa', 'restaurant', 'beach_access', 'room_service'],
      status: 'active',
      basePriceCents: 128000,
    },
    roomType: { id: 'rt-3', name: 'Overwater Bungalow', maxGuests: 2 },
  },
  {
    id: 'bk-004',
    travellerId: 'usr-1',
    propertyId: 'prop-4',
    roomTypeId: 'rt-4',
    checkIn: '2026-01-10',
    checkOut: '2026-01-14',
    nights: 4,
    guests: 3,
    status: 'completed',
    totalPriceCents: 289600,
    netRevenueCents: 246160,
    bookedAt: '2025-12-05T16:00:00Z',
    property: {
      id: 'prop-4',
      name: 'Alpine Lodge Zermatt',
      city: 'Zermatt',
      country: 'Switzerland',
      starRating: 4,
      thumbnailUrl:
        'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
      amenities: ['wifi', 'spa', 'restaurant', 'gym', 'parking'],
      status: 'active',
      basePriceCents: 72000,
    },
    roomType: { id: 'rt-4', name: 'Mountain View Junior Suite', maxGuests: 3 },
  },
  {
    id: 'bk-005',
    travellerId: 'usr-1',
    propertyId: 'prop-5',
    roomTypeId: 'rt-5',
    checkIn: '2025-11-20',
    checkOut: '2025-11-25',
    nights: 5,
    guests: 2,
    status: 'completed',
    totalPriceCents: 195000,
    netRevenueCents: 165750,
    bookedAt: '2025-10-15T11:30:00Z',
    property: {
      id: 'prop-5',
      name: 'Kyoto Zen Ryokan',
      city: 'Kyoto',
      country: 'Japan',
      starRating: 4,
      thumbnailUrl:
        'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=800&q=80',
      amenities: ['wifi', 'spa', 'restaurant'],
      status: 'active',
      basePriceCents: 39000,
    },
    roomType: { id: 'rt-5', name: 'Traditional Tatami Suite', maxGuests: 2 },
  },
  {
    id: 'bk-006',
    travellerId: 'usr-1',
    propertyId: 'prop-6',
    roomTypeId: 'rt-6',
    checkIn: '2025-08-12',
    checkOut: '2025-08-16',
    nights: 4,
    guests: 1,
    status: 'cancelled',
    totalPriceCents: 112000,
    netRevenueCents: 0,
    bookedAt: '2025-07-20T08:00:00Z',
    cancelledAt: '2025-07-25T12:00:00Z',
    property: {
      id: 'prop-6',
      name: 'Amalfi Cliffside Retreat',
      city: 'Amalfi',
      country: 'Italy',
      starRating: 4,
      thumbnailUrl:
        'https://images.unsplash.com/photo-1599579004939-7e1b42e56c9e?auto=format&fit=crop&w=800&q=80',
      amenities: ['wifi', 'pool', 'restaurant', 'bar'],
      status: 'active',
      basePriceCents: 28000,
    },
    roomType: { id: 'rt-6', name: 'Superior Sea View', maxGuests: 2 },
  },
];

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useBookings(statusFilter?: BookingStatus) {
  return useQuery({
    queryKey: ['bookings', statusFilter],
    queryFn: async (): Promise<Booking[]> => {
      // Simulate network delay
      await new Promise((r) => setTimeout(r, 600));
      if (statusFilter) {
        return MOCK_BOOKINGS.filter((b) => b.status === statusFilter);
      }
      return MOCK_BOOKINGS;
    },
  });
}

export function useRecentBookings(limit = 3) {
  return useQuery({
    queryKey: ['bookings', 'recent', limit],
    queryFn: async (): Promise<Booking[]> => {
      await new Promise((r) => setTimeout(r, 500));
      return MOCK_BOOKINGS.slice(0, limit);
    },
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: ['bookings', id],
    queryFn: async (): Promise<Booking | undefined> => {
      await new Promise((r) => setTimeout(r, 400));
      return MOCK_BOOKINGS.find((b) => b.id === id);
    },
    enabled: !!id,
  });
}

export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await new Promise((r) => setTimeout(r, 800));
      // In production: api.patch(`/bookings/${id}/cancel`)
      return { id };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

// ─── Traveller KPI derivation ─────────────────────────────────────────────────

export function useTravellerStats() {
  return useQuery({
    queryKey: ['traveller-stats'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 500));
      const upcoming = MOCK_BOOKINGS.filter((b) => b.status === 'confirmed').length;
      const total = MOCK_BOOKINGS.length;
      const spent = MOCK_BOOKINGS.filter((b) => b.status !== 'cancelled').reduce(
        (sum, b) => sum + b.totalPriceCents,
        0,
      );
      return { upcoming, total, spent };
    },
  });
}
