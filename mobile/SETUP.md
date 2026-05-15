# Fite Finance — Mobile App Setup Guide

## Overview

This is the Expo (React Native) mobile app for Fite Finance. It calls the same backend APIs as the web app at `fitefinance.com/api/*` — no backend changes are needed.

- **Framework:** Expo SDK 54 + Expo Router v4
- **Platforms:** iOS + Android
- **Auth:** Clerk (`@clerk/clerk-expo`)
- **Payments:** Stripe (via in-app browser → Stripe Checkout on your existing server)
- **API:** All calls go to `https://fitefinance.com/api/*`

---

## 1. Prerequisites

Install these tools if you haven't already:

```bash
# Node.js 18+ (check with: node --version)
# Then install the Expo CLI globally:
npm install -g expo-cli eas-cli
```

Also install the **Expo Go** app on your phone for local testing (no build needed):
- iOS: https://apps.apple.com/app/expo-go/id982107779
- Android: https://play.google.com/store/apps/details?id=host.exp.exponent

---

## 2. Install dependencies

```bash
cd Fite/mobile
npm install
```

---

## 3. Environment variables

Create a `.env.local` file in `Fite/mobile/`:

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxx
```

Get your Clerk publishable key from https://dashboard.clerk.com → Your app → API Keys.

**Important:** The mobile app uses the same Clerk application as your web app. You need to add `fitefinance://` as an allowed OAuth redirect URI in your Clerk dashboard:
- Clerk Dashboard → Your App → User & Authentication → Social Connections → Google → Redirect URIs
- Add: `fitefinance://oauth-callback`

---

## 4. Update `app.json`

After creating your EAS project (step 6), paste your EAS project ID into `app.json`:

```json
"extra": {
  "eas": {
    "projectId": "YOUR_EAS_PROJECT_ID"
  },
  "clerkPublishableKey": "pk_live_xxxx"
}
```

---

## 5. Run locally

```bash
# Start the dev server
npm start

# Scan the QR code with Expo Go on your phone
# Or press 'i' for iOS simulator / 'a' for Android emulator
```

---

## 6. EAS Build setup (for App Store / Play Store)

EAS Build handles building native binaries without needing Xcode or Android Studio on your machine.

```bash
# Login to Expo
eas login

# Initialize EAS for this project (creates your projectId)
eas init

# Configure builds
eas build:configure
```

This creates `eas.json`. A typical config:

```json
{
  "cli": { "version": ">= 12.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
```

---

## 7. Build for production

```bash
# iOS build (requires Apple Developer account)
npm run build:ios

# Android build
npm run build:android
```

EAS will prompt you to log in to your Apple Developer account and generate the necessary certificates automatically.

---

## 8. Apple Developer Account setup

1. Go to https://developer.apple.com and enroll ($99/year)
2. Wait for approval (usually same day)
3. When you run `eas build --platform ios`, EAS will handle:
   - Creating the App ID (`com.fitefinance.app`)
   - Generating provisioning profiles and signing certificates
   - Building the `.ipa` file

---

## 9. Submit to App Store

```bash
npm run submit:ios
```

EAS Submit will upload the build to App Store Connect. You'll then need to:
1. Log into https://appstoreconnect.apple.com
2. Fill in the app listing (description, screenshots, category, etc.)
3. Set your app's age rating and pricing (free with in-app purchase)
4. Submit for review (usually 1-3 days)

**App Store metadata you'll need:**
- App name: `Fite Finance`
- Category: Education (or Finance)
- Short description: Finance interview prep with AI questions, grading, and mock interviews
- Screenshots: Required for 6.5" iPhone and 5.5" iPhone (Xcode Simulator can generate these)
- Privacy policy URL: `https://fitefinance.com/privacy`
- Support URL: `https://fitefinance.com`

---

## 10. Submit to Google Play

```bash
# One-time $25 fee at play.google.com/console
npm run submit:android
```

---

## 11. In-app purchases / Stripe note

The app currently uses Stripe Checkout via an in-app browser — this is the simplest approach and works well, but Apple may eventually require you to use Apple's in-app purchase system (StoreKit) for digital subscriptions.

For now, the in-browser Stripe flow is compliant as long as:
- The subscription is not promoted as an in-app purchase in the App Store listing
- You also offer web signup at fitefinance.com

If Apple rejects the app for this reason, you'll need to add RevenueCat + StoreKit (a separate integration).

---

## File Structure

```
mobile/
  app/
    _layout.tsx           Root layout (ClerkProvider, navigation shell)
    (auth)/
      sign-in.tsx         Sign in screen
      sign-up.tsx         Sign up screen
    (tabs)/
      index.tsx           Dashboard (main practice screen)
      history.tsx         Question history
      stats.tsx           Performance stats
      account.tsx         Account management
    interview.tsx         Mock interview (modal)
    paywall.tsx           Premium upgrade (modal)
    feedback.tsx          Feedback form (modal)
    feature-vote.tsx      Feature voting (modal)
  src/
    api.ts                API client for fitefinance.com/api/*
    constants.ts          Categories, difficulties, etc.
    theme.ts              Colors, typography, spacing
    hooks/
      usePaidStatus.ts    Premium status hook
      usePrice.ts         Stripe price hook
    components/
      Button.tsx
      Card.tsx
      LoadingDots.tsx
      PremiumGate.tsx
      ScoreDisplay.tsx
```

---

## Common issues

**"Metro bundler not starting"**
→ Delete `node_modules` and run `npm install` again.

**Clerk OAuth not redirecting back**
→ Make sure `fitefinance://oauth-callback` is listed in Clerk Dashboard → Native Applications → Allowlist for mobile SSO redirect.

**API calls failing in production**
→ Check that `fitefinance.com` allows requests from mobile user agents. The existing Vercel serverless functions should work without changes since they use Clerk auth tokens, not session cookies.

**Build failing on EAS**
→ Run `eas build --platform ios --local` to test locally (requires Xcode on Mac).
