/**
 * SafeRoute Obsidian & Lumina Theme
 * Complete surface hierarchy, atmospheric gradients, layered glass tokens,
 * depth shadows, and editorial typographic styling.
 */
import { ViewStyle, TextStyle } from 'react-native';

export const Theme = {
  colors: {
    // Brand Anchors
    obsidian: '#090D16',          // Deepest midnight slate (Hero surfaces, desktop sidebar)
    obsidianElevated: '#111827',  // Elevated dark surface
    obsidianBorder: '#1E293B',    // Dark surface border
    
    // Core Neutrals
    canvas: '#F1F5F9',            // Base app canvas (Soft atmospheric gray-blue)
    surfaceLight: '#FFFFFF',      // Pure white card surfaces
    surfaceGlass: 'rgba(255, 255, 255, 0.88)', // Translucent frosted glass
    surfaceDarkGlass: 'rgba(9, 13, 22, 0.82)', // Translucent dark glass
    
    // Borders & Dividers
    borderLight: 'rgba(226, 232, 240, 0.9)',
    borderSubtle: 'rgba(15, 23, 42, 0.06)',
    borderActive: '#0D9488',
    
    // Luminescent Accents
    teal: '#0D9488',              // Primary active luminescent teal
    tealGlow: 'rgba(13, 148, 136, 0.18)',
    tealLight: '#F0FDFA',
    tealDark: '#0F766E',
    
    cyan: '#0284C7',              // Telemetry Sky/Cyan
    cyanGlow: 'rgba(2, 132, 199, 0.15)',
    cyanLight: '#E0F2FE',
    
    // Calibrated Indicators
    emerald: '#059669',           // Safe / Optimal
    emeraldBg: '#ECFDF5',
    emeraldBorder: '#A7F3D0',
    
    amber: '#D97706',             // Moderate / Caution
    amberBg: '#FFFBEB',
    amberBorder: '#FDE68A',
    
    crimson: '#DC2626',           // High Hazard
    crimsonBg: '#FEF2F2',
    crimsonBorder: '#FECACA',
    
    sosRed: '#B91C1C',            // SOS Emergency Red
    sosGlow: 'rgba(220, 38, 38, 0.28)',

    // Text Tiers
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#64748B',
    textInverse: '#FFFFFF',
    textInverseMuted: '#94A3B8',
  },

  typography: {
    hero: {
      fontSize: 32,
      fontWeight: '800',
      letterSpacing: -0.8,
      lineHeight: 38,
      color: '#0F172A',
    } as TextStyle,
    h1: {
      fontSize: 24,
      fontWeight: '700',
      letterSpacing: -0.5,
      lineHeight: 30,
      color: '#0F172A',
    } as TextStyle,
    h2: {
      fontSize: 18,
      fontWeight: '700',
      letterSpacing: -0.3,
      lineHeight: 24,
      color: '#0F172A',
    } as TextStyle,
    h3: {
      fontSize: 15,
      fontWeight: '600',
      lineHeight: 20,
      color: '#0F172A',
    } as TextStyle,
    body: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
      color: '#475569',
    } as TextStyle,
    bodyMedium: {
      fontSize: 14,
      fontWeight: '500',
      lineHeight: 20,
      color: '#0F172A',
    } as TextStyle,
    telemetryLabel: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1,
      textTransform: 'uppercase',
      color: '#64748B',
    } as TextStyle,
    caption: {
      fontSize: 12,
      fontWeight: '500',
      lineHeight: 16,
      color: '#64748B',
    } as TextStyle,
  },

  radii: {
    sm: 8,
    md: 14,
    lg: 20,
    xl: 26,
    full: 9999,
  },

  shadows: {
    soft: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 6,
      elevation: 2,
    } as ViewStyle,
    card: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.07,
      shadowRadius: 14,
      elevation: 4,
    } as ViewStyle,
    floating: {
      shadowColor: '#090D16',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 20,
      elevation: 8,
    } as ViewStyle,
    glowTeal: {
      shadowColor: '#0D9488',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 6,
    } as ViewStyle,
    glowSOS: {
      shadowColor: '#DC2626',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
      elevation: 6,
    } as ViewStyle,
  },
};

export default Theme;
