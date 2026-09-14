import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StatusBar,
    Image,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../theme/ThemeContext';
import { AttendanceHistory } from '../../components/AttendanceHistory';
import { BottomTabBar } from '../../components/BottomTabBar';
import { attendanceService } from '../../services/attendance.service';
import { notificationService } from '../../services/notification.service';
import { styles } from './AttendanceHistory.styles';
import { DEFAULT_AVATAR_URL } from '../../constants/profile.constants';
import { AttendanceGroup } from '../../types';

export const AttendanceHistoryScreen: React.FC = () => {
    const { user, navigate, goBack, currentScreen } = useAuth();
    const { colors, isDark } = useTheme();
    const [groups, setGroups] = useState<AttendanceGroup[] | undefined>(undefined);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const loadHistory = useCallback(async () => {
        if (!user?.id && !user?.email) return;
        const targetId = user?.id || user?.email || '';

        try {
            const [data, unread] = await Promise.all([
                attendanceService.getGroupedAttendanceHistory(targetId),
                notificationService.getUnreadCount(targetId),
            ]);

            if (data && data.length > 0) {
                setGroups(data);
            } else {
                setGroups([
                    {
                        id: 'empty_group',
                        sectionTitle: 'Today & Recent',
                        records: [],
                        emptyState: {
                            title: 'No attendance logs found',
                            description: 'You have no check-in records logged yet. Check in to record your attendance.',
                            showClearFilter: false,
                        },
                    },
                ]);
            }
            setUnreadCount(unread || 0);
        } catch (error) {
            console.warn('Failed to load grouped attendance history:', error);
        }
    }, [user?.id, user?.email]);

    useEffect(() => {
        if (currentScreen === 'AttendanceHistory') {
            loadHistory();
        }
    }, [currentScreen, loadHistory, user]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await loadHistory();
        } finally {
            setIsRefreshing(false);
        }
    };

    const avatarUrl =
        user?.avatarUrl ||
        DEFAULT_AVATAR_URL

    return (
        <SafeAreaView
            style={[styles.safeArea, { backgroundColor: isDark ? colors.background : '#FAF8FF' }]}
            edges={['top', 'left', 'right']}
        >
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            {/* Top Header Bar */}
            <View style={[styles.topHeader, { backgroundColor: isDark ? colors.background : '#FAF8FF' }]}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity
                        style={[styles.backButton, { backgroundColor: isDark ? colors.card : '#F1F5F9' }]}
                        onPress={goBack}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
                    </TouchableOpacity>

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

            {/* Main Scroll Content */}
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
                {/* Title & Subtitle */}
                <View style={styles.titleSection}>
                    <Text style={[styles.screenTitle, { color: colors.textPrimary }]}>
                        Attendance History
                    </Text>
                    <Text style={[styles.screenSubtitle, { color: colors.textSecondary }]}>
                        Review your daily check-ins, durations, and locations.
                    </Text>
                </View>

                {/* Attendance History Component */}
                <AttendanceHistory groups={groups} />
            </ScrollView>

            {/* Bottom Navigation */}
            <BottomTabBar activeTab="Attendance" />
        </SafeAreaView>
    );
};

export default AttendanceHistoryScreen;

