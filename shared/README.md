# @fluxez/shared

This package contains shared code between the Fluxez frontend (web) and mobile applications.

## Structure

```
shared/
├── types/              # TypeScript type definitions
│   ├── product.ts      # Product and cart types
│   ├── outfit.ts       # Outfit, filter, and weather types
│   ├── user.ts         # User and stats types
│   └── index.ts        # Type exports
├── stores/             # Zustand state management stores
│   ├── useFilterStore.ts   # Outfit filtering state
│   ├── useCartStore.ts     # Shopping cart state
│   └── useUserStore.ts     # User profile and preferences
├── constants/          # Shared constants and configurations
│   ├── colors.ts       # Color palette definitions
│   ├── filters.ts      # Filter options and configurations
│   └── index.ts        # Constant exports
├── utils/              # Utility functions
│   ├── formatting.ts   # Formatting helpers (price, date, etc.)
│   └── index.ts        # Utility exports
├── data/               # Mock data for development
│   └── mockData.ts     # Sample products, outfits, users
├── package.json        # Package configuration
├── tsconfig.json       # TypeScript configuration
└── index.ts            # Main entry point
```

## Features

- **Platform-agnostic**: No web-specific or mobile-specific dependencies
- **Type-safe**: Full TypeScript support with strict typing
- **State management**: Zustand stores for consistent state across platforms
- **Utilities**: Common formatting and helper functions
- **Mock data**: Shared test data for development

## Usage

### In Frontend (Web)

```typescript
// Import types
import { Product, Outfit, User } from '@fluxez/shared';

// Import stores
import { useCartStore, useFilterStore, useUserStore } from '@fluxez/shared';

// Import constants
import { STYLES, WEATHER_CONDITIONS, COLORS } from '@fluxez/shared';

// Import utilities
import { formatPrice, formatTemperature } from '@fluxez/shared';

// Import mock data
import { mockProducts, mockOutfits, mockUsers } from '@fluxez/shared';
```

### In Mobile

```typescript
// Same imports work in React Native
import { Product, useCartStore, formatPrice } from '@fluxez/shared';
```

## Dependencies

### Peer Dependencies
- `zustand`: ^5.0.2 - State management library

The consuming application (frontend or mobile) must install these peer dependencies.

## Development

### Type Checking
```bash
npm run type-check
```

## Notes

- All code is platform-agnostic (no DOM, no React Native specific APIs)
- Uses standard JavaScript/TypeScript features only
- Zustand stores use persist middleware for local storage (works on both web and React Native with appropriate storage adapters)
- All paths use relative imports (no path aliases) for maximum compatibility
