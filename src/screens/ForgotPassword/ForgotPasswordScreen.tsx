import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../theme/ThemeContext';

const ForgotPasswordScreen: React.FC = () => {
  const { navigate } = useAuth();
  const { colors, isDark } = useTheme();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const validateEmail = (inputEmail: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(inputEmail.trim());
  };

  const handleSendOtp = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Please enter your email address');
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      // Simulate API call to request OTP
      await new Promise<void>((resolve) => setTimeout(resolve, 800));
      navigate('OtpVerification');
    } catch {
      setErrorMessage('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('Login');
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: isDark ? colors.background : '#EDF1FA' }]}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Brand Logo Section */}
          <View style={styles.brandHeader}>
            <Image
              source={require('../../assets/logo-sec.png')}
              style={styles.brandLogo}
              resizeMode="contain"
            />
            <Text style={[styles.brandTitle, { color: colors.primary }]}>WorkPulse</Text>
          </View>

          {/* White / Dark Card Container */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
                shadowColor: colors.shadowColor,
              },
            ]}
          >
            {/* Step Indicator */}
            <View style={styles.stepContainer}>
              <View style={[styles.stepCircle, { backgroundColor: colors.primary }]}>
                <Text style={styles.stepActiveText}>1</Text>
              </View>
              <View
                style={[
                  styles.stepLine,
                  { backgroundColor: isDark ? colors.inputBorder : '#D6E4FF' },
                ]}
              />
              <View
                style={[
                  styles.stepCircle,
                  { backgroundColor: isDark ? colors.inputBackground : '#E2E8F0' },
                ]}
              >
                <Text
                  style={[
                    styles.stepInactiveText,
                    { color: isDark ? colors.textTertiary : '#64748B' },
                  ]}
                >
                  2
                </Text>
              </View>
            </View>

            {/* Title & Subtitle */}
            <Text style={[styles.title, { color: colors.textPrimary }]}>Forgot Password</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Enter your registered email address. We'll send you a One-Time Password (OTP) to reset
              your password.
            </Text>

            {/* Error Message */}
            {errorMessage ? (
              <View
                style={[
                  styles.errorBox,
                  {
                    backgroundColor: colors.errorBackground,
                    borderColor: colors.errorBorder,
                  },
                ]}
              >
                <Text style={[styles.errorText, { color: colors.error }]}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Email Field */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>Email Address</Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: isDark ? colors.inputBackground : '#FFFFFF',
                    borderColor: colors.inputBorder,
                  },
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={18}
                  color={colors.iconColor}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: colors.inputText }]}
                  placeholder="employee@workpulse.inc"
                  placeholderTextColor={colors.inputPlaceholder}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errorMessage) setErrorMessage('');
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Send OTP Button */}
            <TouchableOpacity
              style={[
                styles.sendOtpButton,
                { backgroundColor: colors.primary, shadowColor: colors.primary },
                isLoading && styles.buttonDisabled,
              ]}
              onPress={handleSendOtp}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <View style={styles.buttonContent}>
                  <Text style={styles.sendOtpButtonText}>Send OTP</Text>
                  <Ionicons
                    name="arrow-forward"
                    size={16}
                    color="#FFFFFF"
                    style={styles.buttonIcon}
                  />
                </View>
              )}
            </TouchableOpacity>

            {/* Back to Login Link */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackToLogin}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name="arrow-back"
                size={14}
                color={colors.primary}
                style={styles.backIcon}
              />
              <Text style={[styles.backButtonText, { color: colors.primary }]}>Back to Login</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Security Footer */}
          <View style={styles.footerContainer}>
            <Ionicons
              name="shield-checkmark-outline"
              size={13}
              color={colors.iconColor}
              style={styles.shieldIcon}
            />
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Secured by WorkPulse Enterprise SSO
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EDF1FA',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  brandLogo: {
    width: 28,
    height: 28,
    marginRight: 8,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#004AC6',
    letterSpacing: -0.4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 22,
    paddingVertical: 26,
    shadowColor: '#1A2A4E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.7)',
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepActive: {
    backgroundColor: '#004AC6',
  },
  stepActiveText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  stepLine: {
    width: 32,
    height: 2,
    backgroundColor: '#D6E4FF',
    marginHorizontal: 8,
  },
  stepInactive: {
    backgroundColor: '#E2E8F0',
  },
  stepInactiveText: {
    color: '#64748B',
    fontSize: 12.5,
    fontWeight: '600',
  },
  title: {
    fontSize: 21,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
    paddingHorizontal: 6,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  fieldGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    height: 44,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 13.5,
    color: '#1F2937',
    paddingVertical: 0,
  },
  sendOtpButton: {
    backgroundColor: '#004AC6',
    borderRadius: 8,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    shadowColor: '#004AC6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 2,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendOtpButtonText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  buttonIcon: {
    marginLeft: 6,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  backIcon: {
    marginRight: 6,
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0052CC',
  },
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
  },
  shieldIcon: {
    marginRight: 5,
  },
  footerText: {
    fontSize: 11.5,
    color: '#737686',
    fontWeight: '400',
  },
});

export default ForgotPasswordScreen;