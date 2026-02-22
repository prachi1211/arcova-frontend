import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'traveller' | 'host' | 'admin';

interface User {
  id: string;
  email: string;
  role: UserRole;
  fullName?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    { name: 'arcova-auth' },
  ),
);