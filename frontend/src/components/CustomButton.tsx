/**
 * CustomButton Component
 * Modernized with sleek rounded styling, accessible focus states, and refined elevation.
 */
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import { Typography, BorderRadius, Shadows } from '../constants/typography';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'teal';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  disabled?: boolean;
  iconName?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  disabled = false,
  iconName,
  iconPosition = 'left',
  style,
  textStyle,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          button: { backgroundColor: Colors.primary },
          text: { color: Colors.white },
          spinner: Colors.white,
        };
      case 'teal':
        return {
          button: { backgroundColor: Colors.accent },
          text: { color: Colors.white },
          spinner: Colors.white,
        };
      case 'secondary':
        return {
          button: { backgroundColor: Colors.gray100, borderWidth: 1, borderColor: Colors.gray200 },
          text: { color: Colors.gray800 },
          spinner: Colors.gray800,
        };
      case 'outline':
        return {
          button: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: Colors.gray300 },
          text: { color: Colors.gray800 },
          spinner: Colors.gray800,
        };
      case 'danger':
        return {
          button: { backgroundColor: Colors.safetyRed },
          text: { color: Colors.white },
          spinner: Colors.white,
        };
      case 'ghost':
        return {
          button: { backgroundColor: 'transparent' },
          text: { color: Colors.gray700 },
          spinner: Colors.gray700,
        };
    }
  };

  const currentVariant = getVariantStyles();

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 7,
          paddingHorizontal: 12,
          fontSize: 12,
          iconSize: 15,
        };
      case 'large':
        return {
          paddingVertical: 14,
          paddingHorizontal: 20,
          fontSize: 15,
          iconSize: 19,
        };
      case 'medium':
      default:
        return {
          paddingVertical: 10,
          paddingHorizontal: 16,
          fontSize: 14,
          iconSize: 17,
        };
    }
  };

  const currentSize = getSizeStyles();

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled || isLoading}
      style={[
        styles.baseButton,
        currentVariant.button,
        {
          paddingVertical: currentSize.paddingVertical,
          paddingHorizontal: currentSize.paddingHorizontal,
        },
        variant === 'primary' && Shadows.subtle,
        disabled && styles.disabledButton,
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={currentVariant.spinner} />
      ) : (
        <View style={styles.contentRow}>
          {iconName && iconPosition === 'left' && (
            <Ionicons
              name={iconName}
              size={currentSize.iconSize}
              color={currentVariant.text.color}
              style={{ marginRight: 6 }}
            />
          )}
          <Text
            style={[
              Typography.button,
              currentVariant.text,
              { fontSize: currentSize.fontSize },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {iconName && iconPosition === 'right' && (
            <Ionicons
              name={iconName}
              size={currentSize.iconSize}
              color={currentVariant.text.color}
              style={{ marginLeft: 6 }}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default CustomButton;
