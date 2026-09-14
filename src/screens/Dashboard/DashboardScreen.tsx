import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StatusBar,
    Image,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../theme/ThemeContext';
import { CheckInOutCard } from '../../components/CheckInOutCard';
import { BottomTabBar } from '../../components/BottomTabBar';
import { DashboardSkeleton } from '../../components/DashboardSkeleton';
import { employeeService } from '../../services/employee.service';
import { attendanceService } from '../../services/attendance.service';
import { notificationService } from '../../services/notification.service';
import { Employee, AttendanceStats } from '../../types';
import { styles } from './Dashboard.styles';
import { DEFAULT_AVATAR_URL } from '../../constants/profile.constants';
import { DAYS_OF_WEEK, MONTHS } from '../../constants/attendance.constants';

const DashboardScreen: React.FC = () => {
    const { user, navigate, currentScreen, reloadUserProfile } = useAuth();
    const { colors, isDark } = useTheme();
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [attendanceStats, setAttendanceStats] = useState<AttendanceStats | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isSkeletonLoading, setIsSkeletonLoading] = useState(false);

    const loadDashboardData = useCallback(async () => {
        if (!user?.id && !user?.email) return;
        const targetId = user?.id || user?.email || '';

        try {
            const [emp, stats, unread] = await Promise.all([
                (user?.id ? employeeService.getEmployeeById(user.id) : null) ||
                (user?.email ? employeeService.getEmployeeByEmail(user.email) : null),
                attendanceService.getAttendanceStats(targetId),
                notificationService.getUnreadCount(targetId),
            ]);

            if (emp) {
                setEmployee(emp);
            }
            if (stats) {
                setAttendanceStats(stats);
                setIsCheckedIn(stats.isCheckedIn);
            }
            setUnreadCount(unread || 0);
        } catch (error) {
            console.warn('Failed to load employee & attendance details on dashboard:', error);
        }
    }, [user?.id, user?.email]);

    useEffect(() => {
        if (currentScreen === 'Dashboard') {
            loadDashboardData();
        }
    }, [currentScreen, loadDashboardData, user]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        setIsSkeletonLoading(true);

        try {
            await Promise.all([
                loadDashboardData(),
                reloadUserProfile ? reloadUserProfile() : Promise.resolve(null),
                new Promise<void>((resolve) => {
                    setTimeout(() => resolve(), 800);
                }),
            ]);
        } catch (e) {
            console.warn('Refresh error on dashboard:', e);
        } finally {
            setIsRefreshing(false);
            setIsSkeletonLoading(false);
        }
    };

    const handleCheckIn = async () => {
        const targetId = user?.id || user?.email;
        if (!targetId) return;

        try {
            await attendanceService.checkIn(targetId, user?.location || 'Main Office');
            const updatedStats = await attendanceService.getAttendanceStats(targetId);
            setAttendanceStats(updatedStats);
            setIsCheckedIn(true);
        } catch (error: any) {
            Alert.alert('Check In Notice', error?.message || 'Could not check in.');
        }
    };

    const handleCheckOut = async () => {
        const targetId = user?.id || user?.email;
        if (!targetId) return;

        try {
            await attendanceService.checkOut(targetId, user?.location || 'Main Office');
            const updatedStats = await attendanceService.getAttendanceStats(targetId);
            setAttendanceStats(updatedStats);
            setIsCheckedIn(false);
        } catch (error: any) {
            Alert.alert('Check Out Notice', error?.message || 'Could not check out.');
        }
    };

    const userName = employee?.name || user?.name || 'Alex Rivera';
    const employeeId =
        employee?.employeeId ||
        user?.employeeId ||
        (user?.id ? 'EMP-' + user.id.substring(0, 4).toUpperCase() : 'EMP-8492');
    const avatarUrl =
        employee?.avatarUrl ||
        user?.avatarUrl ||
        DEFAULT_AVATAR_URL

    const getCurrentDateFormatted = () => {
        const now = new Date();
        return `${DAYS_OF_WEEK[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()}`;
    };

    const initialSessionSeconds = attendanceStats?.activeSession
        ? Math.max(0, Math.floor((Date.now() - attendanceStats.activeSession.checkInTime) / 1000))
        : 0;

    const todayHoursText = attendanceStats?.todayHoursFormatted || '0h 0m';
    const weekHoursText = attendanceStats?.weekHoursFormatted || '0h 0m';
    const remainingHoursText = attendanceStats?.remainingHoursFormatted || '8h 00m';

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
                    {unreadCount > 0 && <View style={styles.bellBadge} />}
                </TouchableOpacity>
            </View>

            {/* Main Scrollable Content with Pull To Refresh */}
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                        progressBackgroundColor={isDark ? colors.card : '#FFFFFF'}
                    />
                }
            >
                {isSkeletonLoading ? (
                    <DashboardSkeleton />
                ) : (
                    <>
                        {/* Welcome Greeting Card */}
                        <View
                            style={[
                                styles.greetingCard,
                                {
                                    backgroundColor: colors.card,
                                    borderColor: colors.cardBorder,
                                    shadowColor: colors.shadowColor,
                                },
                            ]}
                        >
                            <View
                                style={[
                                    styles.decorativeShape,
                                    { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.08)' : '#EBF2FF' },
                                ]}
                            />
                            <Text style={[styles.greetingDate, { color: colors.textSecondary }]}>
                                {getCurrentDateFormatted()}
                            </Text>
                            <Text style={[styles.greetingTitle, { color: colors.textPrimary }]}>
                                Good morning, {userName}
                            </Text>
                            <View style={styles.empIdRow}>
                                <Ionicons
                                    name="id-card-outline"
                                    size={13}
                                    color={colors.textSecondary}
                                    style={styles.empIcon}
                                />
                                <Text style={[styles.empIdText, { color: colors.textSecondary }]}>
                                    ID: {employeeId}
                                </Text>
                            </View>
                        </View>

                        {/* Total Hours Today Stat Card */}
                        <View
                            style={[
                                styles.statCard,
                                {
                                    backgroundColor: colors.card,
                                    borderColor: colors.cardBorder,
                                    shadowColor: colors.shadowColor,
                                },
                            ]}
                        >
                            <View style={[styles.blueStatIconWrapper, { backgroundColor: colors.primary }]}>
                                <Ionicons name="time" size={20} color="#FFFFFF" />
                            </View>
                            <View style={styles.statInfo}>
                                <Text style={[styles.statLabel, { color: isDark ? colors.textTertiary : '#64748B' }]}>
                                    TOTAL HOURS TODAY
                                </Text>
                                <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                                    {todayHoursText}
                                </Text>
                            </View>
                        </View>

                        {/* Remaining Hours Stat Card */}
                        <View
                            style={[
                                styles.statCard,
                                {
                                    backgroundColor: colors.card,
                                    borderColor: colors.cardBorder,
                                    shadowColor: colors.shadowColor,
                                },
                            ]}
                        >
                            <View
                                style={[
                                    styles.grayStatIconWrapper,
                                    { backgroundColor: isDark ? colors.inputBackground : '#EDF1FA' },
                                ]}
                            >
                                <Ionicons
                                    name="hourglass-outline"
                                    size={20}
                                    color={isDark ? colors.textSecondary : '#64748B'}
                                />
                            </View>
                            <View style={styles.statInfo}>
                                <Text style={[styles.statLabel, { color: isDark ? colors.textTertiary : '#64748B' }]}>
                                    REMAINING HOURS
                                </Text>
                                <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                                    {remainingHoursText}
                                </Text>
                            </View>
                        </View>

                        {/* Current Status / Check In-Out Card */}
                        <CheckInOutCard
                            variant="session"
                            isCheckedIn={isCheckedIn}
                            todayHours={todayHoursText}
                            weekHours={weekHoursText}
                            initialSessionSeconds={initialSessionSeconds}
                            onCheckIn={handleCheckIn}
                            onCheckOut={handleCheckOut}
                        />

                        {/* Today's Timeline Card */}
                        <View
                            style={[
                                styles.timelineCard,
                                {
                                    backgroundColor: colors.card,
                                    borderColor: colors.cardBorder,
                                    shadowColor: colors.shadowColor,
                                },
                            ]}
                        >
                            <Text style={[styles.timelineTitle, { color: colors.textPrimary }]}>
                                Today's Timeline
                            </Text>
                            <View style={styles.timelineItem}>
                                <Ionicons
                                    name={isCheckedIn ? 'radio-button-on' : 'radio-button-off'}
                                    size={20}
                                    color={isCheckedIn ? colors.primary : isDark ? colors.textTertiary : '#94A3B8'}
                                    style={styles.timelineDotIcon}
                                />
                                <View style={styles.timelineContent}>
                                    <Text style={[styles.timelineItemTitle, { color: colors.textPrimary }]}>
                                        {isCheckedIn
                                            ? 'Checked In (Active Session)'
                                            : (attendanceStats?.todaySessionsCount || 0) > 0
                                                ? 'Checked Out'
                                                : 'Not Checked In Yet'}
                                    </Text>
                                    <View style={styles.timelineLocationRow}>
                                        <Ionicons name="location-outline" size={13} color={colors.textSecondary} />
                                        <Text style={[styles.timelineLocationText, { color: colors.textSecondary }]}>
                                            {isCheckedIn
                                                ? `${attendanceStats?.lastCheckInLocation || 'Main Office'} • Started ${attendanceStats?.lastCheckInFormatted || ''}`
                                                : (attendanceStats?.todaySessionsCount || 0) > 0
                                                    ? `${todayHoursText} worked across ${attendanceStats?.todaySessionsCount} session(s) today`
                                                    : 'Main Office • Ready for check-in'}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </>
                )}
            </ScrollView>

            {/* Bottom Tab Bar Navigation */}
            <BottomTabBar activeTab="Dashboard" />
        </SafeAreaView>
    );
};

export default DashboardScreen;


