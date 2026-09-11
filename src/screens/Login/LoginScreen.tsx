import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  Dimensions,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../theme/ThemeContext';
import Ionicons from '@react-native-vector-icons/ionicons';
import { styles } from './Login.styles';

const LoginScreen: React.FC = () => {
  const { login, isLoading, navigate } = useAuth();
  const { colors, isDark } = useTheme();

  const [email, setEmail] = useState('demo@workpulse.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    if (!email.trim()) {
      setErrorMessage('Please enter your email');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Please enter your password');
      return;
    }

    setErrorMessage('');
    const success = await login(email, password);
    if (!success) {
      setErrorMessage('Invalid credentials. Please try again.');
    }
  };

  const handleForgotPassword = () => {
    navigate('ForgotPassword');
  };

  const handleSignUp = () => {
    navigate('SignUp');
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
              <Text style={[styles.label, { color: colors.textPrimary }]}>Email</Text>
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
                  placeholder="demo@workpulse.com"
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
                  placeholder="password123"
                  placeholderTextColor={colors.inputPlaceholder}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errorMessage) setErrorMessage('');
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
