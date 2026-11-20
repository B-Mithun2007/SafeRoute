/**
 * ProfileScreen (Profile Tab)
 * User profile overview, travel preferences, emergency contacts, privacy disclaimers,
 * and account logout.
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { Config } from '../constants/config';

export const ProfileScreen = ({ navigation }: any) => {
  const { user, logout } = useAuth();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [offlineDataCaching, setOfflineDataCaching] = useState(true);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out of SafeRoute-AI?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          navigation.replace('Auth');
        },
      },
    ]);
  };

  const handleAbout = () => {
    Alert.alert(
      'About SafeRoute-AI',
      `SafeRoute-AI v${Config.VERSION}\n\nBuilt for women's safety navigation using AI-powered lighting, foot activity, and incident risk analysis.\n\nBackend: FastAPI & Scikit-Learn\nFrontend: React Native & Expo`,
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Profile & Settings" subtitle="Personalize your safety experience" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarLetter}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'Verified Traveler'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
            {user?.phone && <Text style={styles.userPhone}>{user.phone}</Text>}
          </View>
        </View>

        {/* Quick Links Section */}
        <Text style={styles.sectionTitle}>Safety & Navigation</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => navigation.navigate('Preferences')}
          >
            <View style={styles.menuIconBox}>
              <Ionicons name="options-outline" size={20} color={Colors.primary} />
            </View>
            <View style={styles.menuTexts}>
              <Text style={styles.menuTitle}>Travel Safety Preferences</Text>
              <Text style={styles.menuSub}>Well-lit routes, lighting priority, avoid isolated areas</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.gray400} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => navigation.navigate('SOS')}
          >
            <View style={[styles.menuIconBox, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="shield-outline" size={20} color={Colors.sosRed} />
            </View>
            <View style={styles.menuTexts}>
              <Text style={styles.menuTitle}>Emergency Contacts & SOS</Text>
              <Text style={styles.menuSub}>Manage trusted circle and live GPS sharing</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.gray400} />
          </TouchableOpacity>
        </View>

        {/* System Settings */}
        <Text style={styles.sectionTitle}>Preferences & Notifications</Text>
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View style={styles.menuTexts}>
              <Text style={styles.menuTitle}>Hazard Proximity Alerts</Text>
              <Text style={styles.menuSub}>Receive sound notifications when walking near recent reports</Text>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{ false: Colors.gray300, true: Colors.primaryLight }}
              thumbColor={pushNotifications ? Colors.primary : Colors.white}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.switchRow}>
            <View style={styles.menuTexts}>
              <Text style={styles.menuTitle}>Offline Safety Caching</Text>
              <Text style={styles.menuSub}>Cache frequent route safety scores in local storage</Text>
            </View>
            <Switch
              value={offlineDataCaching}
              onValueChange={setOfflineDataCaching}
              trackColor={{ false: Colors.gray300, true: Colors.primaryLight }}
              thumbColor={offlineDataCaching ? Colors.primary : Colors.white}
            />
          </View>
        </View>

        {/* Legal & App Information */}
        <Text style={styles.sectionTitle}>About & Transparency</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.menuRow} onPress={handleAbout}>
            <View style={styles.menuIconBox}>
              <Ionicons name="information-circle-outline" size={20} color={Colors.primary} />
            </View>
            <View style={styles.menuTexts}>
              <Text style={styles.menuTitle}>About SafeRoute-AI</Text>
              <Text style={styles.menuSub}>Architecture, version, and AI algorithm details</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.gray400} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() =>
              Alert.alert(
                'Data & Privacy Policy',
                'SafeRoute-AI never sells or publicizes personal GPS coordinates. Hazard reports submitted with anonymous mode enabled strip all user IDs.',
                [{ text: 'Understood' }]
              )
            }
          >
            <View style={styles.menuIconBox}>
              <Ionicons name="lock-closed-outline" size={20} color={Colors.primary} />
            </View>
            <View style={styles.menuTexts}>
              <Text style={styles.menuTitle}>Privacy & Data Protection</Text>
              <Text style={styles.menuSub}>How your location and reports are kept private</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.gray400} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.8} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={Colors.sosRed} style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Sign Out of Account</Text>
        </TouchableOpacity>

        <Text style={styles.versionLabel}>SafeRoute-AI • v{Config.VERSION} Production-Ready Architecture</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.surfaceMuted,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 40,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.gray200,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarLetter: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.white,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.gray900,
  },
  userEmail: {
    fontSize: 13,
    color: Colors.gray500,
    marginTop: 2,
  },
  userPhone: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.gray700,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 6,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.gray200,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  menuIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuTexts: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.gray900,
  },
  menuSub: {
    fontSize: 11,
    color: Colors.gray500,
    marginTop: 2,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray100,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: '#FECACA',
    borderRadius: 16,
    paddingVertical: 14,
    marginTop: 10,
    marginBottom: 16,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.sosRed,
  },
  versionLabel: {
    textAlign: 'center',
    fontSize: 11,
    color: Colors.gray400,
    marginTop: 6,
  },
});

export default ProfileScreen;
