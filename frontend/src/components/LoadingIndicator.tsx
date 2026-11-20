/**
 * LoadingIndicator Component
 * Styled activity spinner with branding message.
 */
import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import Colors from '../constants/colors';

interface LoadingIndicatorProps {
  message?: string;
  size?: 'small' | 'large';
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  message = 'Calculating safe routes...',
  size = 'large',
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <ActivityIndicator size={size} color={Colors.primary} />
        {message && <Text style={styles.message}>{message}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: Colors.white,
    paddingVertical: 20,
    paddingHorizontal: 28,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  message: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray700,
    textAlign: 'center',
  },
});

export default LoadingIndicator;
