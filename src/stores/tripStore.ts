import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TripItem {
  id: string;
  type: 'hotel' | 'flight' | 'car';
  name: string;
  subtitle: string;
  priceCents: number;
  imageUrl?: string;
}

interface TripState {
  items: TripItem[];
  pendingItem: TripItem | null; // item waiting to be added after auth
  showAuthGate: boolean; // triggers auth gate modal (not persisted)
  addItem: (item: TripItem) => void;
  removeItem: (id: string) => void;
  clearTrip: () => void;
  setPendingItem: (item: TripItem | null) => void;
  setShowAuthGate: (v: boolean) => void;
  isInTrip: (id: string) => boolean;
}

export const useTripStore = create<TripState>()(
  persist(
    (set, get) => ({
      items: [],
      pendingItem: null,
      showAuthGate: false,
      addItem: (item) =>
        set((state) => ({
          items: state.items.some((i) => i.id === item.id) ? state.items : [...state.items, item],
        })),
      removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      clearTrip: () => set({ items: [] }),
      setPendingItem: (item) => set({ pendingItem: item }),
      setShowAuthGate: (v) => set({ showAuthGate: v }),
      isInTrip: (id) => get().items.some((i) => i.id === id),
    }),
    {
      name: 'arcova-trip',
      // showAuthGate is UI state — never persist it
      partialize: (state) => ({ items: state.items, pendingItem: state.pendingItem }),
    },
  ),
);
