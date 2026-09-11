import { ThemeColors } from './types';

export const palette = {
  // Brand Blues
  blue50: '#EBF2FF',
  blue100: '#D6E4FF',
  blue500: '#1D61F2',
  blue600: '#004AC6',
  blue700: '#003896',
  blue400: '#3B82F6',
  blue300: '#60A5FA',

  // Neutrals / Grays
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#CBD5E1',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // Dark Mode Surface Accents
  darkBg: '#0B0F19',
  darkSurface: '#111827',
  darkCard: '#161E2E',
  darkInput: '#1E2433',
  darkBorder: '#2E384D',

  // Alert / Error
  red50: '#FEF2F2',
  red200: '#FCA5A5',
  red500: '#EF4444',
  red600: '#DC2626',
  red400: '#F87171',
} as const;

export const lightColors: ThemeColors = {
  // Brand & Action
  primary: '#004AC6',
  primaryDark: '#003896',
  primaryLight: '#EBF2FF',
  link: '#0052CC',

  // Backgrounds & Surfaces
  background: '#EDF1FA',
  surface: '#FAF8FF',
  card: '#FFFFFF',
  cardBorder: 'rgba(226, 232, 240, 0.7)',

  // Typography
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#848695',
  textInverse: '#FFFFFF',

  // Inputs & Form Controls
  inputBackground: '#F9FAFB',
  inputBorder: '#E5E7EB',
  inputPlaceholder: '#9CA3AF',
  inputText: '#1F2937',
  iconColor: '#737686',
  checkboxBorder: '#CBD5E1',
  checkboxBg: '#FFFFFF',

  // Feedback & Status
  error: '#DC2626',
  errorBackground: '#FEF2F2',
  errorBorder: '#FCA5A5',

  // Elevation & System
  shadowColor: '#1A2A4E',
  statusBarStyle: 'dark-content',
};

export const darkColors: ThemeColors = {
  // Brand & Action
  primary: '#3B82F6',
  primaryDark: '#2563EB',
  primaryLight: 'rgba(59, 130, 246, 0.15)',
  link: '#60A5FA',

  // Backgrounds & Surfaces
  background: '#0B0F19',
  surface: '#111827',
  card: '#161E2E',
  cardBorder: 'rgba(255, 255, 255, 0.08)',

  // Typography
  textPrimary: '#F9FAFB',
  textSecondary: '#9CA3AF',
  textTertiary: '#6B7280',
  textInverse: '#111827',

  // Inputs & Form Controls
  inputBackground: '#1E2433',
  inputBorder: '#2E384D',
  inputPlaceholder: '#6B7280',
  inputText: '#F3F4F6',
  iconColor: '#9CA3AF',
  checkboxBorder: '#4B5563',
  checkboxBg: '#1E2433',

  // Feedback & Status
  error: '#F87171',
  errorBackground: 'rgba(239, 68, 68, 0.15)',
  errorBorder: 'rgba(239, 68, 68, 0.3)',

  // Elevation & System
  shadowColor: '#000000',
  statusBarStyle: 'light-content',
};
