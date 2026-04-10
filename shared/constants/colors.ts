// Brand color palette
export const COLORS = {
  primary: '#000000',
  secondary: '#FFFFFF',
  accent: '#FF6B6B',
  text: {
    primary: '#000000',
    secondary: '#666666',
    light: '#999999',
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#F5F5F5',
    tertiary: '#E5E5E5',
  },
  border: {
    light: '#E5E5E5',
    medium: '#CCCCCC',
    dark: '#999999',
  },
  status: {
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#F44336',
    info: '#2196F3',
  },
} as const;

// Weather condition colors
export const WEATHER_COLORS = {
  Sunny: '#FFD700',
  Cloudy: '#B0C4DE',
  Rainy: '#4682B4',
  Thunderstorms: '#483D8B',
  Windy: '#87CEEB',
  Foggy: '#D3D3D3',
} as const;

// Style type colors
export const STYLE_COLORS = {
  Basic: '#8B7355',
  Classic: '#2F4F4F',
  Sporty: '#FF6347',
  Glamorous: '#FFD700',
  Cozy: '#D2691E',
  Misty: '#778899',
} as const;
