/**
 * IncidentCard Component
 * Displays community-reported safety hazards with severity indicators.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import { IncidentReport, IncidentCategory, IncidentSeverity } from '../types/incident';

interface IncidentCardProps {
  incident: IncidentReport;
  onPress?: () => void;
}

export const IncidentCard: React.FC<IncidentCardProps> = ({ incident, onPress }) => {
  const getCategoryIcon = (category: IncidentCategory): keyof typeof Ionicons.glyphMap => {
    switch (category) {
      case 'poor_lighting':
        return 'flashlight-outline';
      case 'harassment':
        return 'hand-left-outline';
      case 'isolated_road':
        return 'walk-outline';
      case 'suspicious_activity':
        return 'eye-outline';
      case 'unsafe_crowd':
        return 'people-outline';
      default:
        return 'alert-circle-outline';
    }
  };

  const getSeverityStyle = (severity: IncidentSeverity) => {
    switch (severity) {
      case 'high':
        return {
          bg: Colors.safetyRedBg,
          text: Colors.safetyRed,
          border: Colors.safetyRedBorder,
          label: 'High Severity',
        };
      case 'medium':
        return {
          bg: Colors.safetyYellowBg,
          text: Colors.safetyYellow,
          border: Colors.safetyYellowBorder,
          label: 'Caution',
        };
      default:
        return {
          bg: Colors.infoBg,
          text: Colors.info,
          border: '#BFDBFE',
          label: 'Informational',
        };
    }
  };

  const severityConfig = getSeverityStyle(incident.severity);

  const formatTimeAgo = (dateStr: string): string => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours < 1) return 'Just now';
      if (diffHours === 1) return '1 hr ago';
      if (diffHours < 24) return `${diffHours} hrs ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} d ago`;
    } catch {
      return 'Recently';
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.8 : 1}
      onPress={onPress}
      style={styles.card}
    >
      <View style={styles.topRow}>
        <View style={styles.iconCircle}>
          <Ionicons
            name={getCategoryIcon(incident.category)}
            size={18}
            color={Colors.primary}
          />
        </View>

        <View style={styles.titleArea}>
          <Text style={styles.categoryTitle}>{incident.categoryLabel}</Text>
          {incident.locationName && (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={12} color={Colors.gray500} />
              <Text style={styles.locationText}>{incident.locationName}</Text>
            </View>
          )}
        </View>

        <View
          style={[
            styles.severityPill,
            { backgroundColor: severityConfig.bg, borderColor: severityConfig.border },
          ]}
        >
          <Text style={[styles.severityText, { color: severityConfig.text }]}>
            {severityConfig.label}
          </Text>
        </View>
      </View>

      <Text style={styles.description}>{incident.description}</Text>

      <View style={styles.footerRow}>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={13} color={Colors.gray400} />
          <Text style={styles.metaText}>{formatTimeAgo(incident.reportedAt)}</Text>
        </View>

        <Text style={styles.anonymousBadge}>
          {incident.anonymous ? 'Anonymous Report' : 'Verified Community Member'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.gray200,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  titleArea: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.gray900,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  locationText: {
    fontSize: 11,
    color: Colors.gray500,
    marginLeft: 2,
  },
  severityPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  severityText: {
    fontSize: 10,
    fontWeight: '700',
  },
  description: {
    fontSize: 13,
    color: Colors.gray700,
    lineHeight: 18,
    marginBottom: 10,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
    paddingTop: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 11,
    color: Colors.gray400,
    marginLeft: 4,
  },
  anonymousBadge: {
    fontSize: 11,
    color: Colors.gray500,
    fontStyle: 'italic',
  },
});

export default IncidentCard;
