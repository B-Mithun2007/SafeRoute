/**
 * SafetyBadge Component
 * Displays color-coded risk indicator and numerical safety score.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import { RiskLevel } from '../types/route';

interface SafetyBadgeProps {
  score?: number;
  riskLevel?: RiskLevel;
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
}

export const SafetyBadge: React.FC<SafetyBadgeProps> = ({
  score,
  riskLevel = 'LOW_RISK',
  size = 'medium',
  showIcon = true,
}) => {
  const getBadgeConfig = () => {
    switch (riskLevel) {
      case 'LOW_RISK':
        return {
          bg: Colors.safetyGreenBg,
          border: Colors.safetyGreenBorder,
          text: Colors.safetyGreen,
          label: 'Low Risk',
          icon: 'shield-checkmark' as const,
        };
      case 'MODERATE_RISK':
        return {
          bg: Colors.safetyYellowBg,
          border: Colors.safetyYellowBorder,
          text: Colors.safetyYellow,
          label: 'Moderate Risk',
          icon: 'alert-circle' as const,
        };
      case 'HIGH_RISK':
      case 'ELEVATED_RISK':
        return {
          bg: Colors.safetyRedBg,
          border: Colors.safetyRedBorder,
          text: Colors.safetyRed,
          label: 'Higher Risk',
          icon: 'warning' as const,
        };
      default:
        return {
          bg: Colors.gray100,
          border: Colors.gray300,
          text: Colors.gray600,
          label: 'Unknown',
          icon: 'help-circle' as const,
        };
    }
  };

  const config = getBadgeConfig();

  const isSmall = size === 'small';
  const isLarge = size === 'large';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.bg,
          borderColor: config.border,
          paddingVertical: isSmall ? 3 : isLarge ? 8 : 5,
          paddingHorizontal: isSmall ? 8 : isLarge ? 14 : 10,
        },
      ]}
    >
      {showIcon && (
        <Ionicons
          name={config.icon}
          size={isSmall ? 12 : isLarge ? 18 : 14}
          color={config.text}
          style={styles.icon}
        />
      )}
      <Text
        style={[
          styles.text,
          {
            color: config.text,
            fontSize: isSmall ? 11 : isLarge ? 15 : 12,
            fontWeight: isLarge ? '700' : '600',
          },
        ]}
      >
        {score !== undefined ? `${score}/100 • ` : ''}
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 4,
  },
  text: {
    letterSpacing: 0.2,
  },
});

export default SafetyBadge;
