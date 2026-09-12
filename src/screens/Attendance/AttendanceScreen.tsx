import React, { useState } from 'react';
import {
    View,
    Text,
    StatusBar,
    Image,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../theme/ThemeContext';
import { CheckInOutCard } from '../../components/CheckInOutCard';
import { BottomTabBar } from '../../components/BottomTabBar';
import { styles } from './Attendance.styles';

interface ActivityItem {
    id: string;
    type: 'in' | 'out';
    title: string;
    location: string;
    time: string;
}

const RECENT_ACTIVITIES: ActivityItem[] = [
    {
        id: '1',
        type: 'out',
        title: 'Checked Out',
        location: 'Office HQ',
        time: 'Fri, 5:00 PM',
    },
    {
        id: '2',
        type: 'in',
        title: 'Checked In',
        location: 'Office HQ',
        time: 'Fri, 8:55 AM',
    },
];

export const AttendanceScreen: React.FC = () => {
    const { user, navigate } = useAuth();
    const { colors, isDark } = useTheme();
    const [isCheckedIn, setIsCheckedIn] = useState(false);

    const avatarUrl =
        user?.avatarUrl ||
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80';

    const handleNavigateToHistory = () => {
        navigate('AttendanceHistory');
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
                    todayHours={isCheckedIn ? '4h 32m' : '0h 0m'}
                    weekHours="32h 15m"
                    onCheckIn={() => setIsCheckedIn(true)}
                    onCheckOut={() => setIsCheckedIn(false)}
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
                        {RECENT_ACTIVITIES.map((activity, index) => {
                            const isLast = index === RECENT_ACTIVITIES.length - 1;
                            return (
                                <React.Fragment key={activity.id}>
                                    <View style={styles.activityItem}>
                                        <View
                                            style={[
                                                styles.activityDot,
                                                {
                                                    backgroundColor: isDark
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
                        })}
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Tab Bar Navigation */}
            <BottomTabBar activeTab="Attendance" />
        </SafeAreaView>
    );
};

export default AttendanceScreen;
