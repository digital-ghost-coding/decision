import { Easing, Platform } from 'react-native';
import type { TextStyle } from 'react-native';
import type { IconWeight } from 'phosphor-react-native';

export const colors = {
  background: '#F7F8FC',
  border: '#E2E3EA',
  danger: '#B42318',
  dangerMuted: '#A55243',
  dangerStrong: '#D9554D',
  dangerSoft: '#FBEDEA',
  disabled: '#E2E3EC',
  disabledText: '#A4A5B1',
  focus: '#8586F2',
  journeyDawn: '#F8EFE7',
  journeyLavender: '#EEEFFC',
  journeySage: '#EAF3ED',
  journeySky: '#EAF2F7',
  journeySunset: '#F8EEE8',
  journeyTwilight: '#EFEAF5',
  muted: '#989AA8',
  primary: '#5B5CE2',
  primaryDark: '#30316F',
  primaryOnDark: '#EEEEFF',
  primaryOnDarkMuted: '#D9D9FF',
  primarySoft: '#ECECFC',
  primarySurface: '#F2F2FC',
  secondaryText: '#646675',
  success: '#277A5A',
  successSoft: '#E8F6F0',
  surface: '#FFFFFF',
  surfaceMuted: '#F2F3F7',
  surfaceMutedStrong: '#E4E5EB',
  text: '#171823',
  warning: '#8A5B14',
  warningSoft: '#FFF7E8',
  white: '#FFFFFF',
};

export const spacing = {
  xxs: 4,
  xs: 6,
  sm: 10,
  base: 12,
  md: 16,
  ml: 20,
  lg: 24,
  xl: 32,
  xxl: 40,
  huge: 48,
};

export const radii = {
  xs: 10,
  sm: 12,
  base: 14,
  field: 16,
  md: 18,
  card: 22,
  lg: 24,
  pill: 999,
};

export const layout = {
  compactContentWidth: 560,
  contentWidth: 640,
  wideContentWidth: 720,
  horizontalPadding: spacing.lg,
  touchTarget: 44,
};

/**
 * Les familles restent séparées même tant qu'elles utilisent la pile système.
 * La future police de marque pourra ainsi remplacer uniquement `display`,
 * sans affecter la lisibilité des textes courants.
 */
export const fontFamilies = {
  display:
    Platform.select({
      android: 'sans-serif',
      default: 'System',
      ios: 'System',
      web: 'system-ui',
    }) ?? 'System',
  body:
    Platform.select({
      android: 'sans-serif',
      default: 'System',
      ios: 'System',
      web: 'system-ui',
    }) ?? 'System',
} as const;

export const typography = {
  displayLarge: {
    fontFamily: fontFamilies.display,
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: -1.2,
    lineHeight: 48,
  },
  displayMedium: {
    fontFamily: fontFamilies.display,
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1,
    lineHeight: 43,
  },
  headingLarge: {
    fontFamily: fontFamilies.display,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.7,
    lineHeight: 34,
  },
  headingMedium: {
    fontFamily: fontFamilies.display,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.4,
    lineHeight: 28,
  },
  bodyLarge: {
    fontFamily: fontFamilies.body,
    fontSize: 18,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 28,
  },
  bodyMedium: {
    fontFamily: fontFamilies.body,
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 24,
  },
  caption: {
    fontFamily: fontFamilies.body,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.1,
    lineHeight: 18,
  },
} as const satisfies Record<
  | 'displayLarge'
  | 'displayMedium'
  | 'headingLarge'
  | 'headingMedium'
  | 'bodyLarge'
  | 'bodyMedium'
  | 'caption',
  TextStyle
>;

export type TypographyToken = keyof typeof typography;

export const iconSizes = {
  xs: 14,
  sm: 18,
  md: 22,
  lg: 24,
  xl: 40,
} as const;

export const iconWeights = {
  regular: 'regular',
  medium: 'bold',
  active: 'fill',
} as const satisfies Record<string, IconWeight>;

export const shadows = {
  card: {
    shadowColor: '#252633',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 2,
  },
  elevated: {
    shadowColor: '#252633',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.13,
    shadowRadius: 18,
    elevation: 8,
  },
  primary: {
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 5,
  },
};

export const motion = {
  duration: {
    instant: 120,
    fast: 180,
    standard: 240,
    entrance: 360,
  },
  easing: {
    enter: Easing.bezier(0.22, 1, 0.36, 1),
    exit: Easing.bezier(0.4, 0, 1, 1),
    standard: Easing.bezier(0.2, 0, 0, 1),
  },
  pressScale: 0.985,
  subtlePressScale: 0.992,
  spring: {
    damping: 20,
    mass: 0.75,
    stiffness: 240,
  },
};

export const hapticPatterns = {
  primaryAction: 'light',
  selection: 'selection',
  success: 'success',
} as const;
