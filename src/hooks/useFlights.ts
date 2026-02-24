import { useQuery } from '@tanstack/react-query';

export interface Flight {
  id: string;
  airline: string;
  airlineCode: string;
  from: { city: string; code: string; time: string; date: string };
  to: { city: string; code: string; time: string; date: string };
  duration: string;
  stops: number;
  stopCity?: string;
  class: 'Economy' | 'Business' | 'First';
  priceCents: number;
  seatsLeft: number;
  badge?: string;
}

const MOCK_FLIGHTS: Flight[] = [
  {
    id: 'fl-1',
    airline: 'Emirates',
    airlineCode: 'EK',
    from: { city: 'New York', code: 'JFK', time: '09:15', date: 'Mar 15' },
    to: { city: 'Venice', code: 'VCE', time: '06:40', date: 'Mar 16' },
    duration: '9h 25m',
    stops: 1,
    stopCity: 'Dubai',
    class: 'Economy',
    priceCents: 84000,
    seatsLeft: 4,
    badge: 'Popular',
  },
  {
    id: 'fl-2',
    airline: 'Lufthansa',
    airlineCode: 'LH',
    from: { city: 'London', code: 'LHR', time: '11:30', date: 'Mar 15' },
    to: { city: 'Santorini', code: 'JTR', time: '16:45', date: 'Mar 15' },
    duration: '3h 15m',
    stops: 0,
    class: 'Business',
    priceCents: 189000,
    seatsLeft: 2,
    badge: 'Last 2 seats',
  },
  {
    id: 'fl-3',
    airline: 'Air France',
    airlineCode: 'AF',
    from: { city: 'New York', code: 'JFK', time: '22:45', date: 'Mar 14' },
    to: { city: 'Paris', code: 'CDG', time: '12:30', date: 'Mar 15' },
    duration: '7h 45m',
    stops: 0,
    class: 'Economy',
    priceCents: 62000,
    seatsLeft: 12,
  },
  {
    id: 'fl-4',
    airline: 'Singapore Airlines',
    airlineCode: 'SQ',
    from: { city: 'London', code: 'LHR', time: '08:00', date: 'Mar 15' },
    to: { city: 'Maldives', code: 'MLE', time: '04:15', date: 'Mar 16' },
    duration: '11h 15m',
    stops: 1,
    stopCity: 'Singapore',
    class: 'First',
    priceCents: 420000,
    seatsLeft: 1,
    badge: 'Luxury Pick',
  },
  {
    id: 'fl-5',
    airline: 'Japan Airlines',
    airlineCode: 'JL',
    from: { city: 'Los Angeles', code: 'LAX', time: '14:00', date: 'Mar 15' },
    to: { city: 'Kyoto', code: 'KIX', time: '18:30', date: 'Mar 16' },
    duration: '11h 30m',
    stops: 0,
    class: 'Business',
    priceCents: 248000,
    seatsLeft: 6,
    badge: 'Best Value',
  },
  {
    id: 'fl-6',
    airline: 'Royal Air Maroc',
    airlineCode: 'AT',
    from: { city: 'Paris', code: 'CDG', time: '07:20', date: 'Mar 15' },
    to: { city: 'Marrakech', code: 'RAK', time: '10:05', date: 'Mar 15' },
    duration: '2h 45m',
    stops: 0,
    class: 'Economy',
    priceCents: 28000,
    seatsLeft: 18,
  },
];

export function useFlights(
  params?: { from?: string; to?: string; date?: string; class?: string },
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ['flights', params],
    queryFn: async (): Promise<Flight[]> => {
      await new Promise((r) => setTimeout(r, 900));
      let results = [...MOCK_FLIGHTS];

      if (params?.from) {
        const origin = params.from.toLowerCase();
        const filtered = results.filter(
          (f) =>
            f.from.city.toLowerCase().includes(origin) ||
            f.from.code.toLowerCase().includes(origin),
        );
        if (filtered.length > 0) results = filtered;
      }

      if (params?.to) {
        const dest = params.to.toLowerCase();
        const filtered = results.filter(
          (f) => f.to.city.toLowerCase().includes(dest) || f.to.code.toLowerCase().includes(dest),
        );
        if (filtered.length > 0) results = filtered;
      }

      if (params?.class) {
        const filtered = results.filter((f) => f.class === params.class);
        if (filtered.length > 0) results = filtered;
      }

      return results;
    },
    enabled: options?.enabled ?? false,
  });
}
