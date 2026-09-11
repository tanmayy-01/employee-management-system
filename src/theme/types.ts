export type ThemeMode = 'light' | 'dark' | 'system';

export type StatusBarStyle = 'light-content' | 'dark-content';

export interface ThemeColors {
  // Brand & Action
  primary: string;
  primaryDark: string;
  primaryLight: string;
  link: string;

  // Backgrounds & Surfaces
  background: string;
  surface: string;
  card: string;
  cardBorder: string;

  // Typography
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;

  // Inputs & Form Controls
  inputBackground: string;
  inputBorder: string;
  inputPlaceholder: string;
  inputText: string;
  iconColor: string;
  checkboxBorder: string;
  checkboxBg: string;

  // Feedback & Status
  error: string;
  errorBackground: string;
  errorBorder: string;

  // Elevation & System
  shadowColor: string;
  statusBarStyle: StatusBarStyle;
}

export interface ThemeContextType {
  themeMode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}
