/**
 * RouteCard Component
 * Displays route comparison metrics: duration, distance, safety score, lighting, and hazards.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import SafetyBadge from './SafetyBadge';
import { RouteOption } from '../types/route';

interface RouteCardProps {
  route: RouteOption;
  isSelected: boolean;
  onSelect: () => void;
  onNavigateDetail?: () => void;
}

export const RouteCard: React.FC<RouteCardProps> = ({
  route,
  isSelected,
  onSelect,
  onNavigateDetail,
}) => {
  const durationMinutes = Math.round(route.durationSeconds / 60);
  const distanceKm = (route.distanceMeters / 1000).toFixed(1);

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onSelect}
      style={[
        styles.card,
        isSelected && styles.selectedCard,
      ]}
    >
      {/* Top Banner / Pill */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Text style={styles.routeName}>{route.name}</Text>
          {route.highlightPill && (
            <View style={styles.highlightBadge}>
              <Text style={styles.highlightText}>{route.highlightPill}</Text>
            </View>
          )}
        </View>

        {/* Radio Indicator */}
        <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
          {isSelected && <View style={styles.radioInner} />}
        </View>
      </View>

      {/* Safety Score & Category */}
      <View style={styles.badgeRow}>
        <SafetyBadge score={route.safetyScore} riskLevel={route.riskLevel} size="medium" />
        {!route.isBackendGenerated && (
          <Text style={styles.sampleTag}>Dev Sample</Text>
        )}
      </View>

      <Text style={styles.description}>{route.description}</Text>

      {/* Metric Pills Grid */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Ionicons name="time-outline" size={16} color={Colors.primary} />
          <Text style={styles.statValue}>{durationMinutes} min</Text>
          <Text style={styles.statLabel}>Duration</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Ionicons name="walk-outline" size={16} color={Colors.primary} />
          <Text style={styles.statValue}>{distanceKm} km</Text>
          <Text style={styles.statLabel}>Distance</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Ionicons name="sunny-outline" size={16} color={Colors.safetyYellow} />
          <Text style={styles.statValue}>{route.wellLitPercentage}%</Text>
          <Text style={styles.statLabel}>Well Lit</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Ionicons
            name="warning-outline"
            size={16}
            color={route.reportedConcernsCount > 0 ? Colors.safetyRed : Colors.safetyGreen}
          />
          <Text style={styles.statValue}>{route.reportedConcernsCount}</Text>
          <Text style={styles.statLabel}>Concerns</Text>
        </View>
      </View>

      {/* Action footer */}
      {onNavigateDetail && (
        <TouchableOpacity
          onPress={onNavigateDetail}
          style={styles.detailLink}
        >
          <Text style={styles.detailLinkText}>View Turn-by-Turn Map Details</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: Colors.gray200,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  selectedCard: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceMuted,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleGroup: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  routeName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.gray900,
  },
  highlightBadge: {
    backgroundColor: Colors.accentLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  highlightText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.gray300,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  radioOuterSelected: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sampleTag: {
    fontSize: 11,
    color: Colors.gray400,
    fontStyle: 'italic',
  },
  description: {
    fontSize: 13,
    color: Colors.gray600,
    lineHeight: 18,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.gray50,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 26,
    backgroundColor: Colors.gray200,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.gray900,
    marginTop: 2,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.gray500,
    marginTop: 1,
  },
  detailLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
  },
  detailLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
    marginRight: 4,
  },
});

export default RouteCard;
