import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
  AdminProperty,
  AdminBooking,
  PlatformStats,
  PaginatedResponse,
  PropertyStatus,
  UserRole,
} from '@/types';

// ─── Raw shapes from backend ──────────────────────────────────────────────────

interface RawAdminProperty {
  id: string;
  name: string;
  city: string;
  country: string;
  status: PropertyStatus;
  star_rating: number | null;
  total_rooms: number;
  rejection_reason: string | null;
  created_at: string;
  host: { id: string; full_name: string | null; email: string } | null;
}

interface RawAdminBooking {
  id: string;
  check_in: string;
  check_out: string;
  nights: number;
  total_price_cents: number;
  status: string;
  booked_at: string;
  traveller: { id: string; full_name: string | null; email: string } | null;
  property: { id: string; name: string; city: string } | null;
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

function toAdminProperty(raw: RawAdminProperty): AdminProperty {
  return {
    id: raw.id,
    name: raw.name,
    city: raw.city,
    country: raw.country,
    status: raw.status,
    starRating: raw.star_rating,
    totalRooms: raw.total_rooms,
    rejectionReason: raw.rejection_reason,
    createdAt: raw.created_at,
    host: raw.host
      ? { id: raw.host.id, fullName: raw.host.full_name, email: raw.host.email }
      : null,
  };
}

function toAdminBooking(raw: RawAdminBooking): AdminBooking {
  return {
    id: raw.id,
    checkIn: raw.check_in,
    checkOut: raw.check_out,
    nights: raw.nights,
    totalPriceCents: raw.total_price_cents,
    status: raw.status,
    bookedAt: raw.booked_at,
    traveller: raw.traveller
      ? { id: raw.traveller.id, fullName: raw.traveller.full_name, email: raw.traveller.email }
      : null,
    property: raw.property
      ? { id: raw.property.id, name: raw.property.name, city: raw.property.city }
      : null,
  };
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async (): Promise<PlatformStats> => {
      const { data } = await api.get('/admin/stats');
      return data as PlatformStats;
    },
  });
}

export function useAdminProperties(params?: { status?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['admin', 'properties', params],
    queryFn: async (): Promise<PaginatedResponse<AdminProperty>> => {
      const { data } = await api.get('/admin/properties', { params });
      return {
        results: (data.results as RawAdminProperty[]).map(toAdminProperty),
        totalCount: data.totalCount as number,
        page: data.page as number,
        pageSize: data.pageSize as number,
        hasNextPage: data.hasNextPage as boolean,
      };
    },
  });
}

export function useAdminUsers(params?: { role?: string; search?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: async () => {
      const { data } = await api.get('/admin/users', { params });
      return data as PaginatedResponse<{
        id: string;
        email: string;
        full_name: string | null;
        role: UserRole;
        created_at: string;
        company_name: string | null;
      }>;
    },
  });
}

export function useAdminBookings(params?: { status?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['admin', 'bookings', params],
    queryFn: async (): Promise<PaginatedResponse<AdminBooking>> => {
      const { data } = await api.get('/admin/bookings', { params });
      return {
        results: (data.results as RawAdminBooking[]).map(toAdminBooking),
        totalCount: data.totalCount as number,
        page: data.page as number,
        pageSize: data.pageSize as number,
        hasNextPage: data.hasNextPage as boolean,
      };
    },
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useUpdatePropertyStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
      rejectionReason,
    }: {
      id: string;
      status: PropertyStatus;
      rejectionReason?: string;
    }) => {
      const { data } = await api.patch(`/admin/properties/${id}/status`, {
        status,
        rejection_reason: rejectionReason,
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'properties'] });
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}

export function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: UserRole }) => {
      const { data } = await api.patch(`/admin/users/${id}/role`, { role });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}
