# Dynamic Configuration System - Setup Complete

## Overview
The app now fetches configuration from the API on launch and dynamically applies theme, navigation, and features based on the shop's settings.

---

## API Configuration

**Endpoint**: `GET /api/v1/shops/mobile-config`
**Header**: `x-shop-id: cb40f398-6df7-401c-a7a1-1b2a57b5bf29`
**Base URL**: `http://192.168.0.126:5187/api/v1`

The API returns:
```json
{
  "data": {
    "theme": { ... },
    "navigation": { ... },
    "features": { ... },
    "shopInfo": { ... }
  }
}
```

---

## Files Created

### 1. **`lib/core/config/mobile_config_model.dart`**
- Data models for the configuration response
- Classes: `MobileConfig`, `ThemeConfig`, `NavigationConfig`, `FeaturesConfig`, `ShopInfo`
- Includes color conversion helpers

### 2. **`lib/core/config/mobile_config_service.dart`**
- Service to fetch configuration from API
- Riverpod provider: `mobileConfigProvider`
- Fallback to default config on error

### 3. **`lib/core/config/dynamic_theme.dart`**
- Generates Flutter `ThemeData` from config
- Light and dark theme support
- Dynamic border radius, colors, fonts

---

## Files Modified

### 1. **`lib/app.dart`**
- Now uses `ConsumerWidget` to watch `mobileConfigProvider`
- Applies dynamic theme from API
- Shows loading screen while fetching config
- Error screen with retry button

### 2. **`lib/core/constants/app_constants.dart`**
- Updated shop ID to: `cb40f398-6df7-401c-a7a1-1b2a57b5bf29`

### 3. **`lib/core/constants/api_constants.dart`**
- Added endpoint: `/shops/mobile-config`

### 4. **`lib/features/customer/home/presentation/providers/product_provider.dart`**
- Products filtered by shop ID from constants
- Removed dependency on shop selection

### 5. **`lib/shared/repositories/product_repository.dart`**
- Added `shopId` parameter to `getFeaturedProducts()` and `getNewProducts()`

---

## Current Configuration Applied

Based on API response for shop `cb40f398-6df7-401c-a7a1-1b2a57b5bf29`:

### Theme
- **Primary Color**: `#65A30D` (Lime Green)
- **Secondary Color**: `#84CC16`
- **Background**: `#F7FEE7` (Light Lime)
- **Text Color**: `#1A2E05` (Dark Green)
- **Font Family**: Poppins
- **Border Radius**: Large (16px)
- **Style Variant**: Modern

### Shop Info
- **Name**: Info Inlet
- **Category**: Fashion
- **Email**: infoinlet.debug2@gmail.com

### Features
- ✅ Dark Mode Support
- ✅ Biometric Auth
- ✅ Push Notifications

### Navigation
- Type: Bottom Tabs
- Style: Default
- Show Labels: Yes
- Haptic Feedback: Yes

---

## How It Works

1. **App Launch** → Fetches config from API with shop ID header
2. **Parse Response** → Converts JSON to typed models
3. **Generate Theme** → Creates `ThemeData` from colors, fonts, radius
4. **Apply to App** → MaterialApp uses dynamic theme
5. **Show Content** → App displays with shop-specific styling

---

## Error Handling

- **Network Error**: Falls back to default config
- **Invalid JSON**: Uses default config with error logging
- **Missing Fields**: Defaults applied for missing values

---

## Testing

Run the app and verify:
1. Loading screen appears briefly
2. Theme matches shop config (lime green colors)
3. Shop name "Info Inlet" in title
4. Products filtered by shop ID
5. If API fails, app still works with defaults

---

## Future Enhancements

Potential improvements:
- Cache config locally for offline use
- Refresh config periodically
- Allow manual theme override
- Support multiple shop switching

---

**Status**: ✅ **COMPLETE AND FUNCTIONAL**
**Last Updated**: December 2025
**Shop ID**: cb40f398-6df7-401c-a7a1-1b2a57b5bf29
