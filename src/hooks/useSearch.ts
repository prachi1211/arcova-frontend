import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { SearchResult, SearchParams } from '@/types';

// ─── Fallback image when backend hotel has no images ─────────────────────────

const CITY_IMAGES: Record<string, string> = {
  paris:     'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
  london:    'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80',
  tokyo:     'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80',
  bali:      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
  dubai:     'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
  barcelona: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=800&q=80',
  bangkok:   'https://images.unsplash.com/photo-1508009603885-50cf7c8dd0d5?auto=format&fit=crop&w=800&q=80',
  rome:      'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80',
  sydney:    'https://images.unsplash.com/photo-1524293568345-75d62c3664f7?auto=format&fit=crop&w=800&q=80',
  singapore: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80',
  'new york': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80',
};

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';

function getThumbnail(images: string[], city: string): string {
  if (images.length > 0) return images[0];
  return CITY_IMAGES[city.toLowerCase()] ?? FALLBACK_IMAGE;
}

// ─── Backend response types ───────────────────────────────────────────────────

interface BackendHotel {
  id: string;
  name: string;
  city: string;
  country: string;
  starRating: number;
  pricePerNight: { amount: number; currency: string };
  amenities: string[];
  images: string[];
  availableRooms: number;
  source: string;
  cancellationPolicy: string;
}

interface BackendRoomType {
  id: string;
  name: string;
  maxGuests: number;
  pricePerNight: number;
  amenities: string[];
}

// ─── Map backend hotel → frontend SearchResult ────────────────────────────────

function toSearchResult(h: BackendHotel): SearchResult {
  const priceCents = Math.round(h.pricePerNight.amount * 100);
  const thumb = getThumbnail(h.images, h.city);

  return {
    property: {
      id: h.id,
      hostId: '',
      name: h.name,
      description: '',
      city: h.city,
      country: h.country,
      address: '',
      starRating: h.starRating,
      thumbnailUrl: thumb,
      imageUrls: h.images.length > 0 ? h.images : [thumb],
      amenities: h.amenities,
      status: 'active',
      basePriceCents: priceCents,
      totalRooms: h.availableRooms,
      createdAt: '',
      updatedAt: '',
    },
    availableRoomTypes: [
      {
        id: `${h.id}-standard`,
        propertyId: h.id,
        name: 'Standard Room',
        description: '',
        maxGuests: 2,
        totalRooms: h.availableRooms,
        basePriceCents: priceCents,
        amenities: h.amenities.slice(0, 3),
        imageUrls: [],
        status: 'active',
        createdAt: '',
        updatedAt: '',
      },
    ],
    effectivePriceCents: priceCents,
    availableRooms: h.availableRooms,
  };
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useSearchHotels(params?: Partial<SearchParams>, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['search', 'hotels', params],
    queryFn: async (): Promise<SearchResult[]> => {
      const { data } = await api.get('/search/hotels', {
        params: {
          city: params?.destination,
          guests: params?.guests,
          // If multiple star filters, use the lowest selected as minimum
          rating: params?.stars && params.stars.length > 0 ? Math.min(...params.stars) : undefined,
        },
      });
      return (data.results as BackendHotel[]).map(toSearchResult);
    },
    enabled: options?.enabled ?? false,
  });
}

export function useHotelDetail(propertyId: string) {
  return useQuery({
    queryKey: ['search', 'hotel', propertyId],
    queryFn: async (): Promise<SearchResult | undefined> => {
      const { data } = await api.get(`/search/hotels/${propertyId}`);
      const h = data.property as BackendHotel;
      const priceCents = Math.round(h.pricePerNight.amount * 100);
      const thumb = getThumbnail(h.images, h.city);

      return {
        property: {
          id: h.id,
          hostId: '',
          name: h.name,
          description: (data.description as string) ?? '',
          city: h.city,
          country: h.country,
          address: '',
          starRating: h.starRating,
          thumbnailUrl: thumb,
          imageUrls: h.images.length > 0 ? h.images : [thumb],
          amenities: h.amenities,
          status: 'active',
          basePriceCents: priceCents,
          totalRooms: h.availableRooms,
          createdAt: '',
          updatedAt: '',
        },
        availableRoomTypes: (data.roomTypes as BackendRoomType[] ?? []).map((rt) => ({
          id: rt.id,
          propertyId: h.id,
          name: rt.name,
          description: '',
          maxGuests: rt.maxGuests,
          totalRooms: h.availableRooms,
          basePriceCents: Math.round(rt.pricePerNight * 100),
          amenities: rt.amenities,
          imageUrls: [],
          status: 'active' as const,
          createdAt: '',
          updatedAt: '',
        })),
        effectivePriceCents: priceCents,
        availableRooms: h.availableRooms,
      };
    },
    enabled: !!propertyId,
  });
}
