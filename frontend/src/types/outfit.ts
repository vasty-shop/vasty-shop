import { Product } from './product';

export type WeatherCondition = 'Sunny' | 'Cloudy' | 'Rainy' | 'Thunderstorms' | 'Windy' | 'Foggy';

export type Season = 'Spring' | 'Summer' | 'Autumn' | 'Winter';

export type EventType =
  | 'Coffee date'
  | 'Shopping'
  | 'Office meeting'
  | 'Job interview'
  | 'Presentation'
  | 'Promenade'
  | 'Cocktail party'
  | 'Dinner party';

export type StyleType = 'Basic' | 'Classic' | 'Sporty' | 'Glamorous' | 'Cozy' | 'Misty';

export interface Outfit {
  id: string;
  name: string;
  category: string; // e.g., "COZY WEAR", "BASIC AUTUMN"
  style: StyleType;
  rating: number;
  products: Product[];
  weatherSuitability: WeatherCondition[];
  temperature: { min: number; max: number };
  events: EventType[];
  image: string;
  model3d?: string;
  description?: string;
  tags?: string[];
}

export interface FilterState {
  styles: StyleType[];
  event?: EventType;
  season?: Season;
  weather: WeatherCondition[];
  temperature: { min: number; max: number };
}
