# Fluxez Shop - Mobile App

Flutter mobile application for the Fluxez Shop multi-vendor e-commerce platform.

## Features Implemented

### ✅ Authentication System
- **Onboarding**: 3-screen intro flow with smooth page indicators
- **Login**: Email/password authentication with remember me
- **Sign Up**: Full registration with validation
- **Forgot Password**: Password reset flow
- **Splash Screen**: Auto-routing based on auth state

### 🏗️ Architecture
- **Clean Architecture**: Separation of concerns (data, domain, presentation)
- **State Management**: Riverpod for reactive state
- **API Client**: Dio with interceptors and auto token refresh
- **Secure Storage**: Flutter Secure Storage for tokens
- **Error Handling**: Comprehensive error handling with custom exceptions

## Getting Started

### Installation

1. Install dependencies:
   ```bash
   flutter pub get
   ```

2. Generate JSON serialization code:
   ```bash
   dart run build_runner build --delete-conflicting-outputs
   ```

3. Update API URL in `lib/core/constants/api_constants.dart`

4. Run the app:
   ```bash
   flutter run
   ```

## Next Steps

- Customer features (home, products, cart, checkout)
- Vendor features (dashboard, products, orders)
- Delivery features (dashboard, deliveries, earnings)

## License

Private - Fluxez Shop
