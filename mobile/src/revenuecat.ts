import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Types are erased at compile time, so importing only the types is safe on
// every platform — the runtime module itself is loaded lazily below so the
// web bundle (which has no StoreKit) never tries to require it.
import type {
  default as PurchasesType,
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
} from 'react-native-purchases';

// Single entitlement that gates everything premium on the mobile side.
// Configure this same identifier in the RevenueCat dashboard.
export const PREMIUM_ENTITLEMENT = 'premium';

let configured = false;
let configuredUserId: string | null = null;
let purchasesModule: typeof PurchasesType | null = null;

function getIosKey(): string {
  return (
    (Constants.expoConfig?.extra?.revenueCatIosKey as string | undefined) ??
    process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ??
    ''
  );
}

/**
 * Returns true when the runtime platform has a usable RevenueCat key.
 * Currently iOS only — Android still uses the Stripe web flow.
 */
export function isRcSupported(): boolean {
  if (Platform.OS !== 'ios') return false;
  return getIosKey().length > 0;
}

function loadPurchases(): typeof PurchasesType | null {
  if (!isRcSupported()) return null;
  if (purchasesModule) return purchasesModule;
  try {
    // Defer the require so web/Android bundles never try to resolve the
    // native module. Cast through unknown because the require() return type
    // is `any` and we want the typed surface.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('react-native-purchases');
    purchasesModule = (mod.default ?? mod) as typeof PurchasesType;
    return purchasesModule;
  } catch (e) {
    if (__DEV__) console.warn('Failed to load react-native-purchases:', e);
    return null;
  }
}

/**
 * Lazily configure the SDK with the iOS API key. Safe to call repeatedly.
 * Pass a `clerkUserId` to ensure the RC app user identifier matches Clerk
 * so backend webhooks can map purchases to your existing `paid:${userId}`
 * Redis flag.
 */
export async function configureRevenueCat(clerkUserId?: string | null): Promise<void> {
  const Purchases = loadPurchases();
  if (!Purchases) return;

  if (!configured) {
    try {
      // Log noise off in release; warnings only in dev.
      // (LOG_LEVEL is a static enum on the Purchases default export.)
      if (__DEV__ && (Purchases as any).setLogLevel && (Purchases as any).LOG_LEVEL) {
        (Purchases as any).setLogLevel((Purchases as any).LOG_LEVEL.WARN);
      }
      Purchases.configure({
        apiKey: getIosKey(),
        appUserID: clerkUserId ?? undefined,
      });
      configured = true;
      configuredUserId = clerkUserId ?? null;
    } catch {}
    return;
  }

  // Already configured. If the signed-in user has changed, swap identities.
  if (clerkUserId && clerkUserId !== configuredUserId) {
    try {
      await Purchases.logIn(clerkUserId);
      configuredUserId = clerkUserId;
    } catch {}
  } else if (!clerkUserId && configuredUserId) {
    try {
      await Purchases.logOut();
      configuredUserId = null;
    } catch {}
  }
}

/**
 * Fetch the current customer info, or null if RC is unsupported / not ready.
 */
export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  const Purchases = loadPurchases();
  if (!Purchases || !configured) return null;
  try {
    return await Purchases.getCustomerInfo();
  } catch {
    return null;
  }
}

/**
 * Returns true when the premium entitlement is currently active in RC.
 * Use this as an optimistic fast-path before the backend webhook updates Redis.
 */
export async function isRcPremium(): Promise<boolean> {
  const info = await getCustomerInfo();
  if (!info) return false;
  return info.entitlements.active[PREMIUM_ENTITLEMENT] !== undefined;
}

/**
 * Pull the first package out of the "current" offering. We use a single
 * subscription product, so this is the one the paywall should sell.
 */
export async function getPremiumPackage(): Promise<{
  package: PurchasesPackage;
  offering: PurchasesOffering;
} | null> {
  const Purchases = loadPurchases();
  if (!Purchases || !configured) return null;
  try {
    const offerings = await Purchases.getOfferings();
    const current = offerings.current;
    if (!current) return null;
    const pkg = current.monthly ?? current.availablePackages[0] ?? null;
    if (!pkg) return null;
    return { package: pkg, offering: current };
  } catch {
    return null;
  }
}

export type PurchaseOutcome =
  | { kind: 'success'; customerInfo: CustomerInfo }
  | { kind: 'cancelled' }
  | { kind: 'error'; message: string };

/**
 * Buy the premium package. The native StoreKit sheet handles UI; we just
 * normalize the outcome.
 */
export async function purchasePremium(pkg: PurchasesPackage): Promise<PurchaseOutcome> {
  const Purchases = loadPurchases();
  if (!Purchases || !configured) {
    return { kind: 'error', message: 'In-app purchase is not available.' };
  }
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return { kind: 'success', customerInfo };
  } catch (e: any) {
    if (e?.userCancelled) return { kind: 'cancelled' };
    return { kind: 'error', message: e?.message ?? 'Purchase failed.' };
  }
}

/**
 * Apple requires every subscription app to expose a "Restore Purchases" action.
 */
export async function restorePurchases(): Promise<PurchaseOutcome> {
  const Purchases = loadPurchases();
  if (!Purchases || !configured) {
    return { kind: 'error', message: 'In-app purchase is not available.' };
  }
  try {
    const customerInfo = await Purchases.restorePurchases();
    return { kind: 'success', customerInfo };
  } catch (e: any) {
    return { kind: 'error', message: e?.message ?? 'Could not restore purchases.' };
  }
}
