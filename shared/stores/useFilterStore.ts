import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FilterState, WeatherCondition, EventType, Season, StyleType } from '../types';

interface FilterStore {
  filters: FilterState;
  setStyles: (styles: StyleType[]) => void;
  setEvent: (event?: EventType) => void;
  setSeason: (season?: Season) => void;
  setWeather: (weather: WeatherCondition[]) => void;
  setTemperature: (range: { min: number; max: number }) => void;
  toggleStyle: (style: StyleType) => void;
  toggleWeather: (weather: WeatherCondition) => void;
  removeFilter: (type: 'style' | 'weather' | 'event' | 'season', value: string) => void;
  reset: () => void;
}

const initialState: FilterState = {
  styles: [],
  event: undefined,
  season: undefined,
  weather: [],
  temperature: { min: 10, max: 25 },
};

export const useFilterStore = create<FilterStore>()(
  persist(
    (set) => ({
      filters: initialState,
      setStyles: (styles) =>
        set((state) => ({
          filters: { ...state.filters, styles },
        })),
      setEvent: (event) =>
        set((state) => ({
          filters: { ...state.filters, event },
        })),
      setSeason: (season) =>
        set((state) => ({
          filters: { ...state.filters, season },
        })),
      setWeather: (weather) =>
        set((state) => ({
          filters: { ...state.filters, weather },
        })),
      setTemperature: (temperature) =>
        set((state) => ({
          filters: { ...state.filters, temperature },
        })),
      toggleStyle: (style) =>
        set((state) => ({
          filters: {
            ...state.filters,
            styles: state.filters.styles.includes(style)
              ? state.filters.styles.filter((s) => s !== style)
              : [...state.filters.styles, style],
          },
        })),
      toggleWeather: (weather) =>
        set((state) => ({
          filters: {
            ...state.filters,
            weather: state.filters.weather.includes(weather)
              ? state.filters.weather.filter((w) => w !== weather)
              : [...state.filters.weather, weather],
          },
        })),
      removeFilter: (type, value) =>
        set((state) => {
          const newFilters = { ...state.filters };
          if (type === 'style') {
            newFilters.styles = newFilters.styles.filter((s) => s !== value);
          } else if (type === 'weather') {
            newFilters.weather = newFilters.weather.filter((w) => w !== value);
          } else if (type === 'event') {
            newFilters.event = undefined;
          } else if (type === 'season') {
            newFilters.season = undefined;
          }
          return { filters: newFilters };
        }),
      reset: () => set({ filters: initialState }),
    }),
    {
      name: 'filter-storage',
    }
  )
);
