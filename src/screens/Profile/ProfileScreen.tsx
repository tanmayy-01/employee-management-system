import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    Image,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../theme/ThemeContext';
import { BottomTabBar } from '../../components/BottomTabBar';
import { employeeService } from '../../services/employee.service';
import { Employee } from '../../types';
import { styles } from './Profile.styles';

export const ProfileScreen: React.FC = () => {
    const { user, logout, navigate } = useAuth();
    const { colors, isDark } = useTheme();

    const [employee, setEmployee] = useState<Employee | null>(null);
    const [isLoadingEmployee, setIsLoadingEmployee] = useState<boolean>(false);

    const loadEmployeeData = useCallback(async () => {
        if (!user?.id && !user?.email) return;
        setIsLoadingEmployee(true);
        try {
            const data =
                (user?.id ? await employeeService.getEmployeeById(user.id) : null) ||
                (user?.email ? await employeeService.getEmployeeByEmail(user.email) : null);
            if (data) {
                setEmployee(data);
            }
        } catch (error) {
            console.warn('Failed to load employee from database table:', error);
        } finally {
            setIsLoadingEmployee(false);
        }
    }, [user?.id, user?.email]);

    useEffect(() => {
        loadEmployeeData();
    }, [loadEmployeeData, user]);

    const userName = employee?.name || user?.name || 'Employee';
    const userRole = employee?.role || user?.role || 'Team Member';
    const userEmail = employee?.email || user?.email || '';
    const userPhone = employee?.phone ? employee.phone : user?.phone ? user.phone : 'Not provided';
    const userEmpId =
        employee?.employeeId ||
        user?.employeeId ||
        (user?.id ? 'EMP-' + user.id.substring(0, 4).toUpperCase() : 'N/A');
    const userDepartment = employee?.department || user?.department || 'General';
    const userLocation = employee?.location || user?.location || 'Headquarters';
    const userJoinDate = employee?.joinDate || user?.joinDate || 'Active';
    const avatarUrl =
        employee?.avatarUrl ||
        user?.avatarUrl ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';

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

export default ProfileScreen;
