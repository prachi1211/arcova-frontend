import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Availability } from '@/types';

interface RawAvailability {
  id: string;
  room_type_id: string;
  date: string;
  available_rooms: number;
  is_closed: boolean;
  override_price_cents: number | null;
}

function toAvailability(raw: RawAvailability): Availability {
  return {
    id: raw.id,
    roomTypeId: raw.room_type_id,
    date: raw.date,
    availableRooms: raw.available_rooms,
    isClosed: raw.is_closed,
    overridePriceCents: raw.override_price_cents ?? undefined,
  };
}

export function useAvailability(params: { propertyId: string; start: string; end: string }) {
  return useQuery({
    queryKey: ['availability', params],
    queryFn: async (): Promise<Availability[]> => {
      const { data } = await api.get('/availability', { params });
      return (data as RawAvailability[]).map(toAvailability);
    },
    enabled: !!(params.propertyId && params.start && params.end),
  });
}

export function useBulkUpdateAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      entries: {
        room_type_id: string;
        date: string;
        available_rooms: number;
        is_closed?: boolean;
      }[];
    }): Promise<unknown> => {
      const { data } = await api.put('/availability/bulk', input);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['availability'] });
    },
  });
}
