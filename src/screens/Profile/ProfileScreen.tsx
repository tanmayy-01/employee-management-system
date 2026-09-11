import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    Image,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../theme/ThemeContext';
import { BottomTabBar } from '../../components/BottomTabBar';

export const ProfileScreen: React.FC = () => {
    const { user, logout, navigate } = useAuth();
    const { colors, isDark } = useTheme();

    const userName = user?.name || 'Alex Mercer';
    const userRole = user?.role || 'Senior UX Designer';
    const userEmail = user?.email || 'alex.mercer@workpulse.co';
    const userPhone = '+1 (555) 123-4567';
    const userEmpId = user?.employeeId || 'WP-2023-089';
    const userDepartment = user?.department || 'Product Team';
    const userLocation = 'New York HQ';
    const userJoinDate = 'March 15, 2021';
    const avatarUrl =
        user?.avatarUrl ||
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80';

    const handleEditProfile = () => {
        navigate('EditProfile');
    };

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to log out of WorkPulse?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: () => logout(),
            },
        ]);
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
                        <Image source={{ uri: avatarUrl }} style={styles.headerAvatarImage} />
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
                {/* Profile Hero Card */}
                <View
                    style={[
                        styles.profileHeroCard,
                        {
                            backgroundColor: colors.card,
                            borderColor: colors.cardBorder,
                            shadowColor: colors.shadowColor,
                        },
                    ]}
                >
                    {/* Top Card Banner Decoration */}
                    <View
                        style={[
                            styles.heroBanner,
                            { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.08)' : '#F4F7FE' },
                        ]}
                    />

                    {/* Avatar with Edit Badge */}
                    <View style={styles.avatarContainer}>
                        <View
                            style={[
                                styles.largeAvatarWrapper,
                                { borderColor: isDark ? colors.card : '#FFFFFF' },
                            ]}
                        >
                            <Image source={{ uri: avatarUrl }} style={styles.largeAvatarImage} />
                        </View>
                        <TouchableOpacity
                            style={[styles.editBadgeButton, { backgroundColor: colors.primary }]}
                            onPress={handleEditProfile}
                            activeOpacity={0.85}
                        >
                            <Ionicons name="pencil" size={13} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>

                    {/* Name & Role */}
                    <Text style={[styles.userNameText, { color: colors.textPrimary }]}>
                        {userName}
                    </Text>
                    <Text style={[styles.userRoleText, { color: colors.textSecondary }]}>
                        {userRole}
                    </Text>

                    {/* Badges Row */}
                    <View style={styles.badgesRow}>
                        <View
                            style={[
                                styles.pillBadge,
                                {
                                    backgroundColor: isDark
                                        ? 'rgba(59, 130, 246, 0.15)'
                                        : '#EBF2FF',
                                },
                            ]}
                        >
                            <Ionicons
                                name="briefcase-outline"
                                size={14}
                                color={colors.primary}
                                style={styles.badgeIcon}
                            />
                            <Text style={[styles.pillBadgeTextPrimary, { color: colors.primary }]}>
                                {userDepartment}
                            </Text>
                        </View>

                        <View
                            style={[
                                styles.pillBadge,
                                {
                                    backgroundColor: isDark
                                        ? colors.inputBackground
                                        : '#F1F5F9',
                                },
                            ]}
                        >
                            <Ionicons
                                name="location-outline"
                                size={14}
                                color={isDark ? colors.textSecondary : '#475569'}
                                style={styles.badgeIcon}
                            />
                            <Text
                                style={[
                                    styles.pillBadgeTextSecondary,
                                    { color: isDark ? colors.textSecondary : '#475569' },
                                ]}
                            >
                                {userLocation}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Section 1: Contact Details Card */}
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
                            { borderBottomColor: isDark ? colors.inputBorder : '#F1F5F9' },
                        ]}
                    >
                        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                            Contact Details
                        </Text>
                    </View>

                    <View style={styles.sectionBody}>
                        {/* Email Address */}
                        <View style={styles.infoRow}>
                            <View
                                style={[
                                    styles.infoIconWrapper,
                                    {
                                        backgroundColor: isDark
                                            ? 'rgba(59, 130, 246, 0.15)'
                                            : '#EBF2FF',
                                    },
                                ]}
                            >
                                <Ionicons name="mail-outline" size={18} color={colors.primary} />
                            </View>
                            <View style={styles.infoTextContainer}>
                                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                                    Email Address
                                </Text>
                                <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                                    {userEmail}
                                </Text>
                            </View>
                        </View>

                        {/* Phone Number */}
                        <View style={styles.infoRow}>
                            <View
                                style={[
                                    styles.infoIconWrapper,
                                    {
                                        backgroundColor: isDark
                                            ? 'rgba(59, 130, 246, 0.15)'
                                            : '#EBF2FF',
                                    },
                                ]}
                            >
                                <Ionicons name="call-outline" size={18} color={colors.primary} />
                            </View>
                            <View style={styles.infoTextContainer}>
                                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                                    Phone Number
                                </Text>
                                <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                                    {userPhone}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Section 2: Employee Information Card */}
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
                            { borderBottomColor: isDark ? colors.inputBorder : '#F1F5F9' },
                        ]}
                    >
                        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                            Employee Information
                        </Text>
                    </View>

                    <View style={styles.sectionBody}>
                        {/* Employee ID */}
                        <View style={styles.infoRow}>
                            <View
                                style={[
                                    styles.infoIconWrapper,
                                    {
                                        backgroundColor: isDark
                                            ? 'rgba(59, 130, 246, 0.15)'
                                            : '#EBF2FF',
                                    },
                                ]}
                            >
                                <Ionicons name="id-card-outline" size={18} color={colors.primary} />
                            </View>
                            <View style={styles.infoTextContainer}>
                                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                                    Employee ID
                                </Text>
                                <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                                    {userEmpId}
                                </Text>
                            </View>
                        </View>

                        {/* Join Date */}
                        <View style={styles.infoRow}>
                            <View
                                style={[
                                    styles.infoIconWrapper,
                                    {
                                        backgroundColor: isDark
                                            ? 'rgba(59, 130, 246, 0.15)'
                                            : '#EBF2FF',
                                    },
                                ]}
                            >
                                <Ionicons name="calendar-outline" size={18} color={colors.primary} />
                            </View>
                            <View style={styles.infoTextContainer}>
                                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                                    Join Date
                                </Text>
                                <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                                    {userJoinDate}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtonsContainer}>
                    {/* Edit Profile Button */}
                    <TouchableOpacity
                        style={[
                            styles.editProfileButton,
                            { backgroundColor: colors.primary, shadowColor: colors.primary },
                        ]}
                        onPress={handleEditProfile}
                        activeOpacity={0.85}
                    >
                        <Ionicons
                            name="create-outline"
                            size={18}
                            color="#FFFFFF"
                            style={styles.buttonIcon}
                        />
                        <Text style={styles.editProfileButtonText}>Edit Profile</Text>
                    </TouchableOpacity>

                    {/* Logout Button */}
                    <TouchableOpacity
                        style={[
                            styles.logoutButton,
                            {
                                borderColor: colors.error,
                                backgroundColor: isDark ? 'rgba(239, 68, 68, 0.08)' : '#FFFFFF',
                            },
                        ]}
                        onPress={handleLogout}
                        activeOpacity={0.75}
                    >
                        <Ionicons
                            name="log-out-outline"
                            size={18}
                            color={colors.error}
                            style={styles.buttonIcon}
                        />
                        <Text style={[styles.logoutButtonText, { color: colors.error }]}>
                            Logout
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Bottom Tab Bar Navigation */}
            <BottomTabBar activeTab="Profile" />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FAF8FF',
    },
    topHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 18,
        paddingVertical: 12,
        backgroundColor: '#FAF8FF',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarWrapper: {
        width: 38,
        height: 38,
        borderRadius: 19,
        overflow: 'hidden',
        borderWidth: 1.5,
        borderColor: '#D6E4FF',
        marginRight: 10,
    },
    headerAvatarImage: {
        width: '100%',
        height: '100%',
    },
    brandTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#004AC6',
        letterSpacing: -0.3,
    },
    bellButton: {
        width: 38,
        height: 38,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 19,
        backgroundColor: '#FFFFFF',
        shadowColor: '#1A2A4E',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    profileHeroCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        marginTop: 6,
        marginBottom: 14,
        alignItems: 'center',
        paddingBottom: 20,
        shadowColor: '#1A2A4E',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 2,
        borderWidth: 1,
        borderColor: 'rgba(226, 232, 240, 0.7)',
        overflow: 'hidden',
    },
    heroBanner: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 72,
        backgroundColor: '#F4F7FE',
    },
    avatarContainer: {
        marginTop: 26,
        position: 'relative',
        marginBottom: 12,
    },
    largeAvatarWrapper: {
        width: 82,
        height: 82,
        borderRadius: 41,
        borderWidth: 3.5,
        borderColor: '#FFFFFF',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    largeAvatarImage: {
        width: '100%',
        height: '100%',
    },
    editBadgeButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: '#004AC6',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    userNameText: {
        fontSize: 20,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 3,
        letterSpacing: -0.2,
    },
    userRoleText: {
        fontSize: 13,
        color: '#6B7280',
        fontWeight: '500',
        marginBottom: 14,
    },
    badgesRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    pillBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 5.5,
        borderRadius: 14,
    },
    badgeIcon: {
        marginRight: 5,
    },
    pillBadgeTextPrimary: {
        fontSize: 12,
        fontWeight: '600',
        color: '#004AC6',
    },
    pillBadgeTextSecondary: {
        fontSize: 12,
        fontWeight: '600',
        color: '#475569',
    },
    sectionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        marginBottom: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        shadowColor: '#1A2A4E',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: 'rgba(226, 232, 240, 0.7)',
    },
    sectionHeader: {
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111827',
    },
    sectionBody: {
        gap: 14,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoIconWrapper: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#EBF2FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    infoTextContainer: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 11,
        color: '#6B7280',
        fontWeight: '500',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 13.5,
        fontWeight: '600',
        color: '#111827',
    },
    actionButtonsContainer: {
        marginTop: 6,
        marginBottom: 10,
        gap: 10,
    },
    editProfileButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#004AC6',
        borderRadius: 10,
        height: 46,
        shadowColor: '#004AC6',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 2,
    },
    editProfileButtonText: {
        color: '#FFFFFF',
        fontSize: 14.5,
        fontWeight: '600',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        height: 46,
        borderWidth: 1.2,
        borderColor: '#DC2626',
    },
    logoutButtonText: {
        color: '#DC2626',
        fontSize: 14.5,
        fontWeight: '600',
    },
    buttonIcon: {
        marginRight: 7,
    },
});

export default ProfileScreen;
