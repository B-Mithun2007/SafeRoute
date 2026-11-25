/**
 * ProfileScreen (Security & Identity Management)
 * Transformed with:
 * - Ambient atmospheric backdrop & centered responsive layout
 * - Luminescent verified member card with avatar
 * - Clean grouped settings for Safety Preferences & Emergency SOS Contacts
 * - Privacy protection disclosures & authenticated logout
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Theme from '../constants/theme';
import AtmosphericBackground from '../components/AtmosphericBackground';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { Config } from '../constants/config';

export const ProfileScreen = ({ navigation }: any) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const { user, logout } = useAuth();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [offlineDataCaching, setOfflineDataCaching] = useState(true);

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm('Are you sure you want to log out of SafeRoute-AI?')) {
        void logout();
      }
      return;
    }

    Alert.alert('Sign Out', 'Are you sure you want to log out of SafeRoute-AI?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const handleAbout = () => {
    Alert.alert(
      'About SafeRoute-AI',
      `SafeRoute-AI v${Config.VERSION}\n\nBuilt for personal safety navigation using real-time illumination, pedestrian activity, and incident risk analysis.\n\nBackend: FastAPI & Scikit-Learn\nFrontend: React Native & Expo`,
      [{ text: 'OK' }]
    );
  };

  return (
    <AtmosphericBackground variant="canvas">
      <SafeAreaView style={styles.safeArea}>
        <Header title="Security & Profile" subtitle="Manage your authenticated safety settings" />

        <ScrollView contentContainerStyle={[styles.scrollContent, isDesktop && styles.desktopScrollContent]}>
          <View style={[styles.profileDeck, isDesktop && styles.desktopProfileDeck]}>
            {/* User Verified Card */}
            <View style={[styles.userCard, Theme.shadows.card]}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarLetter}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </Text>
              </View>

              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user?.name || 'Verified Member'}</Text>
                <Text style={styles.userEmail}>{user?.email || 'user@saferoute.ai'}</Text>
                {user?.phone && (
                  <View style={styles.phoneRow}>
                    <Ionicons name="call-outline" size={12} color={Theme.colors.teal} />
                    <Text style={styles.userPhone}>{user.phone}</Text>
                  </View>
                )}
              </View>

              <View style={styles.verifiedBadge}>
                <Ionicons name="shield-checkmark" size={14} color={Theme.colors.emerald} />
                <Text style={styles.verifiedBadgeText}>VERIFIED</Text>
              </View>
            </View>

            {/* Safety & Navigation Group */}
            <Text style={styles.sectionTitle}>SAFETY PROTOCOLS & CONTACTS</Text>
            <View style={[styles.card, Theme.shadows.soft]}>
              <TouchableOpacity
                style={styles.menuRow}
                onPress={() => navigation.navigate('Preferences')}
                activeOpacity={0.7}
              >
                <View style={styles.menuIconBox}>
                  <Ionicons name="options" size={18} color={Theme.colors.teal} />
                </View>
                <View style={styles.menuTexts}>
                  <Text style={styles.menuTitle}>Travel Safety Preferences</Text>
                  <Text style={styles.menuSub}>Well-lit routes, lighting priority, avoid isolated areas</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={Theme.colors.borderLight} />
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity
                style={styles.menuRow}
                onPress={() => navigation.navigate('SOS')}
                activeOpacity={0.7}
              >
                <View style={[styles.menuIconBox, { backgroundColor: Theme.colors.crimsonBg }]}>
                  <Ionicons name="alert-circle" size={18} color={Theme.colors.crimson} />
                </View>
                <View style={styles.menuTexts}>
                  <Text style={styles.menuTitle}>Emergency Trusted Contacts & SOS</Text>
                  <Text style={styles.menuSub}>Manage emergency contacts and live SMS coordinate sharing</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={Theme.colors.borderLight} />
              </TouchableOpacity>
            </View>

            {/* System Preferences */}
            <Text style={styles.sectionTitle}>DEVICE PREFERENCES</Text>
            <View style={[styles.card, Theme.shadows.soft]}>
              <View style={styles.switchRow}>
                <View style={styles.menuTexts}>
                  <Text style={styles.menuTitle}>Proximity Hazard Radar Alerts</Text>
                  <Text style={styles.menuSub}>Notify with sound when walking near recently logged hazards</Text>
                </View>
                <Switch
                  value={pushNotifications}
                  onValueChange={setPushNotifications}
                  trackColor={{ false: Theme.colors.borderLight, true: Theme.colors.teal }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.switchRow}>
                <View style={styles.menuTexts}>
                  <Text style={styles.menuTitle}>Offline Safety Cache</Text>
                  <Text style={styles.menuSub}>Cache frequent route evaluations in local persistent storage</Text>
                </View>
                <Switch
                  value={offlineDataCaching}
                  onValueChange={setOfflineDataCaching}
                  trackColor={{ false: Theme.colors.borderLight, true: Theme.colors.teal }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            {/* Legal & App Information */}
            <Text style={styles.sectionTitle}>DATA PRIVACY & SYSTEM</Text>
            <View style={[styles.card, Theme.shadows.soft]}>
              <TouchableOpacity style={styles.menuRow} onPress={handleAbout} activeOpacity={0.7}>
                <View style={styles.menuIconBox}>
                  <Ionicons name="information-circle" size={18} color={Theme.colors.teal} />
                </View>
                <View style={styles.menuTexts}>
                  <Text style={styles.menuTitle}>System Architecture & About</Text>
                  <Text style={styles.menuSub}>AI risk prediction model, version, and platform info</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={Theme.colors.borderLight} />
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity
                style={styles.menuRow}
                activeOpacity={0.7}
                onPress={() =>
                  Alert.alert(
                    'Data & Privacy Policy',
                    'SafeRoute-AI never sells or publicizes personal GPS coordinates. Hazard reports submitted with anonymous mode enabled strip all user IDs.',
                    [{ text: 'Understood' }]
                  )
                }
              >
                <View style={styles.menuIconBox}>
                  <Ionicons name="lock-closed" size={18} color={Theme.colors.teal} />
                </View>
                <View style={styles.menuTexts}>
                  <Text style={styles.menuTitle}>Zero-Knowledge Privacy Policy</Text>
                  <Text style={styles.menuSub}>How user telemetry and community reports are safeguarded</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={Theme.colors.borderLight} />
              </TouchableOpacity>
            </View>

            {/* Sign Out Button */}
            <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.8} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={18} color={Theme.colors.crimson} style={{ marginRight: 8 }} />
              <Text style={styles.logoutText}>Sign Out of SafeRoute</Text>
            </TouchableOpacity>

            <Text style={styles.versionLabel}>SafeRoute-AI • v{Config.VERSION} Lumina Edition</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </AtmosphericBackground>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 60,
  },
  desktopScrollContent: {
    paddingHorizontal: 36,
    paddingTop: 24,
  },
  profileDeck: {
    width: '100%',
  },
  desktopProfileDeck: {
    maxWidth: 720,
    alignSelf: 'center',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surfaceLight,
    borderRadius: Theme.radii.xl,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Theme.colors.obsidian,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1.5,
    borderColor: Theme.colors.teal,
  },
  avatarLetter: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  userEmail: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    marginTop: 1,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  userPhone: {
    fontSize: 11,
    color: Theme.colors.textSecondary,
    fontWeight: '500',
    marginLeft: 4,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.emeraldBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Theme.radii.full,
    borderWidth: 1,
    borderColor: Theme.colors.emeraldBorder,
  },
  verifiedBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Theme.colors.emerald,
    marginLeft: 3,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: Theme.colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 6,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: Theme.colors.surfaceLight,
    borderRadius: Theme.radii.lg,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: Theme.radii.md,
    backgroundColor: Theme.colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuTexts: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  menuSub: {
    fontSize: 11,
    color: Theme.colors.textMuted,
    marginTop: 1,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.canvas,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.surfaceLight,
    borderWidth: 1.5,
    borderColor: Theme.colors.crimsonBorder,
    borderRadius: Theme.radii.lg,
    paddingVertical: 14,
    marginTop: 8,
    marginBottom: 16,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '700',
    color: Theme.colors.crimson,
  },
  versionLabel: {
    textAlign: 'center',
    fontSize: 11,
    color: Theme.colors.textMuted,
    marginTop: 4,
  },
});

export default ProfileScreen;
