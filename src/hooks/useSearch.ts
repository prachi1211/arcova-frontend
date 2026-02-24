import { useQuery } from '@tanstack/react-query';
import type { SearchResult, SearchParams } from '@/types';

// ─── Mock search results ─────────────────────────────────────────────────────

const ALL_RESULTS: SearchResult[] = [
  {
    property: {
      id: 'prop-1',
      hostId: 'host-1',
      name: 'The Grand Palazzo',
      description:
        'An iconic 5-star palazzo on the Grand Canal offering unparalleled views of Venice. Combining centuries of history with modern luxury, it remains the jewel of Venetian hospitality.',
      city: 'Venice',
      country: 'Italy',
      address: 'Riva degli Schiavoni, 4196, Venice',
      starRating: 5,
      thumbnailUrl:
        'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80',
      imageUrls: [
        'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
      ],
      amenities: ['wifi', 'spa', 'restaurant', 'bar', 'concierge', 'room_service'],
      status: 'active',
      basePriceCents: 65000,
      totalRooms: 48,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    availableRoomTypes: [
      {
        id: 'rt-1a',
        propertyId: 'prop-1',
        name: 'Classic Room',
        description: 'Elegantly appointed room with courtyard views.',
        maxGuests: 2,
        totalRooms: 12,
        basePriceCents: 45000,
        amenities: ['wifi', 'minibar', 'safe'],
        imageUrls: [],
        status: 'active',
        createdAt: '',
        updatedAt: '',
      },
      {
        id: 'rt-1b',
        propertyId: 'prop-1',
        name: 'Deluxe Canal Suite',
        description: 'Spacious suite with panoramic Grand Canal views.',
        maxGuests: 2,
        totalRooms: 8,
        basePriceCents: 65000,
        amenities: ['wifi', 'minibar', 'safe', 'butler'],
        imageUrls: [],
        status: 'active',
        createdAt: '',
        updatedAt: '',
      },
    ],
    effectivePriceCents: 45000,
    availableRooms: 14,
  },
  {
    property: {
      id: 'prop-2',
      hostId: 'host-2',
      name: 'Santorini Clifftop Resort',
      description:
        'Perched on the volcanic cliffs of Oia, this sun-drenched resort offers the most photographed sunsets in the Aegean. Whitewashed suites with private plunge pools.',
      city: 'Oia',
      country: 'Greece',
      address: 'Oia, Santorini 847 02, Greece',
      starRating: 5,
      thumbnailUrl:
        'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80',
      imageUrls: [
        'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1602002418082-a4443978a5b9?auto=format&fit=crop&w=1200&q=80',
      ],
      amenities: ['wifi', 'pool', 'spa', 'restaurant', 'concierge', 'airport_shuttle'],
      status: 'active',
      basePriceCents: 79000,
      totalRooms: 32,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    availableRoomTypes: [
      {
        id: 'rt-2a',
        propertyId: 'prop-2',
        name: 'Caldera Suite',
        description: 'Sweeping views of the caldera with private terrace.',
        maxGuests: 2,
        totalRooms: 10,
        basePriceCents: 79000,
        amenities: ['wifi', 'plunge_pool', 'minibar'],
        imageUrls: [],
        status: 'active',
        createdAt: '',
        updatedAt: '',
      },
    ],
    effectivePriceCents: 79000,
    availableRooms: 7,
  },
  {
    property: {
      id: 'prop-3',
      hostId: 'host-1',
      name: 'Maldives Water Villa',
      description:
        'Suspended over turquoise lagoons, these overwater villas bring you into direct communion with the Indian Ocean. Glass floor panels reveal the living reef below.',
      city: 'Malé Atoll',
      country: 'Maldives',
      address: 'North Malé Atoll, Maldives',
      starRating: 5,
      thumbnailUrl:
        'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=800&q=80',
      imageUrls: [
        'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1540202404-1b927e27fa8b?auto=format&fit=crop&w=1200&q=80',
      ],
      amenities: ['wifi', 'pool', 'spa', 'restaurant', 'beach_access', 'room_service', 'concierge'],
      status: 'active',
      basePriceCents: 128000,
      totalRooms: 20,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    availableRoomTypes: [
      {
        id: 'rt-3a',
        propertyId: 'prop-3',
        name: 'Overwater Bungalow',
        description: 'Private deck with direct lagoon access and glass floor.',
        maxGuests: 2,
        totalRooms: 12,
        basePriceCents: 128000,
        amenities: ['wifi', 'pool', 'minibar', 'butler'],
        imageUrls: [],
        status: 'active',
        createdAt: '',
        updatedAt: '',
      },
    ],
    effectivePriceCents: 128000,
    availableRooms: 5,
  },
  {
    property: {
      id: 'prop-4',
      hostId: 'host-2',
      name: 'Alpine Lodge Zermatt',
      description:
        'At the foot of the Matterhorn, this timber-clad chalet delivers mountain luxury without pretension. The sauna, ski storage, and fondue evenings make every stay memorable.',
      city: 'Zermatt',
      country: 'Switzerland',
      address: 'Bahnhofstrasse 25, 3920 Zermatt',
      starRating: 4,
      thumbnailUrl:
        'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
      imageUrls: [
        'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
      ],
      amenities: ['wifi', 'spa', 'restaurant', 'gym', 'parking', 'airport_shuttle'],
      status: 'active',
      basePriceCents: 42000,
      totalRooms: 38,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    availableRoomTypes: [
      {
        id: 'rt-4a',
        propertyId: 'prop-4',
        name: 'Mountain View Room',
        description: 'Cosy timber room with Matterhorn views.',
        maxGuests: 2,
        totalRooms: 14,
        basePriceCents: 42000,
        amenities: ['wifi', 'minibar'],
        imageUrls: [],
        status: 'active',
        createdAt: '',
        updatedAt: '',
      },
      {
        id: 'rt-4b',
        propertyId: 'prop-4',
        name: 'Junior Suite',
        description: 'Spacious suite with separate sitting area and balcony.',
        maxGuests: 3,
        totalRooms: 8,
        basePriceCents: 72000,
        amenities: ['wifi', 'minibar', 'balcony'],
        imageUrls: [],
        status: 'active',
        createdAt: '',
        updatedAt: '',
      },
    ],
    effectivePriceCents: 42000,
    availableRooms: 11,
  },
  {
    property: {
      id: 'prop-5',
      hostId: 'host-1',
      name: 'Kyoto Zen Ryokan',
      description:
        "A traditional Japanese inn where every element — tatami floors, shoji screens, kaiseki meals — is a meditation on refinement. Steps from the Philosopher's Path.",
      city: 'Kyoto',
      country: 'Japan',
      address: 'Higashiyama-ku, Kyoto 605-0001',
      starRating: 4,
      thumbnailUrl:
        'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=800&q=80',
      imageUrls: [
        'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1200&q=80',
      ],
      amenities: ['wifi', 'spa', 'restaurant', 'room_service'],
      status: 'active',
      basePriceCents: 39000,
      totalRooms: 16,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    availableRoomTypes: [
      {
        id: 'rt-5a',
        propertyId: 'prop-5',
        name: 'Traditional Tatami Room',
        description: 'Authentic tatami room with garden views.',
        maxGuests: 2,
        totalRooms: 8,
        basePriceCents: 39000,
        amenities: ['wifi', 'yukata'],
        imageUrls: [],
        status: 'active',
        createdAt: '',
        updatedAt: '',
      },
    ],
    effectivePriceCents: 39000,
    availableRooms: 4,
  },
  {
    property: {
      id: 'prop-6',
      hostId: 'host-2',
      name: 'Marrakech Riad Royale',
      description:
        'Hidden behind ancient medina walls, this restored 17th-century riad reveals a world of carved plasterwork, mosaic tilework, and a rooftop pool with Atlas Mountain views.',
      city: 'Marrakech',
      country: 'Morocco',
      address: 'Derb Assehbi, Mouassine, Marrakech Medina',
      starRating: 4,
      thumbnailUrl:
        'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=800&q=80',
      imageUrls: [
        'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=1200&q=80',
      ],
      amenities: ['wifi', 'pool', 'spa', 'restaurant', 'concierge'],
      status: 'active',
      basePriceCents: 22000,
      totalRooms: 12,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    availableRoomTypes: [
      {
        id: 'rt-6a',
        propertyId: 'prop-6',
        name: 'Signature Suite',
        description: 'Lavishly decorated suite with private courtyard access.',
        maxGuests: 2,
        totalRooms: 4,
        basePriceCents: 22000,
        amenities: ['wifi', 'minibar'],
        imageUrls: [],
        status: 'active',
        createdAt: '',
        updatedAt: '',
      },
    ],
    effectivePriceCents: 22000,
    availableRooms: 3,
  },
];

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useSearchHotels(params?: Partial<SearchParams>, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['search', 'hotels', params],
    queryFn: async (): Promise<SearchResult[]> => {
      await new Promise((r) => setTimeout(r, 800));

      let results = [...ALL_RESULTS];

      if (params?.destination) {
        const dest = params.destination.toLowerCase();
        results = results.filter(
          (r) =>
            r.property.city.toLowerCase().includes(dest) ||
            r.property.country.toLowerCase().includes(dest) ||
            r.property.name.toLowerCase().includes(dest),
        );
      }

      if (params?.stars?.length) {
        results = results.filter((r) => params.stars!.includes(r.property.starRating));
      }

      if (params?.guests) {
        results = results.filter((r) =>
          r.availableRoomTypes.some((rt) => rt.maxGuests >= (params.guests ?? 1)),
        );
      }

      return results;
    },
    enabled: options?.enabled ?? false,
  });
}

export function useHotelDetail(propertyId: string) {
  return useQuery({
    queryKey: ['search', 'hotel', propertyId],
    queryFn: async (): Promise<SearchResult | undefined> => {
      await new Promise((r) => setTimeout(r, 500));
      return ALL_RESULTS.find((r) => r.property.id === propertyId);
    },
    enabled: !!propertyId,
  });
}
