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
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../theme/ThemeContext';
import { styles } from './SignUp.styles';

const SignUpScreen: React.FC = () => {
    const { navigate } = useAuth();
    const { colors, isDark } = useTheme();

    const [fullName, setFullName] = useState('');
    const [workEmail, setWorkEmail] = useState('');
    const [employeeId, setEmployeeId] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email.trim());
    };

    const handleSignUp = async () => {
        if (!fullName.trim()) {
            setErrorMessage('Please enter your full name');
            return;
        }
        if (!workEmail.trim()) {
            setErrorMessage('Please enter your work email');
            return;
        }
        if (!validateEmail(workEmail)) {
            setErrorMessage('Please enter a valid work email address');
            return;
        }
        if (!employeeId.trim()) {
            setErrorMessage('Please enter your employee ID');
            return;
        }
        if (!password) {
            setErrorMessage('Please enter a password');
            return;
        }
        if (password.length < 8) {
            setErrorMessage('Password must be at least 8 characters long');
            return;
        }
        if (!confirmPassword) {
            setErrorMessage('Please confirm your password');
            return;
        }
        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match');
            return;
        }
        if (!agreeTerms) {
            setErrorMessage('Please agree to the Terms of Service and Privacy Policy');
            return;
        }

        setErrorMessage('');
        setIsLoading(true);

        try {
            // Simulate registration delay
            await new Promise<void>((resolve) => setTimeout(resolve, 800));
            setIsSuccess(true);
        } catch {
            setErrorMessage('Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <SafeAreaView
                style={[styles.safeArea, { backgroundColor: isDark ? colors.background : '#EDF1FA' }]}
            >
                <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
                <View
                    style={[
                        styles.successContainer,
                        { backgroundColor: isDark ? colors.background : '#EDF1FA' },
                    ]}
                >
                    <View style={styles.successCard}>
                        {/* Success Checkmark Badge */}
                        <View
                            style={[
                                styles.successIconOuter,
                                {
                                    backgroundColor: colors.card,
                                    shadowColor: colors.shadowColor,
                                },
                            ]}
                        >
                            <View style={[styles.successIconInner, { backgroundColor: colors.primary }]}>
                                <Ionicons name="checkmark" size={28} color="#FFFFFF" />
                            </View>
                        </View>

                        {/* Success Heading & Message */}
                        <Text style={[styles.successTitle, { color: colors.textPrimary }]}>Success!</Text>
                        <Text style={[styles.successSubtitle, { color: colors.textSecondary }]}>
                            Your action has been processed successfully.{'\n'}You can now continue using the app.
                        </Text>

                        {/* Action Buttons */}
                        <TouchableOpacity
                            style={[
                                styles.continueButton,
                                { backgroundColor: colors.primary, shadowColor: colors.primary },
                            ]}
                            onPress={() => navigate('Login')}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.continueButtonText}>Continue</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.dashboardButton,
                                {
                                    backgroundColor: isDark ? colors.card : '#F3F6FD',
                                    borderColor: isDark ? colors.cardBorder : '#D8E2F0',
                                },
                            ]}
                            onPress={() => navigate('Home')}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.dashboardButtonText, { color: colors.textPrimary }]}>
                                Go to Dashboard
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

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
                            source={require('../../assets/create-acc-logo.png')}
                            style={styles.brandLogo}
                            resizeMode="contain"
                        />
                        <Text style={[styles.brandTitle, { color: colors.primary }]}>WorkPulse</Text>
                    </View>

                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        Create your employee account to get started.
                    </Text>

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

                        {/* Full Name Field */}
                        <View style={styles.fieldGroup}>
                            <Text style={[styles.label, { color: colors.textPrimary }]}>Full Name</Text>
                            <View
                                style={[
                                    styles.inputContainer,
                                    {
                                        backgroundColor: isDark ? colors.inputBackground : '#F3F6FD',
                                        borderColor: colors.inputBorder,
                                    },
                                ]}
                            >
                                <Ionicons
                                    name="person-outline"
                                    size={18}
                                    color={colors.iconColor}
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={[styles.input, { color: colors.inputText }]}
                                    placeholder="Jane Doe"
                                    placeholderTextColor={colors.inputPlaceholder}
                                    value={fullName}
                                    onChangeText={(text) => {
                                        setFullName(text);
                                        if (errorMessage) setErrorMessage('');
                                    }}
                                    autoCapitalize="words"
                                />
                            </View>
                        </View>

                        {/* Work Email Field */}
                        <View style={styles.fieldGroup}>
                            <Text style={[styles.label, { color: colors.textPrimary }]}>Work Email</Text>
                            <View
                                style={[
                                    styles.inputContainer,
                                    {
                                        backgroundColor: isDark ? colors.inputBackground : '#F3F6FD',
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
                                    placeholder="jane.doe@company.com"
                                    placeholderTextColor={colors.inputPlaceholder}
                                    value={workEmail}
                                    onChangeText={(text) => {
                                        setWorkEmail(text);
                                        if (errorMessage) setErrorMessage('');
                                    }}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    autoCorrect={false}
                                />
                            </View>
                        </View>

                        {/* Employee ID Field */}
                        <View style={styles.fieldGroup}>
                            <Text style={[styles.label, { color: colors.textPrimary }]}>Employee ID</Text>
                            <View
                                style={[
                                    styles.inputContainer,
                                    {
                                        backgroundColor: isDark ? colors.inputBackground : '#F3F6FD',
                                        borderColor: colors.inputBorder,
                                    },
                                ]}
                            >
                                <Ionicons
                                    name="id-card-outline"
                                    size={18}
                                    color={colors.iconColor}
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={[styles.input, { color: colors.inputText }]}
                                    placeholder="EMP-12345"
                                    placeholderTextColor={colors.inputPlaceholder}
                                    value={employeeId}
                                    onChangeText={(text) => {
                                        setEmployeeId(text);
                                        if (errorMessage) setErrorMessage('');
                                    }}
                                    autoCapitalize="characters"
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
                                        backgroundColor: isDark ? colors.inputBackground : '#F3F6FD',
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
                                        name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                                        size={19}
                                        color={colors.iconColor}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Confirm Password Field */}
                        <View style={styles.fieldGroup}>
                            <Text style={[styles.label, { color: colors.textPrimary }]}>Confirm Password</Text>
                            <View
                                style={[
                                    styles.inputContainer,
                                    {
                                        backgroundColor: isDark ? colors.inputBackground : '#F3F6FD',
                                        borderColor: colors.inputBorder,
                                    },
                                ]}
                            >
                                <Ionicons
                                    name="key-outline"
                                    size={18}
                                    color={colors.iconColor}
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={[styles.input, { color: colors.inputText }]}
                                    placeholder="••••••••"
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

                        {/* Terms & Privacy Agreement Row */}
                        <View style={styles.termsRow}>
                            <TouchableOpacity
                                style={styles.checkboxTouch}
                                onPress={() => setAgreeTerms(!agreeTerms)}
                                activeOpacity={0.7}
                            >
                                <View
                                    style={[
                                        styles.checkbox,
                                        {
                                            borderColor: colors.checkboxBorder,
                                            backgroundColor: agreeTerms
                                                ? colors.primary
                                                : isDark
                                                    ? colors.inputBackground
                                                    : '#FFFFFF',
                                        },
                                    ]}
                                >
                                    {agreeTerms && <Ionicons name="checkmark" size={11} color="#FFFFFF" />}
                                </View>
                            </TouchableOpacity>
                            <Text style={[styles.termsText, { color: colors.textSecondary }]}>
                                I agree to the{' '}
                                <Text style={[styles.termsLink, { color: colors.primary }]}>Terms of Service</Text> and{' '}
                                <Text style={[styles.termsLink, { color: colors.primary }]}>Privacy Policy</Text>.
                            </Text>
                        </View>

                        {/* Create Account Button */}
                        <TouchableOpacity
                            style={[
                                styles.createAccountButton,
                                { backgroundColor: colors.primary, shadowColor: colors.primary },
                                isLoading && styles.buttonDisabled,
                            ]}
                            onPress={handleSignUp}
                            disabled={isLoading}
                            activeOpacity={0.85}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#FFFFFF" size="small" />
                            ) : (
                                <View style={styles.buttonContent}>
                                    <Text style={styles.createAccountButtonText}>Create Account</Text>
                                    <Ionicons
                                        name="arrow-forward"
                                        size={16}
                                        color="#FFFFFF"
                                        style={styles.buttonIcon}
                                    />
                                </View>
                            )}
                        </TouchableOpacity>

                        {/* Sign In Link */}
                        <View style={styles.bottomRow}>
                            <Text style={[styles.bottomText, { color: colors.textSecondary }]}>
                                Already have an account?{' '}
                            </Text>
                            <TouchableOpacity onPress={() => navigate('Login')} activeOpacity={0.7}>
                                <Text style={[styles.signInLink, { color: colors.primary }]}>Sign In</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};



export default SignUpScreen;
