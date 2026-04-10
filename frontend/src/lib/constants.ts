import { StyleType, WeatherCondition, EventType, Season } from '@/types';

export const STYLES: StyleType[] = ['Basic', 'Classic', 'Sporty', 'Glamorous', 'Cozy', 'Misty'];

export const WEATHER_CONDITIONS: WeatherCondition[] = [
  'Sunny',
  'Cloudy',
  'Rainy',
  'Thunderstorms',
  'Windy',
  'Foggy',
];

export const SEASONS: Season[] = ['Spring', 'Summer', 'Autumn', 'Winter'];

export const EVENT_TYPES: { category: string; events: EventType[] }[] = [
  {
    category: 'Casual',
    events: ['Coffee date', 'Shopping'],
  },
  {
    category: 'Work and professional events',
    events: ['Office meeting', 'Job interview', 'Presentation'],
  },
  {
    category: 'Outdoor and social events',
    events: ['Promenade', 'Cocktail party', 'Dinner party'],
  },
];

export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;

export const TAB_OPTIONS = [
  { label: 'Outfits', count: 16 },
  { label: 'Items', count: 32 },
  { label: 'Lookbook', count: 12 },
] as const;
