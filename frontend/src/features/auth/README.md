# Authentication Feature

This directory contains all authentication-related pages and utilities for the Fluxez e-commerce platform.

## Pages

### 1. Forgot Password Page (`ForgotPasswordPage.tsx`)
**Route**: `/forgot-password`

**Features**:
- Email input with validation
- Mock API call with loading state
- Success state with countdown timer
- Resend functionality with 60-second cooldown
- Error handling with toast notifications
- Responsive design with Framer Motion animations

**User Flow**:
1. User enters email address
2. Email format is validated
3. Password reset link is sent (mock API)
4. Success message is displayed
5. User can resend email after cooldown period

### 2. Reset Password Page (`ResetPasswordPage.tsx`)
**Route**: `/reset-password/:token`

**Features**:
- Token validation from URL params
- Password strength indicator (5 levels)
- Real-time password requirements checklist:
  - At least 8 characters
  - One uppercase letter
  - One lowercase letter
  - One number
  - One special character
- Password confirmation matching
- Show/hide password toggles
- Invalid token handling
- Success redirect to login

**User Flow**:
1. User clicks reset link from email
2. Token is validated
3. User enters new password
4. Requirements are checked in real-time
5. Password is confirmed
6. Password is reset
7. User is redirected to login

### 3. Email Verification Page (`EmailVerificationPage.tsx`)
**Route**: `/verify-email/:token?`

**Features**:
- Three distinct states:
  - **Awaiting**: Waiting for user to check email
  - **Success**: Email verified with confetti animation
  - **Failed**: Verification link invalid/expired
- Token-based verification from URL
- Confetti animation on success (using canvas-confetti)
- Auto-redirect to login after 3 seconds
- Resend verification email with cooldown
- Animated envelope icon
- Helpful instructions

**User Flow**:
1. User signs up and lands on verification page
2. Email is sent with verification link
3. User clicks link in email
4. Page verifies token
5. Success: Confetti animation + redirect to login
6. Failed: Option to resend verification email

## Mock API Functions (`authApi.ts`)

All authentication operations are currently mocked with `setTimeout` to simulate network delay:

- `sendPasswordResetEmail(email: string)`: Promise<void>
  - Simulates sending password reset email
  - 2-second delay

- `resetPassword(token: string, newPassword: string)`: Promise<void>
  - Simulates password reset
  - 1.5-second delay
  - Validates token and password

- `verifyEmail(token: string)`: Promise<boolean>
  - Simulates email verification
  - 1.5-second delay
  - Returns true if token is valid

- `resendVerificationEmail(email: string)`: Promise<void>
  - Simulates resending verification email
  - 1-second delay

- `validatePasswordStrength(password: string)`: Object
  - Validates password against requirements
  - Returns object with boolean flags

- `isPasswordStrong(password: string)`: boolean
  - Checks if password meets all requirements

## Styling

All pages use:
- Fluxez branding (lime green #84cc16)
- Tailwind CSS with custom components
- Responsive design (mobile-first)
- White cards with shadows
- Smooth Framer Motion animations
- Consistent spacing and typography

## Components Used

- `Header` and `Footer` from layout
- `Button`, `Input`, `Label` from UI components
- `useToast` hook for notifications
- Lucide React icons
- Framer Motion for animations
- canvas-confetti for celebration effects

## Integration

To add these pages to your application routing:

```tsx
import { 
  ForgotPasswordPage, 
  ResetPasswordPage, 
  EmailVerificationPage 
} from '@/features/auth';

// In your router
<Route path="/forgot-password" element={<ForgotPasswordPage />} />
<Route path="/reset-password/:token" element={<ResetPasswordPage />} />
<Route path="/verify-email/:token?" element={<EmailVerificationPage />} />
```

## Future Enhancements

- Replace mock API with real backend calls
- Add OAuth integration (Google, Facebook, etc.)
- Implement 2FA support
- Add password reset rate limiting
- Store user email in context/state
- Add analytics tracking
