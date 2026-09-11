import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    Image,
    ScrollView,
    TouchableOpacity,
    Switch,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../theme/ThemeContext';
import { BottomTabBar } from '../../components/BottomTabBar';
import { styles } from './Settings.styles';

const SettingsScreen: React.FC = () => {
    const { user, logout, navigate } = useAuth();
    const { colors, isDark, toggleTheme } = useTheme();

    const [emailSummaries, setEmailSummaries] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(true);

    const avatarUrl =
        user?.avatarUrl ||
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80';

    const handleSignOut = () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out of WorkPulse?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Sign Out',
                style: 'destructive',
                onPress: () => {
                    logout();
                },
            },
        ]);
    };

    const handlePersonalInfo = () => {
        Alert.alert(
            'Personal Information',
            `Name: ${user?.name || 'Alex Rivera'}\nEmployee ID: ${user?.employeeId || 'EMP-8492'
            }\nEmail: ${user?.email || 'alex.rivera@workpulse.io'}\nRole: ${user?.role || 'Senior Software Engineer'
            }`,
            [{ text: 'OK' }]
        );
    };

    const handleSecurityPrivacy = () => {
        Alert.alert(
            'Security & Privacy',
            'Manage two-factor authentication and password security from your enterprise portal.',
            [
                {
                    text: 'Reset Password',
                    onPress: () => navigate('ForgotPassword'),
                },
                { text: 'Close', style: 'cancel' },
            ]
        );
    };

    return (
        <SafeAreaView
            style={[styles.safeArea, { backgroundColor: isDark ? colors.background : '#FAF8FF' }]}
            edges={['top', 'left', 'right']}
        >
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            {/* Top Header Bar */}
            <View style={[styles.topHeader, { backgroundColor: isDark ? colors.background : '#FAF8FF' }]}>
                <View style={styles.headerLeft}>
                    <View style={[styles.avatarWrapper, { borderColor: isDark ? colors.inputBorder : '#D6E4FF' }]}>
                        <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
                    </View>
                    <Text style={[styles.brandTitle, { color: colors.primary }]}>WorkPulse</Text>
                </View>

                <TouchableOpacity
                    style={[
                        styles.bellButton,
                        {
                            backgroundColor: colors.card,
                            shadowColor: colors.shadowColor,
                        },
                    ]}
                    onPress={() => navigate('Notifications')}
                    activeOpacity={0.7}
                >
                    <Ionicons name="notifications-outline" size={22} color={colors.primary} />
                </TouchableOpacity>
            </View>

            {/* Main Content */}
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Screen Title */}
                <View style={styles.titleSection}>
                    <Text style={[styles.screenTitle, { color: colors.textPrimary }]}>Settings</Text>
                    <Text style={[styles.screenSubtitle, { color: colors.textSecondary }]}>
                        Manage your app preferences and account.
                    </Text>
                </View>

                {/* Section 1: Appearance */}
                <View
                    style={[
                        styles.sectionCard,
                        {
                            backgroundColor: colors.card,
                            borderColor: colors.cardBorder,
                            shadowColor: colors.shadowColor,
                        },
                    ]}
                >
                    <View
                        style={[
                            styles.sectionHeader,
                            {
                                backgroundColor: isDark ? colors.inputBackground : '#F3F6FD',
                                borderBottomColor: isDark ? colors.inputBorder : 'rgba(226, 232, 240, 0.6)',
                            },
                        ]}
                    >
                        <Text style={[styles.sectionHeaderText, { color: colors.textPrimary }]}>
                            Appearance
                        </Text>
                    </View>
                    <View style={styles.sectionBody}>
                        <View style={styles.settingRow}>
                            <View style={styles.rowLeft}>
                                <Ionicons
                                    name="moon-outline"
                                    size={19}
                                    color={isDark ? colors.iconColor : '#374151'}
                                    style={styles.rowIcon}
                                />
                                <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>
                                    Dark Mode
                                </Text>
                            </View>
                            <Switch
                                value={isDark}
                                onValueChange={toggleTheme}
                                trackColor={{ false: isDark ? '#2E384D' : '#E2E8F0', true: colors.primary }}
                                thumbColor="#FFFFFF"
                            />
                        </View>
                    </View>
                </View>

                {/* Section 2: Notifications */}
                <View
                    style={[
                        styles.sectionCard,
                        {
                            backgroundColor: colors.card,
                            borderColor: colors.cardBorder,
                            shadowColor: colors.shadowColor,
                        },
                    ]}
                >
                    <View
                        style={[
                            styles.sectionHeader,
                            {
                                backgroundColor: isDark ? colors.inputBackground : '#F3F6FD',
                                borderBottomColor: isDark ? colors.inputBorder : 'rgba(226, 232, 240, 0.6)',
                            },
                        ]}
                    >
                        <Text style={[styles.sectionHeaderText, { color: colors.textPrimary }]}>
                            Notifications
                        </Text>
                    </View>
                    <View style={styles.sectionBody}>
                        {/* Email Summaries */}
                        <View style={styles.settingRow}>
                            <View style={styles.rowLeft}>
                                <Ionicons
                                    name="mail-outline"
                                    size={19}
                                    color={isDark ? colors.iconColor : '#374151'}
                                    style={styles.rowIcon}
                                />
                                <View>
                                    <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>
                                        Email Summaries
                                    </Text>
                                    <Text style={[styles.rowSubtitle, { color: colors.textSecondary }]}>
                                        Daily digest of your activity
                                    </Text>
                                </View>
                            </View>
                            <Switch
                                value={emailSummaries}
                                onValueChange={setEmailSummaries}
                                trackColor={{ false: isDark ? '#2E384D' : '#E2E8F0', true: colors.primary }}
                                thumbColor="#FFFFFF"
                            />
                        </View>

                        <View
                            style={[
                                styles.rowDivider,
                                { backgroundColor: isDark ? colors.inputBorder : '#F1F5F9' },
                            ]}
                        />

                        {/* Push Notifications */}
                        <View style={styles.settingRow}>
                            <View style={styles.rowLeft}>
                                <Ionicons
                                    name="phone-portrait-outline"
                                    size={19}
                                    color={isDark ? colors.iconColor : '#374151'}
                                    style={styles.rowIcon}
                                />
                                <View>
                                    <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>
                                        Push Notifications
                                    </Text>
                                    <Text style={[styles.rowSubtitle, { color: colors.textSecondary }]}>
                                        Immediate alerts on your device
                                    </Text>
                                </View>
                            </View>
                            <Switch
                                value={pushNotifications}
                                onValueChange={setPushNotifications}
                                trackColor={{ false: isDark ? '#2E384D' : '#E2E8F0', true: colors.primary }}
                                thumbColor="#FFFFFF"
                            />
                        </View>
                    </View>
                </View>

                {/* Section 3: Account */}
                <View
                    style={[
                        styles.sectionCard,
                        {
                            backgroundColor: colors.card,
                            borderColor: colors.cardBorder,
                            shadowColor: colors.shadowColor,
                        },
                    ]}
                >
                    <View
                        style={[
                            styles.sectionHeader,
                            {
                                backgroundColor: isDark ? colors.inputBackground : '#F3F6FD',
                                borderBottomColor: isDark ? colors.inputBorder : 'rgba(226, 232, 240, 0.6)',
                            },
                        ]}
                    >
                        <Text style={[styles.sectionHeaderText, { color: colors.textPrimary }]}>
                            Account
                        </Text>
                    </View>
                    <View style={styles.sectionBody}>
                        {/* Personal Information */}
                        <TouchableOpacity
                            style={styles.clickableRow}
                            onPress={handlePersonalInfo}
                            activeOpacity={0.7}
                        >
                            <View style={styles.rowLeft}>
                                <Ionicons
                                    name="person-outline"
                                    size={19}
                                    color={isDark ? colors.iconColor : '#374151'}
                                    style={styles.rowIcon}
                                />
                                <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>
                                    Personal Information
                                </Text>
                            </View>
                            <Ionicons
                                name="chevron-forward"
                                size={17}
                                color={isDark ? colors.textSecondary : '#94A3B8'}
                            />
                        </TouchableOpacity>

                        <View
                            style={[
                                styles.rowDivider,
                                { backgroundColor: isDark ? colors.inputBorder : '#F1F5F9' },
                            ]}
                        />

                        {/* Security & Privacy */}
                        <TouchableOpacity
                            style={styles.clickableRow}
                            onPress={handleSecurityPrivacy}
                            activeOpacity={0.7}
                        >
                            <View style={styles.rowLeft}>
                                <Ionicons
                                    name="shield-outline"
                                    size={19}
                                    color={isDark ? colors.iconColor : '#374151'}
                                    style={styles.rowIcon}
                                />
                                <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>
                                    Security & Privacy
                                </Text>
                            </View>
                            <Ionicons
                                name="chevron-forward"
                                size={17}
                                color={isDark ? colors.textSecondary : '#94A3B8'}
                            />
                        </TouchableOpacity>

                        <View
                            style={[
                                styles.rowDivider,
                                { backgroundColor: isDark ? colors.inputBorder : '#F1F5F9' },
                            ]}
                        />

                        {/* Sign Out */}
                        <TouchableOpacity
                            style={styles.clickableRow}
                            onPress={handleSignOut}
                            activeOpacity={0.7}
                        >
                            <View style={styles.rowLeft}>
                                <Ionicons
                                    name="log-out-outline"
                                    size={19}
                                    color={colors.error}
                                    style={styles.rowIcon}
                                />
                                <Text style={[styles.signOutTitle, { color: colors.error }]}>
                                    Sign Out
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Footer Links & App Version */}
                <View style={styles.footerSection}>
                    <View style={styles.footerLinksRow}>
                        <TouchableOpacity activeOpacity={0.7}>
                            <Text style={[styles.footerLinkText, { color: colors.textSecondary }]}>
                                Privacy Policy
                            </Text>
                        </TouchableOpacity>
                        <View
                            style={[
                                styles.footerDot,
                                { backgroundColor: isDark ? colors.textTertiary : '#9CA3AF' },
                            ]}
                        />
                        <TouchableOpacity activeOpacity={0.7}>
                            <Text style={[styles.footerLinkText, { color: colors.textSecondary }]}>
                                Terms of Service
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={[styles.versionText, { color: colors.textTertiary }]}>
                        WorkPulse App v2.4.1
                    </Text>
                </View>
            </ScrollView>

            {/* Bottom Tab Bar Navigation */}
            <BottomTabBar activeTab="Settings" />
        </SafeAreaView>
    );
};



export default SettingsScreen;
