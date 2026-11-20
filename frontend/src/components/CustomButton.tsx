/**
 * CustomButton Component
 * Supports primary violet, secondary, outline, danger/SOS, and icon variants.
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

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
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
      case 'secondary':
        return {
          button: { backgroundColor: Colors.accentLight },
          text: { color: Colors.primary },
          spinner: Colors.primary,
        };
      case 'outline':
        return {
          button: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: Colors.primary },
          text: { color: Colors.primary },
          spinner: Colors.primary,
        };
      case 'danger':
        return {
          button: { backgroundColor: Colors.sosRed },
          text: { color: Colors.white },
          spinner: Colors.white,
        };
      case 'ghost':
        return {
          button: { backgroundColor: 'transparent' },
          text: { color: Colors.primary },
          spinner: Colors.primary,
        };
    }
  };

  const currentVariant = getVariantStyles();

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: 8, paddingHorizontal: 14, fontSize: 13, iconSize: 16 };
      case 'large':
        return { paddingVertical: 16, paddingHorizontal: 24, fontSize: 17, iconSize: 22 };
      default:
        return { paddingVertical: 12, paddingHorizontal: 20, fontSize: 15, iconSize: 18 };
    }
  };

  const currentSize = getSizeStyles();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || isLoading}
      style={[
        styles.baseButton,
        currentVariant.button,
        {
          paddingVertical: currentSize.paddingVertical,
          paddingHorizontal: currentSize.paddingHorizontal,
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={currentVariant.spinner} size="small" />
      ) : (
        <View style={styles.contentContainer}>
          {iconName && iconPosition === 'left' && (
            <Ionicons
              name={iconName}
              size={currentSize.iconSize}
              color={currentVariant.text.color}
              style={styles.leftIcon}
            />
          )}
          <Text
            style={[
              styles.baseText,
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
              style={styles.rightIcon}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  baseText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
});

export default CustomButton;
