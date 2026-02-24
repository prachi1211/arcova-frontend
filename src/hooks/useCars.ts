import { useQuery } from '@tanstack/react-query';

export interface CarRental {
  id: string;
  brand: string;
  model: string;
  type: string;
  seats: number;
  transmission: 'Automatic' | 'Manual';
  priceCents: number; // per day
  imageUrl: string;
  features: string[];
  rating: number;
  reviews: number;
  badge?: string;
}

const MOCK_CARS: CarRental[] = [
  {
    id: 'car-1',
    brand: 'Mercedes-Benz',
    model: 'E-Class',
    type: 'Luxury Sedan',
    seats: 5,
    transmission: 'Automatic',
    priceCents: 18900,
    imageUrl:
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80',
    features: ['AC', 'GPS', 'Bluetooth', 'Unlimited KM'],
    rating: 4.8,
    reviews: 124,
    badge: 'Best Value',
  },
  {
    id: 'car-2',
    brand: 'Porsche',
    model: '911 Carrera',
    type: 'Sports Car',
    seats: 2,
    transmission: 'Automatic',
    priceCents: 48000,
    imageUrl:
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
    features: ['AC', 'GPS', 'Sport Mode', 'Premium Sound'],
    rating: 4.9,
    reviews: 67,
    badge: 'Luxury Pick',
  },
  {
    id: 'car-3',
    brand: 'BMW',
    model: 'X5',
    type: 'Premium SUV',
    seats: 7,
    transmission: 'Automatic',
    priceCents: 24500,
    imageUrl:
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
    features: ['AC', 'GPS', 'AWD', 'Child Seat Available'],
    rating: 4.7,
    reviews: 213,
  },
  {
    id: 'car-4',
    brand: 'Tesla',
    model: 'Model 3',
    type: 'Electric Sedan',
    seats: 5,
    transmission: 'Automatic',
    priceCents: 15900,
    imageUrl:
      'https://images.unsplash.com/photo-1536700503339-1e4b06520771?auto=format&fit=crop&w=800&q=80',
    features: ['Autopilot', 'Zero Emission', 'GPS', 'Supercharger Access'],
    rating: 4.6,
    reviews: 89,
    badge: 'Eco Choice',
  },
  {
    id: 'car-5',
    brand: 'Range Rover',
    model: 'Velar',
    type: 'Luxury SUV',
    seats: 5,
    transmission: 'Automatic',
    priceCents: 35000,
    imageUrl:
      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=800&q=80',
    features: ['AC', 'GPS', 'Panoramic Roof', 'Leather Seats'],
    rating: 4.9,
    reviews: 45,
  },
  {
    id: 'car-6',
    brand: 'Fiat',
    model: '500 Convertible',
    type: 'Compact',
    seats: 4,
    transmission: 'Manual',
    priceCents: 8900,
    imageUrl:
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
    features: ['AC', 'Bluetooth', 'Convertible Top', 'Compact'],
    rating: 4.4,
    reviews: 156,
    badge: 'Most Popular',
  },
];

export function useCars(
  params?: { location?: string; type?: string },
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ['cars', params],
    queryFn: async (): Promise<CarRental[]> => {
      await new Promise((r) => setTimeout(r, 700));
      let results = [...MOCK_CARS];

      if (params?.type) {
        const filtered = results.filter((c) =>
          c.type.toLowerCase().includes(params.type!.toLowerCase()),
        );
        if (filtered.length > 0) results = filtered;
      }

      // Location filter is a no-op on mock data (all cars available everywhere)
      // When backend is wired, this becomes a real filter
      return results;
    },
    enabled: options?.enabled ?? false,
  });
}
