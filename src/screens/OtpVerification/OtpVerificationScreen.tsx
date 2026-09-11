import React, { useState, useRef, useEffect } from 'react';
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
import { styles } from './OtpVerification.styles';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 59;

const OtpVerificationScreen: React.FC = () => {
    const { navigate } = useAuth();
    const { colors, isDark } = useTheme();

    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
    const [focusedIndex, setFocusedIndex] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [timer, setTimer] = useState<number>(RESEND_COOLDOWN);

    const inputRefs = useRef<Array<any>>([]);

    // Countdown timer for resending OTP
    useEffect(() => {
        if (timer <= 0) return;

        const interval = setInterval(() => {
            setTimer((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [timer]);

    const handleOtpChange = (text: string, index: number) => {
        // Clear any previous error
        if (errorMessage) setErrorMessage('');

        // Handle paste of multiple characters
        const cleanText = text.replace(/[^0-9]/g, '');
        if (cleanText.length > 1) {
            const newOtp = [...otp];
            const chars = cleanText.slice(0, OTP_LENGTH).split('');
            chars.forEach((char, i) => {
                newOtp[i] = char;
            });
            setOtp(newOtp);
            const nextFocus = Math.min(chars.length, OTP_LENGTH - 1);
            inputRefs.current[nextFocus]?.focus();
            return;
        }

        const newOtp = [...otp];
        newOtp[index] = cleanText;
        setOtp(newOtp);

        // Auto-advance to next input if digit entered
        if (cleanText && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace') {
            if (!otp[index] && index > 0) {
                inputRefs.current[index - 1]?.focus();
            }
        }
    };

    const handleVerify = async () => {
        const fullOtp = otp.join('');
        if (fullOtp.length < OTP_LENGTH) {
            setErrorMessage('Please enter the complete 6-digit code');
            return;
        }

        setErrorMessage('');
        setIsLoading(true);

        try {
            // Simulate verification delay
            await new Promise<void>((resolve) => setTimeout(resolve, 800));
            navigate('ResetPassword');
        } catch {
            setErrorMessage('Invalid verification code. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = () => {
        if (timer > 0) return;

        setTimer(RESEND_COOLDOWN);
        setOtp(Array(OTP_LENGTH).fill(''));
        setErrorMessage('');
        inputRefs.current[0]?.focus();

        Alert.alert('Code Resent', 'A new 6-digit OTP has been sent to your email.');
    };

    const formatTimer = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
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
                    {/* Card Container */}
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
                        {/* Top Email Badge Icon */}
                        <View style={styles.iconContainer}>
                            <Image
                                source={require('../../assets/email-logo.png')}
                                style={styles.emailBadgeImage}
                                resizeMode="contain"
                            />
                        </View>

                        {/* Title & Subtitle */}
                        <Text style={[styles.title, { color: colors.textPrimary }]}>Verify Account</Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            Enter the 6-digit code sent to your email.
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

                        {/* OTP Input Fields Row */}
                        <View style={styles.otpRow}>
                            {otp.map((digit, index) => {
                                const isFocused = focusedIndex === index;
                                return (
                                    <TextInput
                                        key={index}
                                        ref={(ref) => {
                                            inputRefs.current[index] = ref;
                                        }}
                                        style={[
                                            styles.otpBox,
                                            {
                                                backgroundColor: isDark ? colors.inputBackground : '#FFFFFF',
                                                borderColor: isFocused
                                                    ? colors.primary
                                                    : digit
                                                        ? colors.primary
                                                        : colors.inputBorder,
                                                color: colors.textPrimary,
                                            },
                                            isFocused && styles.otpBoxFocused,
                                        ]}
                                        value={digit}
                                        onChangeText={(text) => handleOtpChange(text, index)}
                                        onKeyPress={(e) => handleKeyPress(e, index)}
                                        onFocus={() => setFocusedIndex(index)}
                                        keyboardType="number-pad"
                                        maxLength={1}
                                        selectTextOnFocus
                                        autoFocus={index === 0}
                                    />
                                );
                            })}
                        </View>

                        {/* Verify & Proceed Button */}
                        <TouchableOpacity
                            style={[
                                styles.verifyButton,
                                { backgroundColor: colors.primary, shadowColor: colors.primary },
                                isLoading && styles.buttonDisabled,
                            ]}
                            onPress={handleVerify}
                            disabled={isLoading}
                            activeOpacity={0.85}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#FFFFFF" size="small" />
                            ) : (
                                <View style={styles.buttonContent}>
                                    <Text style={styles.verifyButtonText}>Verify & Proceed</Text>
                                    <Ionicons
                                        name="arrow-forward"
                                        size={16}
                                        color="#FFFFFF"
                                        style={styles.buttonIcon}
                                    />
                                </View>
                            )}
                        </TouchableOpacity>

                        {/* Resend Code Section */}
                        <View style={styles.resendContainer}>
                            <Text style={[styles.resendPrompt, { color: colors.textSecondary }]}>
                                Didn't receive the code?
                            </Text>
                            {timer > 0 ? (
                                <Text style={[styles.timerText, { color: colors.textSecondary }]}>
                                    <Text style={[styles.resendLinkDisabled, { color: colors.primaryLight }]}>
                                        Resend Code{' '}
                                    </Text>
                                    in {formatTimer(timer)}
                                </Text>
                            ) : (
                                <TouchableOpacity onPress={handleResend} activeOpacity={0.7}>
                                    <Text style={[styles.resendLinkActive, { color: colors.primary }]}>Resend Code</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};


export default OtpVerificationScreen;
