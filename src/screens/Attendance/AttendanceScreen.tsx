import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
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
import { CheckInOutCard } from '../../components/CheckInOutCard';
import { BottomTabBar } from '../../components/BottomTabBar';
import { attendanceService, RecentActivity } from '../../services/attendance.service';
import { notificationService } from '../../services/notification.service';
import { AttendanceStats } from '../../types';
import { styles } from './Attendance.styles';

export const AttendanceScreen: React.FC = () => {
    const { user, navigate, currentScreen } = useAuth();
    const { colors, isDark } = useTheme();
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [attendanceStats, setAttendanceStats] = useState<AttendanceStats | null>(null);
    const [activities, setActivities] = useState<RecentActivity[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const loadAttendanceData = useCallback(async () => {
        if (!user?.id && !user?.email) return;
        const targetId = user?.id || user?.email || '';

        try {
            const [stats, recent, unread] = await Promise.all([
                attendanceService.getAttendanceStats(targetId),
                attendanceService.getRecentActivities(targetId, 6),
                notificationService.getUnreadCount(targetId),
            ]);

            if (stats) {
                setAttendanceStats(stats);
                setIsCheckedIn(stats.isCheckedIn);
            }
            if (recent) {
                setActivities(recent);
            }
            setUnreadCount(unread || 0);
        } catch (error) {
            console.warn('Failed to load attendance details:', error);
        }
    }, [user?.id, user?.email]);

    useEffect(() => {
        if (currentScreen === 'Attendance') {
            loadAttendanceData();
        }
    }, [currentScreen, loadAttendanceData, user]);

    const handleCheckIn = async () => {
        const targetId = user?.id || user?.email;
        if (!targetId) return;

        try {
            await attendanceService.checkIn(targetId, user?.location || 'Office HQ');
            await loadAttendanceData();
        } catch (error: any) {
            Alert.alert('Check In Notice', error?.message || 'Could not check in.');
        }
    };

    const handleCheckOut = async () => {
        const targetId = user?.id || user?.email;
        if (!targetId) return;

        try {
            await attendanceService.checkOut(targetId, user?.location || 'Office HQ');
            await loadAttendanceData();
        } catch (error: any) {
            Alert.alert('Check Out Notice', error?.message || 'Could not check out.');
        }
    };

    const avatarUrl =
        user?.avatarUrl ||
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80';

    const handleNavigateToHistory = () => {
        navigate('AttendanceHistory');
    };

    const initialSessionSeconds = attendanceStats?.activeSession
        ? Math.max(0, Math.floor((Date.now() - attendanceStats.activeSession.checkInTime) / 1000))
        : 0;

    const todayHoursText = attendanceStats?.todayHoursFormatted || '0h 0m';
    const weekHoursText = attendanceStats?.weekHoursFormatted || '0h 0m';

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

            {/* Main Content */}
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Screen Title & Subtitle */}
                <View style={styles.titleSection}>
                    <Text style={[styles.screenTitle, { color: colors.textPrimary }]}>
                        Attendance
                    </Text>
                    <Text style={[styles.screenSubtitle, { color: colors.textSecondary }]}>
                        Track your daily work hours and status.
                    </Text>
                </View>

                {/* Common Check In/Out Card Component */}
                <CheckInOutCard
                    variant="session"
                    isCheckedIn={isCheckedIn}
                    todayHours={todayHoursText}
                    weekHours={weekHoursText}
                    initialSessionSeconds={initialSessionSeconds}
                    onCheckIn={handleCheckIn}
                    onCheckOut={handleCheckOut}
                />

                {/* Attendance History Quick Link Banner Button */}
                <TouchableOpacity
                    style={[
                        styles.historyBannerButton,
                        {
                            backgroundColor: colors.card,
                            borderColor: colors.cardBorder,
                        },
                    ]}
                    onPress={handleNavigateToHistory}
                    activeOpacity={0.7}
                >
                    <View style={styles.historyBannerLeft}>
                        <View
                            style={[
                                styles.historyBannerIconWrapper,
                                {
                                    backgroundColor: isDark
                                        ? 'rgba(59, 130, 246, 0.15)'
                                        : '#EBF2FF',
                                },
                            ]}
                        >
                            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                        </View>
                        <View style={styles.historyBannerTexts}>
                            <Text
                                style={[
                                    styles.historyBannerTitle,
                                    { color: colors.textPrimary },
                                ]}
                            >
                                Attendance History
                            </Text>
                            <Text
                                style={[
                                    styles.historyBannerSubtitle,
                                    { color: colors.textSecondary },
                                ]}
                            >
                                View daily check-ins, logs & locations
                            </Text>
                        </View>
                    </View>
                    <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={isDark ? colors.textTertiary : '#94A3B8'}
                    />
                </TouchableOpacity>

                {/* Recent Activity Section */}
                <View style={styles.recentSection}>
                    <View style={styles.recentHeaderRow}>
                        <Text style={[styles.recentTitle, { color: colors.textPrimary }]}>
                            Recent Activity
                        </Text>
                        <TouchableOpacity
                            style={styles.viewAllButton}
                            onPress={handleNavigateToHistory}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.viewAllText, { color: colors.primary }]}>
                                View All
                            </Text>
                            <Ionicons name="chevron-forward" size={14} color={colors.primary} />
                        </TouchableOpacity>
                    </View>

                    {/* Activities Card */}
                    <View
                        style={[
                            styles.activityCard,
                            {
                                backgroundColor: colors.card,
                                borderColor: colors.cardBorder,
                                shadowColor: colors.shadowColor,
                            },
                        ]}
                    >
                        {activities.length === 0 ? (
                            <View style={{ paddingVertical: 18, alignItems: 'center' }}>
                                <Ionicons
                                    name="time-outline"
                                    size={30}
                                    color={isDark ? colors.textTertiary : '#94A3B8'}
                                    style={{ marginBottom: 6 }}
                                />
                                <Text
                                    style={{
                                        color: isDark ? colors.textSecondary : '#64748B',
                                        fontSize: 13,
                                        textAlign: 'center',
                                    }}
                                >
                                    No attendance activity recorded yet today.
                                </Text>
                            </View>
                        ) : (
                            activities.map((activity, index) => {
                                const isLast = index === activities.length - 1;
                                return (
                                    <React.Fragment key={activity.id}>
                                        <View style={styles.activityItem}>
                                            <View
                                                style={[
                                                    styles.activityDot,
                                                    {
                                                        backgroundColor:
                                                            activity.type === 'in'
                                                                ? '#10B981'
                                                                : isDark
                                                                ? colors.inputBorder
                                                                : '#CBD5E1',
                                                    },
                                                ]}
                                            />
                                            <View style={styles.activityInfo}>
                                                <View style={styles.activityTopRow}>
                                                    <Text
                                                        style={[
                                                            styles.activityItemTitle,
                                                            { color: colors.textPrimary },
                                                        ]}
                                                    >
                                                        {activity.title}
                                                    </Text>
                                                    <Text
                                                        style={[
                                                            styles.activityTime,
                                                            { color: colors.textSecondary },
                                                        ]}
                                                    >
                                                        {activity.time}
                                                    </Text>
                                                </View>
                                                <Text
                                                    style={[
                                                        styles.activityLocation,
                                                        { color: colors.textSecondary },
                                                    ]}
                                                >
                                                    {activity.location}
                                                </Text>
                                            </View>
                                        </View>
                                        {!isLast && (
                                            <View
                                                style={[
                                                    styles.activityDivider,
                                                    {
                                                        backgroundColor: isDark
                                                            ? colors.inputBorder
                                                            : '#F1F5F9',
                                                    },
                                                ]}
                                            />
                                        )}
                                    </React.Fragment>
                                );
                            })
                        )}
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Tab Bar Navigation */}
            <BottomTabBar activeTab="Attendance" />
        </SafeAreaView>
    );
};

export default AttendanceScreen;

