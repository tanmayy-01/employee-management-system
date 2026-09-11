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
import { styles } from './ResetPassword.styles';

type StrengthLevel = 'Weak' | 'Medium' | 'Strong' | '';

const ResetPasswordScreen: React.FC = () => {
    const { navigate } = useAuth();
    const { colors, isDark } = useTheme();

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Calculate password strength
    const getPasswordStrength = (pass: string): { level: StrengthLevel; score: number } => {
        if (!pass) return { level: '', score: 0 };

        let score = 0;
        if (pass.length >= 8) score += 1;
        if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
        if (/[0-9]/.test(pass)) score += 1;
        if (/[^A-Za-z0-9]/.test(pass)) score += 1;

        if (pass.length < 6) return { level: 'Weak', score: 1 };
        if (score <= 1) return { level: 'Weak', score: 1 };
        if (score === 2 || score === 3) return { level: 'Medium', score: 2 };
        return { level: 'Strong', score: 4 };
    };

    const { level: strengthLevel, score: strengthScore } = getPasswordStrength(newPassword);

    const getStrengthColor = (level: StrengthLevel) => {
        switch (level) {
            case 'Weak':
                return colors.error;
            case 'Medium':
                return colors.primary;
            case 'Strong':
                return colors.primary;
            default:
                return colors.textSecondary;
        }
    };

    const handleResetPassword = async () => {
        if (!newPassword) {
            setErrorMessage('Please enter a new password');
            return;
        }

        if (newPassword.length < 8) {
            setErrorMessage('Password must be at least 8 characters long');
            return;
        }

        if (!confirmPassword) {
            setErrorMessage('Please confirm your new password');
            return;
        }

        if (newPassword !== confirmPassword) {
            setErrorMessage('Passwords do not match');
            return;
        }

        setErrorMessage('');
        setIsLoading(true);

        try {
            // Simulate API call to update password
            await new Promise<void>((resolve) => setTimeout(resolve, 1000));

            Alert.alert(
                'Password Reset Successful',
                'Your password has been reset successfully. Please sign in with your new password.',
                [
                    {
                        text: 'Sign In',
                        onPress: () => {
                            navigate('Login');
                        },
                    },
                ]
            );
        } catch {
            setErrorMessage('Failed to reset password. Please try again.');
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
                            source={require('../../assets/primary-logo.png')}
                            style={styles.brandIcon}
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
                        {/* Title & Subtitle */}
                        <Text style={[styles.title, { color: colors.textPrimary }]}>Create New Password</Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            Your new password must be different from previous used passwords.
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

                        {/* New Password Field */}
                        <View style={styles.fieldGroup}>
                            <Text style={[styles.label, { color: colors.textPrimary }]}>New Password</Text>
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
                                    style={[styles.input, { color: colors.inputText }]}
                                    placeholder="Enter new password"
                                    placeholderTextColor={colors.inputPlaceholder}
                                    value={newPassword}
                                    onChangeText={(text) => {
                                        setNewPassword(text);
                                        if (errorMessage) setErrorMessage('');
                                    }}
                                    secureTextEntry={!showNewPassword}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowNewPassword(!showNewPassword)}
                                    style={styles.eyeButton}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Ionicons
                                        name={showNewPassword ? 'eye-outline' : 'eye-off-outline'}
                                        size={19}
                                        color={colors.iconColor}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Password Strength Indicator */}
                        <View style={styles.strengthContainer}>
                            <View style={styles.strengthHeader}>
                                <Text style={[styles.strengthLabel, { color: colors.textSecondary }]}>Password Strength</Text>
                                {strengthLevel ? (
                                    <Text style={[styles.strengthValue, { color: getStrengthColor(strengthLevel) }]}>
                                        {strengthLevel}
                                    </Text>
                                ) : null}
                            </View>

                            {/* 4 Segment Bars */}
                            <View style={styles.barsRow}>
                                {[1, 2, 3, 4].map((barIndex) => {
                                    const isFilled = barIndex <= strengthScore;
                                    return (
                                        <View
                                            key={barIndex}
                                            style={[
                                                styles.barSegment,
                                                {
                                                    backgroundColor: isFilled
                                                        ? getStrengthColor(strengthLevel)
                                                        : isDark
                                                            ? colors.inputBorder
                                                            : '#E2E8F0',
                                                },
                                            ]}
                                        />
                                    );
                                })}
                            </View>

                            <Text style={[styles.strengthHint, { color: colors.textTertiary }]}>
                                Must be at least 8 characters long.
                            </Text>
                        </View>

                        {/* Confirm Password Field */}
                        <View style={styles.fieldGroup}>
                            <Text style={[styles.label, { color: colors.textPrimary }]}>Confirm Password</Text>
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
                                    style={[styles.input, { color: colors.inputText }]}
                                    placeholder="Confirm new password"
                                    placeholderTextColor={colors.inputPlaceholder}
                                    value={confirmPassword}
                                    onChangeText={(text) => {
                                        setConfirmPassword(text);
                                        if (errorMessage) setErrorMessage('');
                                    }}
                                    secureTextEntry={!showConfirmPassword}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={styles.eyeButton}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Ionicons
                                        name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                                        size={19}
                                        color={colors.iconColor}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Reset Password Button */}
                        <TouchableOpacity
                            style={[
                                styles.resetButton,
                                { backgroundColor: colors.primary, shadowColor: colors.primary },
                                isLoading && styles.buttonDisabled,
                            ]}
                            onPress={handleResetPassword}
                            disabled={isLoading}
                            activeOpacity={0.85}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#FFFFFF" size="small" />
                            ) : (
                                <View style={styles.buttonContent}>
                                    <Text style={styles.resetButtonText}>Reset Password</Text>
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

                    {/* Bottom Policy & Terms Footer */}
                    <View style={styles.footerRow}>
                        <TouchableOpacity activeOpacity={0.7}>
                            <Text style={[styles.footerLink, { color: colors.textSecondary }]}>Privacy Policy</Text>
                        </TouchableOpacity>
                        <View
                            style={[
                                styles.footerDot,
                                { backgroundColor: isDark ? colors.textTertiary : '#9CA3AF' },
                            ]}
                        />
                        <TouchableOpacity activeOpacity={0.7}>
                            <Text style={[styles.footerLink, { color: colors.textSecondary }]}>Terms of Service</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};


export default ResetPasswordScreen;
