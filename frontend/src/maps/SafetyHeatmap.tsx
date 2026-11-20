/**
 * SafetyHeatmap Component
 * Renders colored safety segment legends, disclaimers, and metric summaries.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';

interface SafetyHeatmapProps {
  showDisclaimer?: boolean;
}

export const SafetyHeatmapLegend: React.FC<SafetyHeatmapProps> = ({
  showDisclaimer = true,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Safety Zone Indicators</Text>
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: Colors.safetyGreen }]} />
          <Text style={styles.legendText}>Low Risk (75-100)</Text>
        </View>

        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: Colors.safetyYellow }]} />
          <Text style={styles.legendText}>Moderate (50-74)</Text>
        </View>

        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: Colors.safetyRed }]} />
          <Text style={styles.legendText}>Elevated (&lt;50)</Text>
        </View>
      </View>

      {showDisclaimer && (
        <View style={styles.disclaimerContainer}>
          <Ionicons name="information-circle-outline" size={14} color={Colors.gray500} />
          <Text style={styles.disclaimerText}>
            Safety estimates are calculated from reported incidents, lighting, and time of travel. Missing data is displayed as unknown, not safe. Always stay alert.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.gray200,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.gray900,
    marginBottom: 8,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.gray700,
  },
  disclaimerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.gray50,
    padding: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  disclaimerText: {
    fontSize: 10,
    color: Colors.gray600,
    marginLeft: 6,
    flex: 1,
    lineHeight: 14,
  },
});

export default SafetyHeatmapLegend;
