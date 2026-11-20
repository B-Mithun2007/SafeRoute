/**
 * SplashScreen
 * Displays SafeRoute-AI branding, logo pulse, and handles initial route transition.
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import { Config } from '../constants/config';
import { useAuth } from '../context/AuthContext';

export const SplashScreen = ({ navigation }: any) => {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    const timer = setTimeout(() => {
      if (isAuthenticated) {
        navigation.replace('Main');
      } else {
        navigation.replace('Onboarding');
      }
    }, 1800);

    return () => clearTimeout(timer);
  }, [isAuthenticated, isLoading, navigation]);

  return (
    <View style={styles.container}>
      {/* Decorative gradient glowing circles */}
      <View style={styles.glowCircle1} />
      <View style={styles.glowCircle2} />

      <View style={styles.content}>
        {/* Brand Shield Logo */}
        <View style={styles.logoBadge}>
          <Ionicons name="shield-checkmark" size={54} color={Colors.white} />
        </View>

        <Text style={styles.brandTitle}>SafeRoute-AI</Text>
        <Text style={styles.tagline}>{Config.TAGLINE}</Text>

        <View style={styles.pillContainer}>
          <Ionicons name="navigate" size={14} color={Colors.accent} />
          <Text style={styles.pillText}>Intelligent Women's Safety Navigation</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.versionText}>Version {Config.VERSION} • Hackathon Edition</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glowCircle1: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(121, 40, 202, 0.28)',
    top: '20%',
    left: '10%',
  },
  glowCircle2: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(199, 125, 255, 0.18)',
    bottom: '25%',
    right: '10%',
  },
  content: {
    alignItems: 'center',
    zIndex: 10,
    paddingHorizontal: 24,
  },
  logoBadge: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: Colors.accentLight,
    fontWeight: '500',
    marginBottom: 20,
    textAlign: 'center',
  },
  pillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  pillText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
  },
  versionText: {
    color: Colors.gray400,
    fontSize: 12,
  },
});

export default SplashScreen;
