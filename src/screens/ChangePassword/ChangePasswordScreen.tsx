import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../theme/ThemeContext';
import { styles } from './ChangePassword.styles';

export const ChangePasswordScreen: React.FC = () => {
  const { navigate, goBack } = useAuth();
  const { colors, isDark } = useTheme();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Password requirement checks
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumberOrSymbol = /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);
  const isRequirementsMet = hasMinLength && hasUppercase && hasNumberOrSymbol;

  const handleUpdatePassword = async () => {
    if (!currentPassword.trim()) {
      setErrorMessage('Please enter your current password');
      return;
    }
    if (!newPassword.trim()) {
      setErrorMessage('Please enter your new password');
      return;
    }
    if (!isRequirementsMet) {
      setErrorMessage('New password does not meet the security requirements');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('New passwords do not match');
      return;
    }
    if (currentPassword === newPassword) {
      setErrorMessage('New password must be different from current password');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      // Simulate password update process
      await new Promise<void>((resolve) => setTimeout(resolve, 900));

      Alert.alert(
        'Password Updated',
        'Your password has been changed successfully. Please use your new password next time you log in.',
        [
          {
            text: 'OK',
            onPress: () => {
              if (goBack) {
                goBack();
              } else {
                navigate('Settings');
              }
            },
          },
        ]
      );
    } catch {
      setErrorMessage('Failed to update password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (goBack) {
      goBack();
    } else {
      navigate('Settings');
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: isDark ? colors.background : '#FAF8FF' }]}
      edges={['top', 'left', 'right']}
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
          {/* Top Bar Navigation */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleCancel}
              activeOpacity={0.7}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons
                name="arrow-back"
                size={22}
                color={colors.primary}
                style={styles.backIcon}
              />
              <Text style={[styles.topBarTitle, { color: colors.primary }]}>Settings</Text>
            </TouchableOpacity>
          </View>

          {/* Screen Title & Subtitle */}
          <View style={styles.headerSection}>
            <Text style={[styles.screenTitle, { color: colors.textPrimary }]}>
              Change Password
            </Text>
            <Text style={[styles.screenSubtitle, { color: colors.textSecondary }]}>
              Update your password to ensure your account remains secure.
            </Text>
          </View>

          {/* Form Card Container */}
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
            {/* Error Message */}
            {errorMessage ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={18} color="#EF4444" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Current Password Field */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
                Current Password
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: isDark ? colors.inputBackground : '#FFFFFF',
                    borderColor: colors.inputBorder,
                  },
                ]}
              >
                <TextInput
                  style={[styles.input, { color: colors.textPrimary }]}
                  placeholder="Enter current password"
                  placeholderTextColor={colors.inputPlaceholder}
                  secureTextEntry={!showCurrentPassword}
                  value={currentPassword}
                  onChangeText={(text) => {
                    setCurrentPassword(text);
                    if (errorMessage) setErrorMessage('');
                  }}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowCurrentPassword((prev) => !prev)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showCurrentPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.textTertiary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* New Password Field */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
                New Password
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: isDark ? colors.inputBackground : '#FFFFFF',
                    borderColor: colors.inputBorder,
                  },
                ]}
              >
                <TextInput
                  style={[styles.input, { color: colors.textPrimary }]}
                  placeholder="Enter new password"
                  placeholderTextColor={colors.inputPlaceholder}
                  secureTextEntry={!showNewPassword}
                  value={newPassword}
                  onChangeText={(text) => {
                    setNewPassword(text);
                    if (errorMessage) setErrorMessage('');
                  }}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowNewPassword((prev) => !prev)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.textTertiary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Password Requirements Box */}
            <View
              style={[
                styles.requirementsBox,
                { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.08)' : '#F8FAFC' },
              ]}
            >
              <Text style={[styles.requirementsTitle, { color: colors.textSecondary }]}>
                Password requirements:
              </Text>

              {/* Requirement 1: Min 8 chars */}
              <View style={styles.requirementItem}>
                <Ionicons
                  name={hasMinLength ? 'checkmark-circle' : 'checkmark-circle-outline'}
                  size={16}
                  color={hasMinLength ? '#10B981' : colors.textTertiary}
                  style={styles.requirementIcon}
                />
                <Text
                  style={[
                    styles.requirementText,
                    { color: hasMinLength ? colors.textPrimary : colors.textSecondary },
                  ]}
                >
                  At least 8 characters
                </Text>
              </View>

              {/* Requirement 2: Uppercase */}
              <View style={styles.requirementItem}>
                <Ionicons
                  name={hasUppercase ? 'checkmark-circle' : 'checkmark-circle-outline'}
                  size={16}
                  color={hasUppercase ? '#10B981' : colors.textTertiary}
                  style={styles.requirementIcon}
                />
                <Text
                  style={[
                    styles.requirementText,
                    { color: hasUppercase ? colors.textPrimary : colors.textSecondary },
                  ]}
                >
                  Contains an uppercase letter
                </Text>
              </View>

              {/* Requirement 3: Number or symbol */}
              <View style={styles.requirementItem}>
                <Ionicons
                  name={hasNumberOrSymbol ? 'checkmark-circle' : 'checkmark-circle-outline'}
                  size={16}
                  color={hasNumberOrSymbol ? '#10B981' : colors.textTertiary}
                  style={styles.requirementIcon}
                />
                <Text
                  style={[
                    styles.requirementText,
                    { color: hasNumberOrSymbol ? colors.textPrimary : colors.textSecondary },
                  ]}
                >
                  Contains a number or symbol
                </Text>
              </View>
            </View>

            {/* Confirm New Password Field */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
                Confirm New Password
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: isDark ? colors.inputBackground : '#FFFFFF',
                    borderColor: colors.inputBorder,
                  },
                ]}
              >
                <TextInput
                  style={[styles.input, { color: colors.textPrimary }]}
                  placeholder="Confirm new password"
                  placeholderTextColor={colors.inputPlaceholder}
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (errorMessage) setErrorMessage('');
                  }}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword((prev) => !prev)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.textTertiary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonSection}>
              <TouchableOpacity
                style={[
                  styles.updateButton,
                  {
                    backgroundColor: colors.primary,
                    shadowColor: colors.primary,
                  },
                  isLoading && { opacity: 0.7 },
                ]}
                onPress={handleUpdatePassword}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={[styles.updateButtonText, { color: '#FFFFFF' }]}>
                    Update Password
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
                disabled={isLoading}
                activeOpacity={0.7}
              >
                <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChangePasswordScreen;
