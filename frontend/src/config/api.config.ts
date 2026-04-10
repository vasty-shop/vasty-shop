/**
 * Centralized API Configuration
 * Single source of truth for all API endpoints and URLs
 */

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5186/api/v1',
  WS_URL: import.meta.env.VITE_WS_URL || 'http://localhost:5186',
} as const;

// Re-export for convenience
export const { BASE_URL, WS_URL } = API_CONFIG;
