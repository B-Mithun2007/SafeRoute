/**
 * DesktopSidebar Component
 * Premium executive navigation sidebar for desktop and tablet screens (width >= 768px).
 * Features SafeRoute Obsidian brand mark, live telemetry status pill,
 * active indicator glow, and persistent instant-SOS trigger.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Theme from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';

interface DesktopSidebarProps {
  currentTab: string;
  onNavigate: (tabName: string) => void;
  onOpenSOS: () => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  currentTab,
  onNavigate,
  onOpenSOS,
}) => {
  const { user } = useAuth();
  const { currentAddress } = useLocation();

  const navItems = [
    { key: 'HomeTab', label: 'Command Center', icon: 'grid-outline', activeIcon: 'grid' },
    { key: 'MapTab', label: 'Spatial Navigator', icon: 'map-outline', activeIcon: 'map' },
    { key: 'ReportsTab', label: 'Hazard Dispatch', icon: 'warning-outline', activeIcon: 'warning' },
    { key: 'SafetyTab', label: 'Threat Heatmap', icon: 'shield-checkmark-outline', activeIcon: 'shield-checkmark' },
    { key: 'ProfileTab', label: 'Security & Profile', icon: 'person-outline', activeIcon: 'person' },
  ];

  return (
    <View style={styles.sidebarContainer}>
      {/* Brand Header */}
      <View style={styles.brandHeader}>
        <View style={styles.logoPill}>
          <Ionicons name="shield-half" size={20} color={Theme.colors.teal} />
        </View>
        <View style={styles.brandTexts}>
          <Text style={styles.brandTitle}>SafeRoute</Text>
          <Text style={styles.brandBadge}>LUMINA v1.0</Text>
        </View>
      </View>

      {/* Live Telemetry Status Pill */}
      <View style={styles.telemetryCard}>
        <View style={styles.telemetryTop}>
          <View style={styles.livePulse} />
          <Text style={styles.telemetryLabel}>GPS TELEMETRY ACTIVE</Text>
        </View>
        <Text style={styles.telemetrySub} numberOfLines={1}>
          {currentAddress || 'Locating verified satellites...'}
        </Text>
      </View>

      {/* Navigation Links Group */}
      <View style={styles.navGroup}>
        <Text style={styles.groupHeader}>PRIMARY SYSTEMS</Text>
        {navItems.map((item) => {
          const isActive = currentTab === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              onPress={() => onNavigate(item.key)}
              style={[styles.navItem, isActive && styles.activeNavItem]}
              activeOpacity={0.8}
            >
              <View style={[styles.navIconBox, isActive && styles.activeNavIconBox]}>
                <Ionicons
                  name={(isActive ? item.activeIcon : item.icon) as any}
                  size={18}
                  color={isActive ? Theme.colors.teal : Theme.colors.textInverseMuted}
                />
              </View>
              <Text style={[styles.navLabel, isActive && styles.activeNavLabel]}>
                {item.label}
              </Text>
              {isActive && <View style={styles.activeIndicatorBar} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Instant SOS Action in Sidebar */}
      <View style={styles.sosSection}>
        <TouchableOpacity
          style={[styles.sosButton, Theme.shadows.glowSOS]}
          onPress={onOpenSOS}
          activeOpacity={0.85}
        >
          <Ionicons name="alert-circle" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.sosButtonText}>CRITICAL SOS</Text>
        </TouchableOpacity>
      </View>

      {/* Authenticated User Footer Pill */}
      <View style={styles.userFooter}>
        <View style={styles.userAvatar}>
          <Text style={styles.avatarLetter}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </Text>
        </View>
        <View style={styles.userTexts}>
          <Text style={styles.userName} numberOfLines={1}>{user?.name || 'Authorized User'}</Text>
          <Text style={styles.userEmail} numberOfLines={1}>{user?.email || 'Protected Member'}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebarContainer: {
    width: 260,
    height: '100%',
    backgroundColor: Theme.colors.obsidian,
    borderRightWidth: 1,
    borderRightColor: Theme.colors.obsidianBorder,
    paddingVertical: 24,
    paddingHorizontal: 16,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 6,
  },
  logoPill: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(13, 148, 136, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(13, 148, 136, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  brandTexts: {
    flex: 1,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  brandBadge: {
    fontSize: 9,
    fontWeight: '700',
    color: Theme.colors.teal,
    letterSpacing: 0.8,
  },
  telemetryCard: {
    backgroundColor: 'rgba(17, 24, 39, 0.8)',
    borderRadius: Theme.radii.md,
    padding: 10,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(30, 41, 59, 0.8)',
  },
  telemetryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  livePulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Theme.colors.emerald,
    marginRight: 6,
  },
  telemetryLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Theme.colors.emerald,
    letterSpacing: 0.8,
  },
  telemetrySub: {
    fontSize: 11,
    color: Theme.colors.textInverseMuted,
  },
  navGroup: {
    flex: 1,
  },
  groupHeader: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 1,
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: Theme.radii.md,
    marginBottom: 4,
    position: 'relative',
  },
  activeNavItem: {
    backgroundColor: 'rgba(17, 24, 39, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(13, 148, 136, 0.25)',
  },
  navIconBox: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  activeNavIconBox: {
    borderRadius: 6,
    backgroundColor: 'rgba(13, 148, 136, 0.1)',
  },
  navLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: Theme.colors.textInverseMuted,
    flex: 1,
  },
  activeNavLabel: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  activeIndicatorBar: {
    width: 4,
    height: 16,
    borderRadius: 2,
    backgroundColor: Theme.colors.teal,
    marginLeft: 6,
  },
  sosSection: {
    marginBottom: 16,
  },
  sosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.crimson,
    paddingVertical: 12,
    borderRadius: Theme.radii.md,
  },
  sosButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  userFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.obsidianBorder,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(13, 148, 136, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: Theme.colors.teal,
  },
  avatarLetter: {
    color: Theme.colors.teal,
    fontWeight: '800',
    fontSize: 13,
  },
  userTexts: {
    flex: 1,
  },
  userName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userEmail: {
    fontSize: 10,
    color: Theme.colors.textInverseMuted,
  },
});

export default DesktopSidebar;
