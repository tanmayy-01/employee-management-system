import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
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

const DashboardScreen: React.FC = () => {
    const { user } = useAuth();
    const { colors, isDark } = useTheme();
    const [isCheckedIn, setIsCheckedIn] = useState(false);

    const userName = user?.name || 'Alex Rivera';
    const employeeId = user?.employeeId || 'EMP-8492';
    const avatarUrl =
        user?.avatarUrl ||
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80';

    const getCurrentDateFormatted = () => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
        ];
        const now = new Date();
        return `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`;
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
                    activeOpacity={0.7}
                >
                    <Ionicons name="notifications-outline" size={22} color={colors.primary} />
                </TouchableOpacity>
            </View>

            {/* Main Scrollable Content */}
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
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
                            {isCheckedIn ? '4h 32m' : '0h 0m'}
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
                            {isCheckedIn ? '3h 28m' : '8h 00m'}
                        </Text>
                    </View>
                </View>

                {/* Current Status / Check In-Out Card */}
                <CheckInOutCard
                    variant="session"
                    isCheckedIn={isCheckedIn}
                    todayHours={isCheckedIn ? '4h 32m' : '0h 0m'}
                    weekHours="32h 15m"
                    onCheckIn={() => setIsCheckedIn(true)}
                    onCheckOut={() => setIsCheckedIn(false)}
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
                                {isCheckedIn ? 'Checked In (Current)' : 'Not Checked In Yet'}
                            </Text>
                            <View style={styles.timelineLocationRow}>
                                <Ionicons name="location-outline" size={13} color={colors.textSecondary} />
                                <Text style={[styles.timelineLocationText, { color: colors.textSecondary }]}>
                                    {isCheckedIn ? 'Main Office • 08:30 AM' : 'Main Office • Ready for check-in'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Tab Bar Navigation */}
            <BottomTabBar activeTab="Dashboard" />
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
        paddingBottom: 16,
    },
    greetingCard: {
        position: 'relative',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 18,
        marginVertical: 6,
        shadowColor: '#1A2A4E',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
        borderWidth: 1,
        borderColor: 'rgba(226, 232, 240, 0.7)',
        overflow: 'hidden',
    },
    decorativeShape: {
        position: 'absolute',
        top: -20,
        right: -20,
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: '#EBF2FF',
    },
    greetingDate: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
        marginBottom: 4,
    },
    greetingTitle: {
        fontSize: 19,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 6,
        letterSpacing: -0.2,
    },
    empIdRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    empIcon: {
        marginRight: 4,
    },
    empIdText: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
    statCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 14,
        marginVertical: 5,
        shadowColor: '#1A2A4E',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: 'rgba(226, 232, 240, 0.7)',
    },
    blueStatIconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#004AC6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    grayStatIconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#EDF1FA',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    statInfo: {
        flex: 1,
    },
    statLabel: {
        fontSize: 10.5,
        fontWeight: '700',
        color: '#64748B',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '800',
        color: '#111827',
    },
    timelineCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 18,
        marginVertical: 6,
        shadowColor: '#1A2A4E',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
        borderWidth: 1,
        borderColor: 'rgba(226, 232, 240, 0.7)',
    },
    timelineTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 14,
    },
    timelineItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timelineDotIcon: {
        marginRight: 12,
    },
    timelineContent: {
        flex: 1,
    },
    timelineItemTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 3,
    },
    timelineLocationRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timelineLocationText: {
        fontSize: 12,
        color: '#6B7280',
        marginLeft: 3,
    },
});

export default DashboardScreen;
