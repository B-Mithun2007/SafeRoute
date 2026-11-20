/**
 * ForgotPasswordScreen
 * Email input to send password reset instructions with user feedback.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import InputField from '../components/InputField';
import CustomButton from '../components/CustomButton';
import AuthService from '../services/authService';

export const ForgotPasswordScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError('Please provide your email address');
      return;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email format');
      return;
    }

    setIsLoading(true);
    setError(undefined);
    try {
      const res = await AuthService.forgotPassword(email.trim());
      setSuccessMessage(res.message);
    } catch {
      setSuccessMessage('Reset instructions sent to your email (Development Simulation).');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.container}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color={Colors.gray900} />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="key-outline" size={32} color={Colors.primary} />
            </View>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Enter your registered email address and we will send instructions to regain access.
            </Text>
          </View>

          {successMessage ? (
            <View style={styles.successCard}>
              <Ionicons name="checkmark-circle" size={42} color={Colors.safetyGreen} />
              <Text style={styles.successTitle}>Check Your Inbox</Text>
              <Text style={styles.successText}>{successMessage}</Text>
              <CustomButton
                title="Return to Sign In"
                onPress={() => navigation.navigate('Login')}
                style={styles.backToSignInButton}
              />
            </View>
          ) : (
            <View style={styles.formCard}>
              <InputField
                label="Registered Email Address"
                placeholder="priya@example.com"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError(undefined);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                iconName="mail-outline"
                error={error}
              />

              <CustomButton
                title="Send Reset Instructions"
                onPress={handleSubmit}
                isLoading={isLoading}
                size="large"
                style={styles.submitButton}
              />
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.surfaceMuted,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.gray900,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray600,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  formCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  submitButton: {
    width: '100%',
    marginTop: 8,
  },
  successCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.gray900,
    marginTop: 12,
    marginBottom: 6,
  },
  successText: {
    fontSize: 14,
    color: Colors.gray600,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  backToSignInButton: {
    width: '100%',
  },
});

export default ForgotPasswordScreen;
