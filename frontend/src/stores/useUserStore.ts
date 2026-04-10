import { create } from 'zustand';
import { User, UserStats } from '@/types';

interface UserStore {
  user: User | null;
  stats: UserStats;
  savedOutfits: string[];
  setUser: (user: User | null) => void;
  setStats: (stats: UserStats) => void;
  toggleSavedOutfit: (outfitId: string) => void;
  isSaved: (outfitId: string) => boolean;
}

export const useUserStore = create<UserStore>()((set, get) => ({
  user: null,
  stats: {
    outfits: 10,
    outfitsWithEvents: 4,
    savedOutfits: 12,
  },
  savedOutfits: [],
  setUser: (user) => set({ user }),
  setStats: (stats) => set({ stats }),
  toggleSavedOutfit: (outfitId) =>
    set((state) => ({
      savedOutfits: state.savedOutfits.includes(outfitId)
        ? state.savedOutfits.filter((id) => id !== outfitId)
        : [...state.savedOutfits, outfitId],
    })),
  isSaved: (outfitId) => get().savedOutfits.includes(outfitId),
}));
