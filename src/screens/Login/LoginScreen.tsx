import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../theme/ThemeContext';
import Ionicons from '@react-native-vector-icons/ionicons';
import { styles } from './Login.styles';

const LoginScreen: React.FC = () => {
  const { login, isLoading, navigate, authError, clearAuthError } = useAuth();
  const { colors, isDark } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const validateEmail = (inputEmail: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(inputEmail.trim());
  };

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Please enter your work email address');
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address (e.g., alex@workpulse.io)');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password');
      return;
    }

    setErrorMessage('');
    clearAuthError();

    const success = await login(trimmedEmail, password, rememberMe);
    if (!success) {
      // If login failed, the error is handled and presented in the error box
      setErrorMessage(authError || 'Wrong Credential');
    }
  };

  const handleForgotPassword = () => {
    clearAuthError();
    navigate('ForgotPassword');
  };

  const handleSignUp = () => {
    clearAuthError();
    navigate('SignUp');
  };

  const displayedError = errorMessage || authError;

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
              source={require('../../assets/app-icon.png')}
              style={styles.brandIcon}
              resizeMode="contain"
            />
            <Text style={[styles.brandTitle, { color: colors.primary }]}>WorkPulse</Text>
          </View>

          {/* White / Dark Card */}
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
            <Text style={[styles.title, { color: colors.textPrimary }]}>Welcome back</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Please enter your details to sign in.
            </Text>

            {/* Error Message */}
            {displayedError ? (
              <View
                style={[
                  styles.errorBox,
                  {
                    backgroundColor: colors.errorBackground,
                    borderColor: colors.errorBorder,
                  },
                ]}
              >
                <Ionicons
                  name="alert-circle-outline"
                  size={16}
                  color={colors.error}
                  style={{ marginRight: 6, marginTop: 1 }}
                />
                <Text style={[styles.errorText, { color: colors.error, flex: 1 }]}>
                  {displayedError}
                </Text>
              </View>
            ) : null}

            {/* Email Field */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>Work Email</Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: isDark ? colors.inputBackground : '#F9FAFB',
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
                  placeholder="alex@workpulse.io"
                  placeholderTextColor={colors.inputPlaceholder}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errorMessage || authError) {
                      setErrorMessage('');
                      clearAuthError();
                    }
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>Password</Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: isDark ? colors.inputBackground : '#F9FAFB',
                    borderColor: colors.inputBorder,
                  },
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color={colors.iconColor}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: colors.inputText }]}
                  placeholder="••••••••"
                  placeholderTextColor={colors.inputPlaceholder}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errorMessage || authError) {
                      setErrorMessage('');
                      clearAuthError();
                    }
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={19}
                    color={colors.iconColor}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Remember Me & Forgot Password Row */}
            <View style={styles.rememberRow}>
              <TouchableOpacity
                style={styles.checkboxTouch}
                onPress={() => setRememberMe(!rememberMe)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkbox,
                    {
                      borderColor: colors.checkboxBorder,
                      backgroundColor: rememberMe
                        ? colors.primary
                        : isDark
                          ? colors.inputBackground
                          : '#FFFFFF',
                    },
                  ]}
                >
                  {rememberMe && <Ionicons name="checkmark" size={11} color="#FFFFFF" />}
                </View>
                <Text style={[styles.rememberText, { color: colors.textSecondary }]}>
                  Remember me
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleForgotPassword}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </View>

            {/* Sign In Button */}
            <TouchableOpacity
              style={[
                styles.signInButton,
                { backgroundColor: colors.primary, shadowColor: colors.primary },
                isLoading && styles.buttonDisabled,
              ]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.signInButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Bottom Contact Admin Row */}
            <View style={styles.bottomRow}>
              <Text style={[styles.bottomText, { color: colors.textSecondary }]}>
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity onPress={handleSignUp} activeOpacity={0.7}>
                <Text style={[styles.contactAdminLink, { color: colors.primary }]}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
