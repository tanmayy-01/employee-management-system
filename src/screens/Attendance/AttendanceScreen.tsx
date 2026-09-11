import React, { useState } from 'react';
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
import { CheckInOutCard } from '../../components/CheckInOutCard';
import { BottomTabBar } from '../../components/BottomTabBar';

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

    const handleViewAll = () => {
        Alert.alert(
            'Attendance History',
            'Full attendance history and monthly time logs are available in your WorkPulse portal.',
            [{ text: 'OK' }]
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

                {/* Recent Activity Section */}
                <View style={styles.recentSection}>
                    <View style={styles.recentHeaderRow}>
                        <Text style={[styles.recentTitle, { color: colors.textPrimary }]}>
                            Recent Activity
                        </Text>
                        <TouchableOpacity onPress={handleViewAll} activeOpacity={0.7}>
                            <Text style={[styles.viewAllText, { color: colors.primary }]}>
                                View All
                            </Text>
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
    avatarImage: {
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
        paddingBottom: 24,
    },
    titleSection: {
        marginTop: 6,
        marginBottom: 12,
        alignItems: 'center',
    },
    screenTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 4,
        letterSpacing: -0.2,
    },
    screenSubtitle: {
        fontSize: 13,
        color: '#6B7280',
    },
    recentSection: {
        marginTop: 14,
        marginBottom: 16,
    },
    recentHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
        paddingHorizontal: 2,
    },
    recentTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    viewAllText: {
        fontSize: 12.5,
        fontWeight: '600',
        color: '#004AC6',
    },
    activityCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 6,
        shadowColor: '#1A2A4E',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: 'rgba(226, 232, 240, 0.7)',
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    activityDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#CBD5E1',
        marginRight: 12,
    },
    activityInfo: {
        flex: 1,
    },
    activityTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    activityItemTitle: {
        fontSize: 13.5,
        fontWeight: '700',
        color: '#111827',
    },
    activityTime: {
        fontSize: 11.5,
        color: '#6B7280',
        fontWeight: '500',
    },
    activityLocation: {
        fontSize: 11.5,
        color: '#6B7280',
    },
    activityDivider: {
        height: 1,
        backgroundColor: '#F1F5F9',
    },
});

export default AttendanceScreen;
