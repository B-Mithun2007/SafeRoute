/**
 * IncidentMarker Component
 * Visual map marker for community safety reports.
 */
import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import { IncidentReport } from '../types/incident';

interface IncidentMarkerProps {
  incident: IncidentReport;
}

export const IncidentMarker: React.FC<IncidentMarkerProps> = ({ incident }) => {
  const getMarkerColor = () => {
    switch (incident.severity) {
      case 'high':
        return Colors.safetyRed;
      case 'medium':
        return Colors.safetyYellow;
      default:
        return Colors.info;
    }
  };

  const color = getMarkerColor();

  return (
    <View style={styles.container}>
      <View style={[styles.markerBubble, { backgroundColor: color }]}>
        <Ionicons name="warning" size={14} color={Colors.white} />
      </View>
      <View style={[styles.arrow, { borderTopColor: color }]} />
      <View style={styles.labelBubble}>
        <Text style={styles.labelText} numberOfLines={1}>
          {incident.categoryLabel}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerBubble: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  arrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
  labelBubble: {
    backgroundColor: 'rgba(26, 11, 46, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 2,
  },
  labelText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: '700',
  },
});

export default IncidentMarker;
