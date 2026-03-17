import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Property, RoomType, PropertyStatus } from '@/types';

// ─── Raw backend shapes ───────────────────────────────────────────────────────

interface RawProperty {
  id: string;
  host_id: string;
  name: string;
  description: string | null;
  city: string;
  country: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  star_rating: number | null;
  property_type: string | null;
  amenities: string[];
  images: string[];
  status: string;
  total_rooms: number;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  room_types?: RawRoomType[];
}

interface RawRoomType {
  id: string;
  property_id: string;
  name: string;
  description: string | null;
  max_guests: number;
  bed_type: string | null;
  base_price_cents: number;
  total_inventory: number;
  amenities: string[];
  images: string[] | null;
  status: string;
  created_at: string;
  updated_at: string;
}

// ─── Mappers ─────────────────────────────────────────────────────────────────

function toProperty(raw: RawProperty): Property {
  return {
    id: raw.id,
    hostId: raw.host_id,
    name: raw.name,
    description: raw.description ?? '',
    city: raw.city,
    country: raw.country,
    address: raw.address ?? '',
    latitude: raw.latitude ?? undefined,
    longitude: raw.longitude ?? undefined,
    starRating: raw.star_rating ?? 0,
    thumbnailUrl: raw.images?.[0] ?? '',
    imageUrls: raw.images ?? [],
    amenities: raw.amenities ?? [],
    status: raw.status as PropertyStatus,
    basePriceCents: 0,
    totalRooms: raw.total_rooms ?? 0,
    rejectionReason: raw.rejection_reason ?? undefined,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

function toRoomType(raw: RawRoomType): RoomType {
  return {
    id: raw.id,
    propertyId: raw.property_id,
    name: raw.name,
    description: raw.description ?? '',
    maxGuests: raw.max_guests,
    totalRooms: raw.total_inventory,
    basePriceCents: raw.base_price_cents,
    amenities: raw.amenities ?? [],
    imageUrls: raw.images ?? [],
    status: raw.status as 'active' | 'inactive',
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useProperties(params?: { status?: string }) {
  return useQuery({
    queryKey: ['properties', params],
    queryFn: async (): Promise<Property[]> => {
      const { data } = await api.get('/properties', { params: { page: 0, limit: 50, ...params } });
      return (data.results as RawProperty[]).map(toProperty);
    },
  });
}

export function useProperty(id: string) {
  return useQuery({
    queryKey: ['properties', id],
    queryFn: async (): Promise<Property & { roomTypes: RoomType[] }> => {
      const { data } = await api.get(`/properties/${id}`);
      const raw = data as RawProperty;
      return {
        ...toProperty(raw),
        roomTypes: (raw.room_types ?? []).map(toRoomType),
      };
    },
    enabled: !!id,
  });
}

export function useCreateProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      name: string;
      description?: string;
      city: string;
      country: string;
      address?: string;
      latitude?: number;
      longitude?: number;
      star_rating?: number;
      property_type?: string;
      amenities?: string[];
      images?: string[];
      total_rooms?: number;
    }): Promise<Property> => {
      const { data } = await api.post('/properties', input);
      return toProperty(data as RawProperty);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}

export function useUpdateProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: {
      id: string;
      name?: string;
      description?: string;
      city?: string;
      country?: string;
      address?: string;
      latitude?: number;
      longitude?: number;
      star_rating?: number;
      property_type?: string;
      amenities?: string[];
      images?: string[];
      total_rooms?: number;
    }): Promise<Property> => {
      const { data } = await api.put(`/properties/${id}`, input);
      return toProperty(data as RawProperty);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['properties'] });
      qc.invalidateQueries({ queryKey: ['properties', vars.id] });
    },
  });
}

export function useCreateRoomType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      propertyId,
      ...input
    }: {
      propertyId: string;
      name: string;
      description?: string;
      max_guests?: number;
      bed_type?: string;
      base_price_cents: number;
      total_inventory?: number;
      amenities?: string[];
    }): Promise<RoomType> => {
      const { data } = await api.post(`/properties/${propertyId}/rooms`, input);
      return toRoomType(data as RawRoomType);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['properties', vars.propertyId] });
    },
  });
}

export function useUpdateRoomType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      propertyId,
      roomId,
      ...input
    }: {
      propertyId: string;
      roomId: string;
      name?: string;
      description?: string;
      max_guests?: number;
      bed_type?: string;
      base_price_cents?: number;
      total_inventory?: number;
      amenities?: string[];
      status?: 'active' | 'inactive';
    }): Promise<RoomType> => {
      const { data } = await api.put(`/properties/${propertyId}/rooms/${roomId}`, input);
      return toRoomType(data as RawRoomType);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['properties', vars.propertyId] });
    },
  });
}
