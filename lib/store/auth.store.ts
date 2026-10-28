'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/lib/interfaces';

type AuthState = {
  user: User | null;
  hasHydrated: boolean;
  login: (user: User) => void;
  updateUser: (user: User | null) => void;
  logout: () => void;
  setHasHydrated: (v: boolean) => void;
};

/**
 * Store d'authentification — CODENLIGNE
 *
 * Persistance : on ne stocke QUE `user` dans localStorage, jamais les tokens
 * (les tokens sont dans des cookies httpOnly, CDC §13).
 *
 * `hasHydrated` permet d'éviter un flash « non connecté » au premier rendu :
 * les composants peuvent attendre que le store soit hydraté avant d'afficher
 * l'état de connexion.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      hasHydrated: false,

      login: (user) => set({ user }),

      updateUser: (user) => set({ user }),

      logout: () => set({ user: null }),

      setHasHydrated: (v) => set({ hasHydrated: v }),
    }),
    {
      name: 'codenligne-auth',           // clé localStorage
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);