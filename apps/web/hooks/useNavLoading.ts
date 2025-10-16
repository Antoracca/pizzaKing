'use client';

import { create } from 'zustand';

type NavLoadingState = {
  loading: boolean;
  start: () => void;
  stop: () => void;
};

export const useNavLoading = create<NavLoadingState>(set => ({
  loading: false,
  start: () => set({ loading: true }),
  stop: () => set({ loading: false }),
}));

