import { Injectable } from '@nestjs/common';
import { MobileAppConfig, GeneratedFile } from '../interfaces/types';

@Injectable()
export class RNDocsTemplatesService {
  /**
   * Generate all documentation files
   */
  generateDocsFiles(config: MobileAppConfig): GeneratedFile[] {
    const files: GeneratedFile[] = [];

    // Main README
    files.push(this.generateReadme(config));

    // App Store Publishing Guide
    files.push(this.generateAppStoreGuide(config));

    // Play Store Publishing Guide
    files.push(this.generatePlayStoreGuide(config));

    // Privacy Policy Template
    files.push(this.generatePrivacyPolicy(config));

    // Terms of Service Template
    files.push(this.generateTermsOfService(config));

    return files;
  }

  /**
   * Generate main README.md
   */
  private generateReadme(config: MobileAppConfig): GeneratedFile {
    const appName = config.appName;
    const appSlug = appName.toLowerCase().replace(/\s+/g, '-');
    const bundleId = `com.database.${appSlug.replace(/-/g, '')}`;
    const isDelivery = config.appType === 'delivery';

    return {
      path: 'README.md',
      type: 'config',
      content: `# ${appName} - React Native Mobile App

${isDelivery ? 'Delivery driver application' : 'Customer shopping application'} built with React Native.

## Technology Stack

- **Framework:** React Native 0.73
- **Language:** TypeScript
- **Navigation:** React Navigation 6
- **State Management:** Zustand + React Query
- **HTTP Client:** Axios
- **UI:** Custom components with theme support
- **Icons:** React Native Vector Icons

## Prerequisites

- Node.js v18 or higher
- npm or yarn
- For iOS development: macOS with Xcode 14+
- For Android development: Android Studio with SDK 33+
- React Native CLI: \`npm install -g react-native-cli\`

## Installation

\`\`\`bash
# Install dependencies
npm install

# iOS only - Install pods
cd ios && pod install && cd ..
\`\`\`

## Running the Application

### iOS
\`\`\`bash
npm run ios
# or
npx react-native run-ios
\`\`\`

### Android
\`\`\`bash
npm run android
# or
npx react-native run-android
\`\`\`

### Start Metro Bundler
\`\`\`bash
npm start
\`\`\`

## Project Structure

\`\`\`
${appSlug}/
├── src/
│   ├── api/              # API client and services
│   ├── components/       # Reusable UI components
│   ├── navigation/       # Navigation configuration
│   ├── screens/          # Screen components
│   │   ├── auth/         # Authentication screens
│   │   ${isDelivery ? '├── delivery/     # Delivery driver screens' : '├── customer/     # Customer screens'}
│   ├── store/            # State management (Zustand)
│   ├── theme/            # Theme configuration
│   └── utils/            # Utility functions
├── assets/               # Images, fonts, etc.
├── ios/                  # iOS native code
├── android/              # Android native code
├── app.json              # App configuration
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── babel.config.js       # Babel config
└── metro.config.js       # Metro bundler config
\`\`\`

## Configuration

### Environment Variables

Create a \`.env\` file in the root directory:

\`\`\`env
API_BASE_URL=${config.apiBaseUrl || 'https://api.database.shop/api/v1'}
SHOP_ID=${config.shopId}
APP_NAME=${appName}
\`\`\`

### App Configuration

- **App Name:** ${appName}
- **Bundle ID (iOS):** ${bundleId}
- **Package Name (Android):** ${bundleId}
- **Version:** 1.0.0

## Building for Production

### iOS Build
\`\`\`bash
# Archive for App Store
cd ios
xcodebuild -workspace ${appSlug}.xcworkspace -scheme ${appSlug} -configuration Release archive

# Or use Fastlane (recommended)
cd ios && fastlane release
\`\`\`

### Android Build
\`\`\`bash
# Generate signed APK
cd android
./gradlew assembleRelease

# Generate signed AAB (App Bundle) for Play Store
./gradlew bundleRelease
\`\`\`

## Features

${isDelivery ? `
### Delivery App Features
- Dashboard with earnings and stats
- Active deliveries management
- Real-time order tracking
- Route navigation with Google Maps
- Earnings history and analytics
- Profile and availability management
- Push notifications for new orders
` : `
### Customer App Features
- Product browsing and search
- Category navigation
- Shopping cart management
- Wishlist functionality
- Order placement and tracking
- User profile management
- Push notifications
- Dark mode support
`}

## API Integration

This app connects to the vasty Shop backend API:

- **Base URL:** ${config.apiBaseUrl || 'https://api.database.shop/api/v1'}
- **Authentication:** JWT Bearer tokens
- **Shop ID:** ${config.shopId}

## Theme Customization

The app theme is configured in \`src/theme/constants.ts\`:

- Primary Color: ${config.theme.primaryColor}
- Secondary Color: ${config.theme.secondaryColor}
- Accent Color: ${config.theme.accentColor}
- Font Family: ${config.theme.fontFamily}
- Border Radius: ${config.theme.borderRadius}
- Design Variant: ${config.theme.designVariant}

## Publishing

For detailed publishing instructions, see:
- **iOS App Store:** [APP_STORE_PUBLISH.md](./APP_STORE_PUBLISH.md)
- **Google Play Store:** [PLAYSTORE_PUBLISH.md](./PLAYSTORE_PUBLISH.md)

## Troubleshooting

### Clear Cache
\`\`\`bash
# Clear Metro bundler cache
npm start -- --reset-cache

# Clear Watchman
watchman watch-del-all

# iOS - Clean build
cd ios && xcodebuild clean && cd ..

# Android - Clean build
cd android && ./gradlew clean && cd ..
\`\`\`

### Reinstall Dependencies
\`\`\`bash
rm -rf node_modules
rm -rf ios/Pods
npm install
cd ios && pod install && cd ..
\`\`\`

## Resources

- [React Native Documentation](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [React Query](https://tanstack.com/query/latest)
- [Zustand](https://zustand-demo.pmnd.rs/)

---

Generated with vasty Mobile App Builder
`,
    };
  }

  /**
   * Generate App Store Publishing Guide
   */
  private generateAppStoreGuide(config: MobileAppConfig): GeneratedFile {
    const appName = config.appName;
    const appSlug = appName.toLowerCase().replace(/\s+/g, '-');
    const bundleId = `com.database.${appSlug.replace(/-/g, '')}`;

    return {
      path: 'APP_STORE_PUBLISH.md',
      type: 'config',
      content: `# Apple App Store Publishing Guide

## App Information
- **App Name:** ${appName}
- **Bundle Identifier:** ${bundleId}
- **Version:** 1.0.0

---

## Prerequisites

Before publishing to the App Store, ensure you have:

- ✅ Apple Developer Account ($99/year subscription)
- ✅ Mac computer (required for iOS builds)
- ✅ Xcode installed (latest version)
- ✅ App built as \`.ipa\` (iOS App Archive)
- ✅ App Store Connect account set up
- ✅ Privacy Policy URL
- ✅ App screenshots and promotional assets
- ✅ App review information prepared

---

## Step 1: Apple Developer Account Setup

### A. Enroll in Apple Developer Program
1. Visit: https://developer.apple.com/programs/
2. Click **Enroll**
3. Pay $99 annual fee
4. Wait 24-48 hours for approval

### B. Create App ID & Certificates
1. Go to [Apple Developer Portal](https://developer.apple.com/account/)
2. **Certificates, Identifiers & Profiles** → **Identifiers**
3. Click **+** to create new App ID
4. Bundle ID: \`${bundleId}\`
5. Enable required capabilities (Push Notifications, etc.)

---

## Step 2: Build Your App

\`\`\`bash
# Install dependencies
npm install
cd ios && pod install && cd ..

# Open in Xcode
open ios/${appSlug}.xcworkspace

# In Xcode:
# 1. Select your target
# 2. Set Bundle Identifier: ${bundleId}
# 3. Set Team (your Apple Developer account)
# 4. Product → Archive
\`\`\`

---

## Step 3: App Store Connect Setup

### A. Create New App
1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Click **My Apps** → **+** → **New App**
3. Fill in:
   - **Platform:** iOS
   - **Name:** ${appName}
   - **Primary Language:** English (U.S.)
   - **Bundle ID:** ${bundleId}
   - **SKU:** ${bundleId}

### B. App Information

**Required Fields:**

1. **Name:** ${appName} (max 30 characters)

2. **Subtitle:** (max 30 characters)
   - Brief description of your app

3. **Privacy Policy URL:**
   - Required for all apps
   - Use the included \`PRIVACY_POLICY.md\` file
   - Host it online and provide the URL

4. **Category:**
   - Primary: Select main category
   - Secondary: Optional

---

## Step 4: Screenshots

**Required Sizes:**

| Device | Size | Required |
|--------|------|----------|
| 6.7" Display (iPhone 14 Pro Max) | 1290 x 2796 | ✅ Required |
| 6.5" Display (iPhone 11 Pro Max) | 1242 x 2688 | ✅ Required |
| 5.5" Display (iPhone 8 Plus) | 1242 x 2208 | Optional |
| 12.9" iPad Pro | 2048 x 2732 | Optional |

**Guidelines:**
- Minimum 1 screenshot per required size
- Maximum 10 screenshots per device size
- PNG or JPEG format
- RGB color space
- **No transparency or alpha channel**
- No device frames (Apple adds them)

---

## Step 5: App Icon Requirements

**IMPORTANT: App icons CANNOT have transparency!**

- **Size:** 1024 x 1024 px
- **Format:** PNG or JPEG
- **No transparency / No alpha channel**
- **No rounded corners** (iOS applies them)
- **RGB color space**

### How to Remove Transparency:
1. Open icon in image editor (Photoshop, GIMP, Figma)
2. Flatten the image
3. Add solid background color
4. Export as PNG without alpha channel

---

## Step 6: App Description

### Description (max 4000 characters)
First 3 lines visible without "more" - make them count!

Include:
- What your app does
- Key features
- Why users need it

### Keywords (max 100 characters)
- Comma-separated
- No spaces after commas
- No app name or category

---

## Step 7: Age Rating

Complete the questionnaire:
- Cartoon or Fantasy Violence
- Realistic Violence
- Sexual Content or Nudity
- Profanity or Crude Humor
- Alcohol, Tobacco, or Drug Use
- Mature/Suggestive Themes
- Simulated Gambling
- Horror/Fear Themes

Most standard apps receive a **4+** rating.

---

## Step 8: App Privacy

**Data Collection Declaration:**

1. Go to **App Privacy** section
2. Answer questions about data collection
3. For each data type collected:
   - Purpose (Analytics, App Functionality, etc.)
   - Whether it's linked to user identity
   - Whether it's used for tracking

---

## Step 9: Submit for Review

1. **Check all required items are complete** (green checkmarks)
2. Click **Add for Review**
3. Click **Submit to App Review**

### Review Timeline
- **First Submission:** 1-7 days (typically 24-48 hours)
- **Updates:** 24-48 hours

---

## Pre-Submission Checklist

- [ ] App built and uploaded to App Store Connect
- [ ] App screenshots (all required sizes)
- [ ] App icon (1024x1024, **NO TRANSPARENCY**)
- [ ] App name (max 30 characters)
- [ ] App subtitle (max 30 characters)
- [ ] App description (max 4000 characters)
- [ ] Keywords (max 100 characters)
- [ ] Privacy policy URL
- [ ] Support URL
- [ ] Age rating questionnaire completed
- [ ] App privacy details completed
- [ ] Contact information provided
- [ ] Demo account credentials (if applicable)
- [ ] Category selected
- [ ] Pricing set

---

## Common Rejection Reasons

1. **Invalid app icon** - Has transparency/alpha channel
2. **Crashes and bugs** - Test thoroughly before submission
3. **Incomplete information** - Provide all required metadata
4. **Missing privacy policy** - Include valid privacy policy URL
5. **Placeholder content** - Replace all placeholder text/images

---

## Resources

- **App Store Connect Help:** https://developer.apple.com/support/app-store-connect/
- **App Review Guidelines:** https://developer.apple.com/app-store/review/guidelines/
- **Human Interface Guidelines:** https://developer.apple.com/design/human-interface-guidelines/

---

**Good luck with your App Store launch!**
`,
    };
  }

  /**
   * Generate Play Store Publishing Guide
   */
  private generatePlayStoreGuide(config: MobileAppConfig): GeneratedFile {
    const appName = config.appName;
    const appSlug = appName.toLowerCase().replace(/\s+/g, '-');
    const packageName = `com.database.${appSlug.replace(/-/g, '')}`;

    return {
      path: 'PLAYSTORE_PUBLISH.md',
      type: 'config',
      content: `# Google Play Store Publishing Guide

## App Information
- **App Name:** ${appName}
- **Package Name:** ${packageName}
- **Version:** 1.0.0

---

## Prerequisites

Before publishing to Google Play Store, ensure you have:

- ✅ Google Play Console account ($25 one-time registration fee)
- ✅ App built as \`.aab\` (Android App Bundle) format
- ✅ App signing key configured
- ✅ Privacy Policy URL
- ✅ App screenshots and promotional graphics
- ✅ Content rating questionnaire completed

---

## Step 1: Build Your App

\`\`\`bash
# Install dependencies
npm install

# Build release APK
cd android
./gradlew assembleRelease

# Build App Bundle (AAB) for Play Store (recommended)
./gradlew bundleRelease
\`\`\`

The AAB file will be at: \`android/app/build/outputs/bundle/release/app-release.aab\`

---

## Step 2: Google Play Console Setup

### A. Create Application
1. Go to [Google Play Console](https://play.google.com/console)
2. Click **Create App**
3. Fill in app details:
   - **App name:** ${appName}
   - **Default language:** English (US)
   - **App or game:** Select appropriate category
   - **Free or paid:** Select pricing model

### B. Store Listing

**Required Information:**

1. **App Name:** ${appName}

2. **Short Description** (80 characters max):
   - Brief description of your app

3. **Full Description** (4000 characters max):
   - Detailed description with features

4. **App Icon:**
   - 512 x 512 PNG
   - 32-bit PNG with alpha
   - Located in: \`android/app/src/main/res/\`

5. **Feature Graphic:**
   - 1024 x 500 JPG or 24-bit PNG
   - No transparency

6. **Screenshots** (minimum 2, maximum 8):
   - Phone: 16:9 or 9:16 aspect ratio
   - Minimum dimension: 320px
   - Maximum dimension: 3840px

7. **Privacy Policy URL:**
   - Required for all apps
   - Use the included \`PRIVACY_POLICY.md\` file
   - Host it online and provide the URL

---

## Step 3: Content Rating

1. Complete the content rating questionnaire
2. Categories include:
   - Violence
   - Sexual Content
   - Drugs
   - Bad Language
   - Gambling

3. Most standard apps receive an **Everyone** rating

---

## Step 4: App Content

1. **Privacy Policy:** Required
2. **Target Audience:** Select age groups
3. **Data Safety:**
   - Declare what data you collect
   - How it's used and shared
   - Security practices

---

## Step 5: Upload Your App Bundle

1. Go to **Production** → **Releases**
2. Click **Create new release**
3. Upload your \`.aab\` file
4. Add release notes:

\`\`\`
What's new in version 1.0.0:
• Initial release
• [Add your app features here]
\`\`\`

---

## Step 6: Rollout

Choose rollout percentage:
- **Staged rollout:** 5%, 10%, 20%, 50%, 100%
- **Full rollout:** Immediate 100% availability

---

## Step 7: Review Process

- **Timeline:** 1-7 days (typically 24-48 hours)
- **Status:** Monitor in Play Console dashboard
- Google will email you about approval/rejection

---

## Pre-Submission Checklist

- [ ] App icon (512x512)
- [ ] Feature graphic (1024x500)
- [ ] Screenshots (minimum 2)
- [ ] Short description (max 80 characters)
- [ ] Full description (max 4000 characters)
- [ ] Privacy policy URL
- [ ] Content rating completed
- [ ] Data safety form completed
- [ ] App category selected
- [ ] Contact details (email, phone, website)
- [ ] App bundle (.aab) uploaded

---

## Asset Guidelines

### App Icon
- **Size:** 512 x 512 px
- **Format:** 32-bit PNG with alpha
- **No rounded corners** (Google applies them)
- **Full bleed:** Design to edges

### Feature Graphic
- **Size:** 1024 x 500 px
- **Format:** JPG or PNG
- **No transparency**
- **Showcases app features**

### Screenshots
- **Phone:** 320px - 3840px
- **Tablet (optional):** 7-10 inch tablets
- **Formats:** JPG or PNG
- **Show actual app UI**

---

## App Signing

### Configure App Signing

1. **Google Play App Signing** (Recommended):
   - Let Google manage your app signing key
   - More secure
   - Easier key management

2. Go to **Release** → **Setup** → **App Integrity**
3. Choose **"Continue"** to let Google manage your key

---

## Version Numbering

In \`android/app/build.gradle\`:
\`\`\`gradle
android {
    defaultConfig {
        versionCode 1        // Integer, must increment
        versionName "1.0.0"  // Human-readable
    }
}
\`\`\`

**Rules:**
- \`versionName\`: Human-readable (1.0.0, 1.1.0, etc.)
- \`versionCode\`: Integer that must increment (1, 2, 3, etc.)

---

## Common Issues & Solutions

### Issue: "Target SDK version must be at least 33"
**Solution:** Update in \`android/app/build.gradle\`:
\`\`\`gradle
android {
    compileSdkVersion 34
    defaultConfig {
        targetSdkVersion 34
    }
}
\`\`\`

### Issue: "App not available in my country"
**Solution:** Go to **Production** → **Countries/regions** and select all countries.

---

## Resources

- **Google Play Console Help:** https://support.google.com/googleplay/android-developer
- **Android Publishing Guide:** https://developer.android.com/studio/publish
- **Google Play Policies:** https://play.google.com/about/developer-content-policy/

---

**Good luck with your Play Store launch!**
`,
    };
  }

  /**
   * Generate Privacy Policy Template
   */
  private generatePrivacyPolicy(config: MobileAppConfig): GeneratedFile {
    const appName = config.appName;

    return {
      path: 'PRIVACY_POLICY.md',
      type: 'config',
      content: `# Privacy Policy for ${appName}

**Last Updated:** [DATE]

## Introduction

Welcome to ${appName}. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application.

## Information We Collect

### Personal Information
We may collect personal information that you voluntarily provide when:
- Creating an account
- Making a purchase
- Contacting customer support
- Subscribing to newsletters

This may include:
- Name
- Email address
- Phone number
- Shipping address
- Payment information

### Automatically Collected Information
When you use the app, we automatically collect:
- Device information (model, OS version)
- IP address
- App usage data
- Location data (if permitted)

## How We Use Your Information

We use the collected information to:
- Process transactions and orders
- Send order confirmations and updates
- Provide customer support
- Improve our app and services
- Send promotional communications (with consent)
- Comply with legal obligations

## Information Sharing

We may share your information with:
- **Service Providers:** Payment processors, shipping partners
- **Business Partners:** With your consent
- **Legal Requirements:** When required by law

We do NOT sell your personal information to third parties.

## Data Security

We implement appropriate security measures to protect your information, including:
- Encryption of sensitive data
- Secure servers
- Regular security assessments

## Your Rights

You have the right to:
- Access your personal data
- Correct inaccurate data
- Delete your account and data
- Opt-out of marketing communications
- Request data portability

## Third-Party Services

Our app may contain links to third-party services. We are not responsible for their privacy practices.

## Children's Privacy

Our app is not intended for children under 13. We do not knowingly collect information from children.

## Changes to This Policy

We may update this Privacy Policy from time to time. We will notify you of changes by posting the new policy in the app.

## Contact Us

If you have questions about this Privacy Policy, contact us at:

- **Email:** [YOUR_EMAIL]
- **Website:** [YOUR_WEBSITE]
- **Address:** [YOUR_ADDRESS]

---

**By using ${appName}, you agree to this Privacy Policy.**
`,
    };
  }

  /**
   * Generate Terms of Service Template
   */
  private generateTermsOfService(config: MobileAppConfig): GeneratedFile {
    const appName = config.appName;

    return {
      path: 'TERMS_OF_SERVICE.md',
      type: 'config',
      content: `# Terms of Service for ${appName}

**Last Updated:** [DATE]

## 1. Acceptance of Terms

By downloading, installing, or using ${appName}, you agree to be bound by these Terms of Service.

## 2. Description of Service

${appName} is a mobile application that provides [DESCRIBE YOUR SERVICE].

## 3. User Accounts

- You must provide accurate information when creating an account
- You are responsible for maintaining account security
- You must notify us of any unauthorized access
- One account per person

## 4. User Conduct

You agree NOT to:
- Violate any laws or regulations
- Infringe on intellectual property rights
- Transmit harmful or malicious content
- Attempt to hack or disrupt the service
- Use the app for unauthorized commercial purposes

## 5. Purchases and Payments

- All prices are displayed in the app
- Payment is processed through secure third-party providers
- Refunds are subject to our refund policy
- You are responsible for any applicable taxes

## 6. Intellectual Property

- All content and materials in the app are owned by us
- You may not copy, modify, or distribute our content
- Your content remains yours, but you grant us a license to use it

## 7. Disclaimer of Warranties

THE APP IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND.

## 8. Limitation of Liability

WE ARE NOT LIABLE FOR:
- Indirect, incidental, or consequential damages
- Loss of data or profits
- Service interruptions

## 9. Indemnification

You agree to indemnify and hold us harmless from any claims arising from your use of the app.

## 10. Termination

We may terminate your access to the app at any time for violation of these terms.

## 11. Changes to Terms

We may modify these terms at any time. Continued use of the app constitutes acceptance of changes.

## 12. Governing Law

These terms are governed by the laws of [YOUR_JURISDICTION].

## 13. Contact Information

For questions about these Terms, contact us at:

- **Email:** [YOUR_EMAIL]
- **Website:** [YOUR_WEBSITE]

---

**By using ${appName}, you agree to these Terms of Service.**
`,
    };
  }
}
