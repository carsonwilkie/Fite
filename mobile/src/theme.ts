// Fite Finance — Mobile Theme
// Mirrors the website palette: navy / cyan / gold with glass-card surfaces.

export const Colors = {
  // Base canvas
  bg: '#020817',
  bgDeep: '#010512',
  surface: '#0d1b2a',
  surfaceAlt: '#0f2236',
  surfaceHi: '#142a44',
  surfaceGlass: 'rgba(15, 34, 54, 0.55)',

  // Borders
  border: '#1e3a5f',
  borderLight: '#1a2e4a',
  borderGlow: 'rgba(79, 195, 247, 0.35)',
  borderGold: 'rgba(201, 168, 76, 0.45)',

  // Brand
  primary: '#1565C0',
  primaryLight: '#1976D2',
  primaryDeep: '#0d47a1',
  secondary: '#4FC3F7',
  secondaryDeep: '#29b6f6',
  cyan: '#4FC3F7',
  cyanGlow: 'rgba(79, 195, 247, 0.18)',

  // Premium gold
  gold: '#c9a84c',
  goldLight: '#e0be6e',
  goldGlow: 'rgba(201, 168, 76, 0.18)',

  // Text
  text: '#e8f4f8',
  textBright: '#ffffff',
  textMuted: '#7a9ab5',
  textFaint: '#4a6a85',
  textDim: '#33506e',

  // Semantic
  success: '#22c55e',
  successGlow: 'rgba(34, 197, 94, 0.18)',
  warning: '#f59e0b',
  warningGlow: 'rgba(245, 158, 11, 0.18)',
  error: '#ef4444',
  errorGlow: 'rgba(239, 68, 68, 0.18)',

  // Util
  white: '#ffffff',
  black: '#000000',
  overlay: 'rgba(2, 8, 23, 0.85)',
  overlayDeep: 'rgba(1, 5, 18, 0.92)',
} as const;

// Gradient tuples used by expo-linear-gradient.
export const Gradients = {
  hero: ['#0a1a2f', '#020817', '#020817'] as const,
  heroDeep: ['#142a44', '#0a1a2f', '#020817'] as const,
  primary: ['#1976D2', '#1565C0'] as const,
  primaryGlow: ['#4FC3F7', '#1976D2'] as const,
  cyan: ['#4FC3F7', '#1976D2'] as const,
  gold: ['#e0be6e', '#c9a84c'] as const,
  goldDeep: ['#c9a84c', '#8a7536'] as const,
  card: ['rgba(20, 42, 68, 0.6)', 'rgba(13, 27, 42, 0.3)'] as const,
  cardHi: ['rgba(31, 64, 104, 0.65)', 'rgba(15, 34, 54, 0.35)'] as const,
  borderCyan: ['rgba(79,195,247,0.55)', 'rgba(79,195,247,0.08)'] as const,
  borderGold: ['rgba(201,168,76,0.55)', 'rgba(201,168,76,0.08)'] as const,
  borderGhost: ['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.04)'] as const,
  danger: ['#ef4444', '#b91c1c'] as const,
  success: ['#22c55e', '#15803d'] as const,
  premium: ['#e0be6e', '#c9a84c', '#8a7536'] as const,
} as const;

export const Typography = {
  fonts: {
    // Loaded via expo-font in app/_layout.tsx
    sans: 'Inter_400Regular',
    sansMedium: 'Inter_500Medium',
    sansSemibold: 'Inter_600SemiBold',
    sansBold: 'Inter_700Bold',
    display: 'Manrope_700Bold',
    displayMedium: 'Manrope_500Medium',
    displaySemibold: 'Manrope_600SemiBold',
    displayExtra: 'Manrope_800ExtraBold',
  },
  sizes: {
    xxs: 10,
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    xxl: 30,
    xxxl: 38,
    display: 48,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    label: 1.2,
    eyebrow: 2.4,
  },
} as const;

export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  huge: 64,
} as const;

export const Radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  xxl: 28,
  full: 9999,
} as const;

export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
  cardLow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 2,
  },
  glow: {
    shadowColor: '#4FC3F7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 10,
  },
  goldGlow: {
    shadowColor: '#c9a84c',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 10,
  },
  successGlow: {
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

// Animation timing tokens (ms) — keep things snappy.
export const Motion = {
  fast: 150,
  base: 220,
  med: 320,
  slow: 480,
  spring: { damping: 18, stiffness: 220, mass: 0.7 },
  springSoft: { damping: 22, stiffness: 140, mass: 0.9 },
  springBouncy: { damping: 12, stiffness: 260, mass: 0.7 },
} as const;

export type ThemeColor = keyof typeof Colors;
