# Flutter App Routing Guide

## Overview

The Fluxez Shop Flutter app uses a centralized routing system with role-based navigation. After login, users are automatically directed to the appropriate app interface based on their role:

- **Customer** → Customer e-commerce app (single vendor shopping)
- **Vendor** → Vendor dashboard (manage products, orders, delivery)
- **Delivery** → Delivery partner app (manage deliveries, earnings)

## Architecture

### Core Files

- **`lib/core/routing/app_router.dart`** - Central routing configuration
- **`lib/app.dart`** - App entry point with router setup
- **`lib/features/auth/presentation/pages/splash_page.dart`** - Initial navigation logic

## Route Structure

### Named Routes

All routes are defined as constants in `AppRoutes` class:

```dart
class AppRoutes {
  static const String splash = '/';
  static const String onboarding = '/onboarding';
  static const String login = '/login';
  static const String signup = '/signup';
  static const String forgotPassword = '/forgot-password';

  // Role-based home routes
  static const String customerHome = '/customer/home';
  static const String vendorHome = '/vendor/home';
  static const String deliveryHome = '/delivery/home';
}
```

## Login Flow

### 1. Splash Screen
- Shows for 2 seconds on app launch
- Checks if user has seen onboarding
- Checks authentication status
- Routes to appropriate screen

### 2. Role Detection
After successful login, the app:
1. Reads user role from `UserModel.role`
2. Calls `AppRouter.navigateToHome(context, user)`
3. Automatically routes to the correct home screen

### 3. Role Mapping

| User Role | Route | Screen |
|-----------|-------|--------|
| `customer` | `/customer/home` | CustomerHomePage |
| `vendor` | `/vendor/home` | VendorHomePage |
| `delivery_man` | `/delivery/home` | DeliveryHomePage |
| `delivery` | `/delivery/home` | DeliveryHomePage |
| Default | `/customer/home` | CustomerHomePage |

## Navigation Methods

### Navigate to Home (Role-based)
```dart
AppRouter.navigateToHome(context, user);
```
Automatically navigates to the correct home screen based on user role and clears the navigation stack.

### Navigate to Login
```dart
AppRouter.navigateToLogin(context);
```
Navigates to login screen and clears all previous routes.

### Navigate with Clear Stack
```dart
AppRouter.navigateAndClearStack(context, AppRoutes.customerHome);
```
Navigates to a specific route and removes all previous routes from the stack.

### Standard Navigation
```dart
// Push named route
Navigator.of(context).pushNamed(AppRoutes.login);

// Push replacement
Navigator.of(context).pushReplacementNamed(AppRoutes.signup);

// Push and remove until
Navigator.of(context).pushNamedAndRemoveUntil(
  AppRoutes.customerHome,
  (route) => false,
);
```

## App Modes & Switching

### Mode Switcher
Each app interface includes a mode switcher in the drawer/menu that allows users to switch between different app modes if they have the appropriate permissions:

**Customer Mode** → Available to all authenticated users
**Vendor Mode** → Available to users with a shop (`user.metadata['shopId'] != null`)
**Delivery Mode** → Available to delivery partners (`user.role == 'delivery_man'`)

### Implementation Example
```dart
ElevatedButton.icon(
  onPressed: () {
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => const VendorHomePage()),
    );
  },
  icon: const Icon(Icons.store_outlined),
  label: const Text('Switch to Vendor Mode'),
)
```

## Customer App Features

The customer app is a **single e-commerce platform** (not a marketplace) with the following key features:

- Browse all products directly without shop selection
- Product categories navigation
- Featured products carousel
- Product search and filtering
- Shopping cart with real-time badge counter
- Wishlist functionality
- Order placement and tracking
- Product reviews
- User profile management
- Seamless mode switching to Vendor/Delivery (if applicable)

### Customer Navigation Structure
```
CustomerHomePage (Bottom Navigation)
├── Home Tab (Index)
│   ├── Categories Section
│   ├── Featured Products
│   └── All Products Grid
├── Wishlist Tab
│   └── Saved Products
├── Cart Tab
│   ├── Cart Items
│   └── Checkout Flow
└── Orders Tab
    ├── Order History
    └── Order Details

Drawer Menu
├── Home
├── My Orders
├── Wishlist
├── Profile
├── Settings
├── Create Your Store (if not vendor)
├── Mode Switcher (if vendor/delivery)
└── Logout
```

## Vendor App Features

- Product management (CRUD operations)
- Order management
- Delivery management
  - Delivery men
  - Shipping zones
  - Tracking
- Shop settings

### Vendor Navigation Structure
```
VendorHomePage (Bottom Navigation)
├── Dashboard Tab
├── Products Tab
│   └── Add/Edit Products
├── Orders Tab
│   └── Order Details
└── Delivery Tab
    ├── Delivery Men
    ├── Methods
    ├── Zones
    └── Tracking
```

## Delivery App Features

- View pending delivery orders
- Accept/reject orders
- Update delivery status
- Track earnings
- View delivery history
- Manage profile and settings

### Delivery Navigation Structure
```
DeliveryHomePage (Bottom Navigation + Tabs)
├── Orders Tab (with status tabs)
│   ├── Pending
│   ├── Active
│   └── All
├── Earnings Tab
└── History Tab

Drawer Menu
├── Profile
├── Reviews
├── Delivery Zones
├── Settings
└── Mode Switcher
```

## Error Handling

### 404 / Unknown Routes
The router includes a default case that shows an error screen for undefined routes:

```dart
default:
  return MaterialPageRoute(
    builder: (_) => Scaffold(
      body: Center(
        child: Text('No route defined for ${settings.name}'),
      ),
    ),
  );
```

## Best Practices

### 1. Always Use Named Routes
```dart
// Good
Navigator.of(context).pushNamed(AppRoutes.login);

// Avoid (harder to maintain)
Navigator.of(context).push(
  MaterialPageRoute(builder: (_) => const LoginPage()),
);
```

### 2. Use AppRouter Helper Methods
```dart
// Good
AppRouter.navigateToHome(context, user);

// Avoid (manual role checking)
if (user.role == 'customer') {
  Navigator.pushNamed(context, AppRoutes.customerHome);
}
```

### 3. Clear Navigation Stack on Login/Logout
```dart
// Login
AppRouter.navigateToHome(context, user);

// Logout
AppRouter.navigateToLogin(context);
```

### 4. Check Context Mounted
```dart
if (mounted) {
  AppRouter.navigateToHome(context, user);
}
```

## Testing Routes

### Manual Testing Checklist

1. **Fresh Install**
   - [ ] Shows onboarding on first launch
   - [ ] Shows login after onboarding

2. **Login Flow**
   - [ ] Customer login → Customer home
   - [ ] Vendor login → Vendor home
   - [ ] Delivery login → Delivery home

3. **Session Persistence**
   - [ ] Reopen app → Auto-login to correct home
   - [ ] Logout → Shows login screen

4. **Mode Switching**
   - [ ] Customer can't access vendor features without shop
   - [ ] Vendor can switch to customer mode
   - [ ] Delivery can switch to customer mode (if applicable)

## Troubleshooting

### Issue: User stuck on splash screen
**Solution**: Check `checkAuthStatus()` in auth provider is completing successfully

### Issue: Wrong home screen after login
**Solution**: Verify `user.role` is correctly set in the backend response

### Issue: Navigation not clearing stack
**Solution**: Use `pushNamedAndRemoveUntil` with `(route) => false`

### Issue: "No route defined" error
**Solution**: Check route name matches exactly (case-sensitive)

## Future Enhancements

- [ ] Deep linking support
- [ ] Route guards for protected screens
- [ ] Animation transitions between routes
- [ ] Route analytics tracking
- [ ] Dynamic route generation based on features

---

**Last Updated**: December 2025
**Maintained by**: Fluxez Shop Development Team
