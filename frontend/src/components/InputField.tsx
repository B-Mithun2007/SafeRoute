/**
 * InputField Component
 * Modern input component with clean focus borders, subtle tints, and clear error states.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import { Typography, BorderRadius } from '../constants/typography';

interface InputFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  isPassword?: boolean;
  containerStyle?: ViewStyle;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  iconName,
  isPassword = false,
  containerStyle,
  ...inputProps
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[Typography.captionBold, styles.label]}>{label}</Text>}
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.focusedWrapper,
          error ? styles.errorWrapper : null,
        ]}
      >
        {iconName && (
          <Ionicons
            name={iconName}
            size={18}
            color={error ? Colors.safetyRed : isFocused ? Colors.primary : Colors.gray400}
            style={styles.leftIcon}
          />
        )}
        <TextInput
          placeholderTextColor={Colors.gray400}
          secureTextEntry={isPassword && !isPasswordVisible}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[styles.textInput, Typography.body]}
          {...inputProps}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.rightIconButton}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={Colors.gray400}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={[Typography.caption, styles.errorText]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    color: Colors.gray800,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.gray200,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    height: 48,
  },
  focusedWrapper: {
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
  },
  errorWrapper: {
    borderColor: Colors.safetyRed,
    backgroundColor: Colors.safetyRedBg,
  },
  leftIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    height: '100%',
    color: Colors.gray900,
    paddingVertical: 0,
  },
  rightIconButton: {
    padding: 6,
  },
  errorText: {
    color: Colors.safetyRed,
    marginTop: 4,
  },
});

export default InputField;
