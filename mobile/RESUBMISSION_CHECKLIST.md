# App Store Resubmission — External Setup Checklist

This document covers everything you need to do **outside the codebase** before rebuilding and resubmitting. Code changes for Sign in with Apple (4.8) and RevenueCat IAP (3.1.1) are already done.

> **Heads up — Account deletion (5.1.1(v)) is NOT addressed in this pass.** Apple flagged three issues; we tackled two. You will be rejected again on resubmit unless you also add an account-deletion flow inside the mobile app. Plan a follow-up.

---

## 0. Codebase cleanup

- [ ] Delete the placeholder file `pages/api/revenuecat-webhook.js`. It only exists because the assistant could not remove it; its logic now lives inside `pages/api/webhook.js`. Leaving it counts as an extra Vercel function and will trip the Hobby plan's 12-function cap.
  ```bash
  rm pages/api/revenuecat-webhook.js
  ```

---

## 1. Sign in with Apple (Guideline 4.8)

### 1a. Apple Developer Portal

1. Sign in to <https://developer.appl.com/account>.
2. **Identifiers** → click your App ID `com.fitefinance.app` → enable the **Sign In with Apple** capability → Save.
3. **Keys** → click the `+` button → name it e.g. `Fite SIWA Key` → check **Sign In with Apple** → Configure → choose your primary App ID → Continue → Register.
4. **Download the `.p8` key file** (you only get one chance — keep it safe). Note the **Key ID** and your **Team ID**.
5. **Identifiers → Services IDs** → click `+` → register a Services ID, e.g. `com.fitefinance.app.web`. This is required by Clerk to verify Apple tokens server-side.
   - Description: `Fite Finance Web`
   - Identifier: `com.fitefinance.app.web`
   - Enable **Sign In with Apple** → Configure:
     - Primary App ID: `com.fitefinance.app`
     - Domains and Subdomains: `clerk.fitefinance.com` (or whatever Clerk lists as your Apple SSO callback domain — see step 1b first)
     - Return URLs: `https://clerk.fitefinance.com/v1/oauth_callback` (again, get the exact URL from Clerk)
   - Save / Continue / Register.

### 1b. Clerk Dashboard

1. Open the Clerk dashboard for the Fite production instance.
2. **User & Authentication → Social Connections → Apple** → toggle on.
3. Select **Custom credentials**.
4. Fill in:
   - **Apple Services ID** = `com.fitefinance.app.web` (from step 1a.5)
   - **Apple Team ID** = your team ID
   - **Key ID** = key ID from step 1a.4
   - **Private Key** = paste the contents of the `.p8` file
5. Save. Clerk will display the exact **Return URL** and **Domain** values — go back to your Services ID in Apple Developer Portal and make sure they match (step 1a.5).

### 1c. Expo build

- `expo-apple-authentication` is already in `package.json`.
- `app.json` already has `ios.usesAppleSignIn: true` and the plugin registered.
- When you next run `eas build --platform ios`, EAS picks up the SIWA entitlement automatically.

---

## 2. RevenueCat IAP (Guideline 3.1.1)

### 2a. App Store Connect

1. Sign in to <https://appstoreconnect.apple.com>.
2. **My Apps → Fite Finance → Subscriptions** (left sidebar under *Monetization*).
3. **Create a Subscription Group** named e.g. `Fite Premium`. Subscription groups are how Apple lets users upgrade/downgrade between tiers later.
4. Inside the group, **create an Auto-Renewable Subscription**:
   - Reference Name: `Fite Premium Monthly`
   - Product ID: `fite_premium_monthly` (you can choose anything, but match it in RevenueCat exactly).
   - Subscription Duration: 1 Month.
   - Price: pick the tier closest to your web `$3.00/month` Stripe price. Apple takes ~30%, so if you want net-equivalent revenue, you may want to bump to `$3.99`. Whatever you choose here becomes the price Apple displays in the StoreKit sheet — the app code shows whatever RC returns.
   - Localizations: add a Display Name (e.g. `Fite Premium`) and Description.
   - Review information: add a short note explaining what the user is buying (e.g. *"Unlocks unlimited AI-generated finance interview questions, AI grading, mock interviews, history, and stats."*) and upload one screenshot of the paywall.
5. The subscription must show status `Ready to Submit` before you can include it in the next App Review.
6. **Users and Access → Keys** (top nav): generate an **App Store Connect API Key** for RevenueCat:
   - Access: `App Manager` (or finer-grained: In-App Purchase)
   - Download the `.p8` file, note Key ID and Issuer ID.
7. **My Apps → Fite Finance → App Information → App-Specific Shared Secret**: generate one and copy it.

### 2b. RevenueCat dashboard

1. Sign up / sign in at <https://app.revenuecat.com>.
2. Create a **Project** named `Fite Finance`.
3. Add an **App**:
   - Platform: iOS
   - Bundle ID: `com.fitefinance.app`
   - Paste the **App Store Shared Secret** from step 2a.7
   - Upload the **App Store Connect API Key** from step 2a.6 (preferred — gives RC sandbox visibility too)
4. Copy the **Apple API key** (`appl_…`) from the iOS app's settings — this is the public SDK key you'll ship in the app binary. **Important: this is the iOS App-specific key, not the secret API key.**
5. **Products** → **+ Add Product**:
   - Identifier: `fite_premium_monthly` (must match App Store Connect exactly)
   - Type: Auto-renewable subscription
6. **Entitlements** → **+ Add Entitlement**:
   - Identifier: `premium` (must match `PREMIUM_ENTITLEMENT` in `mobile/src/revenuecat.ts`)
   - Attach the `fite_premium_monthly` product.
7. **Offerings** → **+ New Offering**:
   - Identifier: `default`
   - Mark it as the current offering.
   - Add a **Monthly** package and select the `fite_premium_monthly` product.
8. **Project Settings → Integrations → Webhooks** → **+ Add Webhook**:
   - URL: `https://fitefinance.com/api/webhook`
   - Authorization Header: generate a long random string — call this `REVENUECAT_WEBHOOK_AUTH` (you'll add it to Vercel below). Paste the same value into RevenueCat.
   - Send test event to confirm 200 OK.

### 2c. Vercel environment variables

In your Vercel project settings → **Environment Variables**:

- [ ] Add `REVENUECAT_WEBHOOK_AUTH` = the random string from step 2b.8 (Production + Preview).

Existing Stripe variables (`STRIPE_*`) stay untouched.

### 2d. Mobile build environment

The RevenueCat iOS SDK key (the `appl_…` value from step 2b.4) is shipped inside the app binary, so it lives in `mobile/app.json` → `extra.revenueCatIosKey`. The slot is already there — just fill it in:

```json
"extra": {
  "clerkPublishableKey": "pk_live_...",
  "revenueCatIosKey": "appl_xxxxxxxxxxxxxxxxxxxxxx",
  ...
}
```

Alternatively (if you don't want it in source control), set the EAS secret `EXPO_PUBLIC_REVENUECAT_IOS_KEY` — the client falls back to that.

### 2e. Test in StoreKit sandbox before submitting

1. In App Store Connect → **Users and Access → Sandbox → Testers**, add a sandbox tester email.
2. On a real iPhone, **Settings → App Store → Sandbox Account** → sign in with the tester.
3. Install the new build via TestFlight or EAS internal distribution.
4. Open the paywall → tap Upgrade → confirm the native StoreKit sheet shows your subscription with the price you set in App Store Connect.
5. Complete the purchase. Watch the RevenueCat dashboard's **Events** tab for `INITIAL_PURCHASE`. Then check Redis (Upstash console) — `paid:<your-clerk-user-id>` should be `"true"`.
6. Tap **Restore Purchases** with a fresh app install — same user should re-unlock.

---

## 3. Resubmit

1. Bump version in `mobile/app.json` (`expo.version` and `ios.buildNumber`).
2. `eas build --platform ios --profile production`
3. `eas submit --platform ios --profile production`
4. In App Store Connect → submission:
   - **Attach the IAP product** (`fite_premium_monthly`) to the same submission.
   - In **App Review Information** notes, include:
     - The Apple ID for a working sandbox account (so reviewers can sign in).
     - A screen recording showing: sign in with Apple, paywall, successful purchase, restore purchases.
     - A note: *"Premium is now sold via In-App Purchase on iOS. Web/Android continue to use Stripe."*
5. **You will still be rejected on 5.1.1(v) until account deletion is added.** Either tackle it before resubmit or expect a second round-trip.

---

## 4. Quick reference — env vars

| Where | Key | Value |
| --- | --- | --- |
| Vercel (Production + Preview) | `REVENUECAT_WEBHOOK_AUTH` | Random string, same value pasted into RC dashboard |
| `mobile/app.json` → `extra` | `revenueCatIosKey` | `appl_...` from RevenueCat iOS app settings |
| EAS Secret (optional fallback) | `EXPO_PUBLIC_REVENUECAT_IOS_KEY` | Same as above |

All other env vars are unchanged.
