/**
 * SafeRoute Design System — Typography and Spacing Tokens
 * Consistent typographic hierarchy and spacing scale inspired by modern fintech and maps.
 */
import { TextStyle } from 'react-native';
import Colors from './colors';

export const Typography: Record<string, TextStyle> = {
  // Display headers
  displayLarge: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.gray900,
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  displayMedium: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.gray900,
    letterSpacing: -0.3,
    lineHeight: 28,
  },

  // Section headers
  h1: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.gray900,
    letterSpacing: -0.2,
    lineHeight: 26,
  },
  h2: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.gray900,
    lineHeight: 22,
  },
  h3: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.gray900,
    lineHeight: 20,
  },

  // Body text
  bodyLarge: {
    fontSize: 15,
    fontWeight: '400',
    color: Colors.gray700,
    lineHeight: 22,
  },
  body: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.gray700,
    lineHeight: 20,
  },
  bodyMedium: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.gray800,
    lineHeight: 20,
  },

  // Supporting & captions
  caption: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.gray500,
    lineHeight: 16,
  },
  captionBold: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.gray600,
    lineHeight: 16,
  },
  micro: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.gray500,
    letterSpacing: 0.2,
    lineHeight: 14,
  },

  // Interactive buttons & tabs
  button: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const Shadows = {
  subtle: {
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  card: {
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  elevated: {
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
};

export default { Typography, Spacing, BorderRadius, Shadows };
