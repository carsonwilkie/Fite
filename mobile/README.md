# Fite Finance — Mobile

Native mobile app for [Fite Finance](https://fitefinance.com) — AI-powered finance interview prep for iOS and Android. The mobile app shares its backend, users, and premium status with the website; everything API-side lives in the parent repository under `/pages/api/*` and runs on Vercel.

## Highlights

- AI-generated finance interview questions across 7 categories (Investment Banking, Private Equity, Asset Management, Accounting, Consulting, Valuation, Sales and Trading) and 4 difficulty tiers (Easy / Medium / Hard / OTG)
- AI grading on user-written answers
- Curated **IB 400** question bank with per-question progress tracking
- Structured 4-question mock interview mode with mid-interview feedback and a final AI debrief
- Practice history, stats, streaks, and trend tracking
- Practice timer with auto-start option
- Custom focus prompts
- Free tier: 5 generated questions/day. Premium tier: unlimited, plus everything above.

## Tech Stack

- **Runtime:** Expo SDK 55 (New Architecture enabled)
- **Router:** Expo Router v5 with typed routes
- **Language:** TypeScript, React 19, React Native 0.83
- **Auth:** [Clerk](https://clerk.com) via `@clerk/clerk-expo`, tokens cached in `expo-secure-store`
- **Payments:**
  - iOS → [RevenueCat](https://www.revenuecat.com) (`react-native-purchases`) backed by Apple StoreKit
  - Android / web fallback → Stripe Checkout opened in `expo-web-browser`
- **API:** All calls go to `https://fitefinance.com/api/*`
- **State / storage:** React state + `@react-native-async-storage/async-storage` for local hints
- **UI:** `react-native-reanimated`, `react-native-gesture-handler`, `expo-linear-gradient`, `expo-blur`
- **Fonts:** Inter + Manrope via `@expo-google-fonts/*`
- **Icons:** Ionicons via `@expo/vector-icons`
- **Build & submit:** EAS Build + EAS Submit

## Project Structure

```
mobile/
├── app/                          Expo Router screens
│   ├── _layout.tsx               Root layout: ClerkProvider, paid-status, splash, auth gate
│   ├── (auth)/
│   │   ├── sign-in.tsx           Email / Google / Sign in with Apple
│   │   └── sign-up.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx           Tab bar (Practice · IB 400 · History · Stats · Account)
│   │   ├── index.tsx             Practice dashboard
│   │   ├── ib400.tsx             Curated IB 400 question bank (premium)
│   │   ├── history.tsx           Practice history (premium)
│   │   ├── stats.tsx             Performance stats (premium)
│   │   └── account.tsx           Account / billing / sign out / delete account
│   ├── interview.tsx             Mock interview flow (modal)
│   ├── paywall.tsx               Premium upgrade (modal)
│   ├── feedback.tsx              Feedback form (modal)
│   ├── feature-vote.tsx          Feature voting (modal, premium)
│   └── ib-question.tsx           Single IB 400 question (modal)
│
├── src/
│   ├── api.ts                    Typed fetch client for fitefinance.com/api/*
│   ├── constants.ts              Categories, difficulties, math options, timer presets, etc.
│   ├── theme.ts                  Colors, gradients, typography, spacing, radius, shadows, motion
│   ├── revenuecat.ts             iOS in-app purchase + restore + entitlement helpers
│   ├── guestMode.ts              Session-only "browse without signing in" flag
│   ├── hooks/
│   │   ├── usePaidStatus.tsx     Paid-status context with RC fallback + cache
│   │   └── usePrice.ts           Stripe-derived price string for non-iOS surfaces
│   └── components/               Glass cards, gradient buttons, pills, score display, etc.
│
├── assets/                       App icon, splash icon, adaptive icon, favicon
├── app.json                      Expo configuration (bundle ids, plugins, scheme, extras)
├── eas.json                      EAS Build / Submit configuration
├── babel.config.js
├── tsconfig.json
├── package.json
├── SETUP.md                      Local-dev and store-submission walkthrough
├── APP_STORE_METADATA.md         Apple / Google metadata source of truth
└── RESUBMISSION_CHECKLIST.md     Checklist to run before tagging a binary update
```

## Getting Started

### Prerequisites

- Node 18+
- Expo CLI + EAS CLI:
  ```bash
  npm install -g expo-cli eas-cli
  ```
- [Expo Go](https://expo.dev/client) on your phone, OR an iOS simulator / Android emulator

### Install

```bash
cd mobile
npm install
```

### Environment

The mobile app reads its public keys from `app.json` under `extra.*`, with `EXPO_PUBLIC_*` env fallbacks if you'd rather not commit keys:

```env
# mobile/.env.local
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_xxxxx
```

The Clerk app is the **same** application used by `fitefinance.com`. Make sure `fitefinance://oauth-callback` is listed under Clerk Dashboard → User & Authentication → Social Connections → Google → Redirect URIs (and the same for Apple).

No server secrets are bundled into the mobile app. Stripe, OpenAI, Clerk secret keys, and the RevenueCat webhook auth all live exclusively on the Vercel backend.

### Run locally

```bash
npm start            # Expo dev server — scan the QR code in Expo Go
npm run ios          # iOS simulator
npm run android      # Android emulator
```

### Build and submit

```bash
npm run build:ios       # eas build --platform ios
npm run build:android   # eas build --platform android
npm run submit:ios      # eas submit --platform ios
npm run submit:android  # eas submit --platform android
```

See `SETUP.md` for a deeper walkthrough of EAS setup, Apple Developer enrollment, and App Store Connect submission. See `RESUBMISSION_CHECKLIST.md` before tagging any update that touches billing UX, account deletion, or Sign in with Apple.

## How It Talks to the Backend

Every authenticated request signs a Clerk JWT (`useAuth().getToken()`) and sends it as `Authorization: Bearer <token>`. The Vercel API verifies the token via `requireAuthenticatedUserId(req, res)` and uses the resulting Clerk user id to key Redis storage (`paid:${userId}`, `history:${userId}`, `ib_progress:${userId}`, `stripe_customer:${userId}`).

Endpoints the mobile app consumes:

- `POST /api/checkPaid` — premium status check
- `GET  /api/price` — Stripe price string
- `POST /api/checkout` — Stripe Checkout URL (Android / fallback path)
- `POST /api/question` — streaming question generation + non-streaming model answer
- `POST /api/grade` — AI grading
- `GET|POST|DELETE /api/history` — practice history, plus `?scope=ib` for IB 400 progress
- `POST /api/interview` — generate / respond / debrief (single endpoint, multiple `action`s)
- `GET  /api/ib-questions` — the 400-question curated IB bank
- `POST /api/delete-account` — App Store-compliant account deletion (clears Redis + deletes the Clerk user)
- `POST /api/feedback` — feedback / feature-vote submissions

Question generation uses Server-Sent Events. React Native's `fetch` does not support `ReadableStream`, so the mobile client uses `XMLHttpRequest` and parses chunks from `onprogress`. This keeps the connection alive past Vercel's 10-second serverless timeout.

## Premium Status

`paid:${userId}` in Upstash Redis is the single source of truth for premium across web and mobile. Two webhooks feed it:

- **Stripe** (web checkout + Android via Stripe Checkout) → `POST /api/webhook` with `stripe-signature` header
- **RevenueCat** (iOS in-app purchases) → `POST /api/webhook` with shared-secret `Authorization` header

On iOS, `usePaidStatus()` additionally calls `isRcPremium()` (RevenueCat) as a fast-path so a freshly completed StoreKit purchase unlocks the app instantly even before the RC webhook has reached Redis. Paid status is also hydrated from `AsyncStorage` on cold start to avoid a flash of the free-tier UI for returning paid users.

## Auth Notes

- Clerk's Expo SDK supports email + password, Google OAuth, and Sign in with Apple out of the box.
- Sign in with Apple is required by the App Store anywhere Google sign-in is offered (`ios.usesAppleSignIn: true` in `app.json`).
- Guest mode is a session-only flag in `src/guestMode.ts` that lets users explore the dashboard without an account. The flag is cleared on sign-out so the next launch still routes to the auth screens.
- Account deletion (`account` tab → Danger zone) deletes every Redis key for the user, then calls `clerkClient().users.deleteUser(userId)` on the backend. This is what revokes the Sign in with Apple and Google OAuth grants and satisfies App Store account-deletion rules.

## Theming

`src/theme.ts` mirrors the website palette: navy / cyan / gold on a `#020817` canvas. Inter is the body font, Manrope is the display/eyebrow font. Glass cards, gradient buttons, and the gold "PREMIUM" badge are the dominant building blocks. Modal screens use `slide_from_bottom` and tabs use `freezeOnBlur: true` to avoid wasted re-renders.

## Common Issues

- **Metro won't start** → `rm -rf node_modules && npm install`.
- **OAuth doesn't return to the app** → add `fitefinance://oauth-callback` in Clerk's Google/Apple social connections.
- **EAS iOS build fails on capability sync** → the EAS environments set `EXPO_NO_CAPABILITY_SYNC=1`; keep it that way unless you intend to let EAS rewrite entitlements.
- **Paid status flickers on cold start** → make sure `usePaidStatus` is awaited inside `AuthGate` (it is by default); the splash screen is held until both Clerk and paid status resolve.

## Related

- Backend + website live in the parent repo (`Fite/`)
- Project-wide context (file maps, conventions, full API spec, etc.) is in `../CLAUDE.md`
