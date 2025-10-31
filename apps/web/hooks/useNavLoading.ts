'use client';

import { create } from 'zustand';

type NavLoadingState = {
  loading: boolean;
  pending: number;
  start: () => void;
  stop: () => void;
  reset: () => void;
};

export const useNavLoading = create<NavLoadingState>((set, get) => ({
  loading: false,
  pending: 0,
  start: () =>
    set(state => {
      const nextPending = state.pending + 1;
      return {
        pending: nextPending,
        loading: true,
      };
    }),
  stop: () =>
    set(state => {
      const nextPending = Math.max(0, state.pending - 1);
      return {
        pending: nextPending,
        loading: nextPending > 0,
      };
    }),
  reset: () => set({ pending: 0, loading: false }),
}));

