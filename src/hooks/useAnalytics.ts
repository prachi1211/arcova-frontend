import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

// ─── Raw backend shapes (analytics.service.ts exact returns) ─────────────────

interface RawDashboardKPIs {
  totalRevenueCents: number;
  netRevenueCents: number;
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  avgBookingValueCents: number;
  occupancyRate: number;
  adr: number;
  revpar: number;
}

interface RawRevenuePoint {
  date: string;
  grossRevenueCents: number;
  netRevenueCents: number;
  bookingCount: number;
}

interface RawOccupancyPoint {
  date: string;
  occupancyPercent: number;
  bookedRooms: number;
  totalRooms: number;
}

// ─── Mapped types ─────────────────────────────────────────────────────────────

export interface DashboardKPIs {
  totalRevenueCents: number;
  netRevenueCents: number;
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  avgBookingValueCents: number;
  occupancyRate: number;
  adr: number;
  revpar: number;
}

export interface RevenuePoint {
  date: string;
  grossRevenueCents: number;
  netRevenueCents: number;
  bookingCount: number;
}

export interface OccupancyPoint {
  date: string;
  occupancyPercent: number;
  bookedRooms: number;
  totalRooms: number;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useAnalyticsDashboard(params?: { period?: string; propertyId?: string }) {
  return useQuery({
    queryKey: ['analytics', 'dashboard', params],
    queryFn: async (): Promise<DashboardKPIs> => {
      const { data } = await api.get('/analytics/dashboard', {
        params: { period: params?.period ?? '30d', ...(params?.propertyId ? { propertyId: params.propertyId } : {}) },
      });
      const raw = data as RawDashboardKPIs;
      return {
        totalRevenueCents: raw.totalRevenueCents,
        netRevenueCents: raw.netRevenueCents,
        totalBookings: raw.totalBookings,
        confirmedBookings: raw.confirmedBookings,
        cancelledBookings: raw.cancelledBookings,
        avgBookingValueCents: raw.avgBookingValueCents,
        occupancyRate: raw.occupancyRate,
        adr: raw.adr,
        revpar: raw.revpar,
      };
    },
  });
}

export function useRevenueTimeSeries(params?: { period?: string; propertyId?: string }) {
  return useQuery({
    queryKey: ['analytics', 'revenue', params],
    queryFn: async (): Promise<RevenuePoint[]> => {
      const { data } = await api.get('/analytics/revenue', {
        params: { granularity: 'day', period: params?.period ?? '30d', ...(params?.propertyId ? { propertyId: params.propertyId } : {}) },
      });
      return (data as RawRevenuePoint[]).map((r) => ({
        date: r.date,
        grossRevenueCents: r.grossRevenueCents,
        netRevenueCents: r.netRevenueCents,
        bookingCount: r.bookingCount,
      }));
    },
  });
}

export function useOccupancyTimeSeries(params?: { period?: string; propertyId?: string }) {
  return useQuery({
    queryKey: ['analytics', 'occupancy', params],
    queryFn: async (): Promise<OccupancyPoint[]> => {
      const { data } = await api.get('/analytics/occupancy', {
        params: { period: params?.period ?? '30d', ...(params?.propertyId ? { propertyId: params.propertyId } : {}) },
      });
      return (data as RawOccupancyPoint[]).map((r) => ({
        date: r.date,
        occupancyPercent: r.occupancyPercent,
        bookedRooms: r.bookedRooms,
        totalRooms: r.totalRooms,
      }));
    },
  });
}
