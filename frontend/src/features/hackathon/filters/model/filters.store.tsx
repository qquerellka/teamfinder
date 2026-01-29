import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { HackathonMode } from '@/shared/types/enums';

interface HackathonFiltersState {
  search: string;
  mode: HackathonMode | '';
  
  setSearch: (search: string) => void;
  setMode: (mode: HackathonMode | '') => void;
  reset: () => void;
  
  getQueryParams: () => {
    q?: string;
    mode?: HackathonMode;
  };
}

export const useHackathonFilters = create<HackathonFiltersState>()(
  persist(
    (set, get) => ({
      search: '',
      mode: '',
      
      setSearch: (search) => set({ search }),
      setMode: (mode) => set({ mode }),
      reset: () => set({ search: '', mode: '' }),
      
      getQueryParams: () => {
        const { search, mode } = get();
        return {
          q: search.trim() || undefined,
          mode: mode || undefined,
        };
      },
    }),
    {
      name: 'hackathon-page-filters',
    }
  )
);