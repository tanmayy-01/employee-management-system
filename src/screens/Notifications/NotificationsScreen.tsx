import React from 'react';
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
import { BottomTabBar } from '../../components/BottomTabBar';

interface NotificationItem {
    id: string;
    title: string;
    description: string;
    time: string;
    type: 'checkin' | 'meeting' | 'summary' | 'alert';
}

const TODAY_NOTIFICATIONS: NotificationItem[] = [
    {
        id: '1',
        title: 'Checked in successfully',
        description: 'Your attendance has been recorded for the day.',
        time: '09:15 AM',
        type: 'checkin',
    },
    {
        id: '2',
        title: 'Team Meeting',
        description: 'Weekly sync in Conference Room B.',
        time: '11:00 AM',
        type: 'meeting',
    },
];

const EARLIER_NOTIFICATIONS: NotificationItem[] = [
    {
        id: '3',
        title: 'Attendance Summary',
        description: 'You worked 8h 42m yesterday.',
        time: 'Yesterday',
        type: 'summary',
    },
    {
        id: '4',
        title: 'System Maintenance',
        description: 'WorkPulse will be down for scheduled maintenance this weekend.',
        time: 'Oct 24',
        type: 'alert',
    },
];

export const NotificationsScreen: React.FC = () => {
    const { user, navigate } = useAuth();
    const { colors, isDark } = useTheme();

    const avatarUrl =
        user?.avatarUrl ||
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80';

    const getIconConfig = (type: NotificationItem['type']) => {
        switch (type) {
            case 'checkin':
                return {
                    name: 'checkmark-circle-outline',
                    color: colors.primary,
                    bgColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EBF2FF',
                };
            case 'meeting':
                return {
                    name: 'calendar-outline',
                    color: colors.primary,
                    bgColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EBF2FF',
                };
            case 'summary':
                return {
                    name: 'time-outline',
                    color: isDark ? colors.textSecondary : '#64748B',
                    bgColor: isDark ? colors.inputBackground : '#EDF2F7',
                };
            case 'alert':
                return {
                    name: 'warning-outline',
                    color: '#D97706',
                    bgColor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#FEF3C7',
                };
            default:
                return {
                    name: 'notifications-outline',
                    color: colors.primary,
                    bgColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EBF2FF',
                };
        }
    };

    const renderNotificationCard = (item: NotificationItem) => {
        const iconConfig = getIconConfig(item.type);

        return (
            <View
                key={item.id}
                style={[
                    styles.notificationCard,
                    {
                        backgroundColor: colors.card,
                        borderColor: colors.cardBorder,
                        shadowColor: colors.shadowColor,
                    },
                ]}
            >
                <View style={[styles.iconCircle, { backgroundColor: iconConfig.bgColor }]}>
                    <Ionicons name={iconConfig.name as any} size={20} color={iconConfig.color} />
                </View>

                <View style={styles.contentColumn}>
                    <View style={styles.cardHeaderRow}>
                        <Text style={[styles.itemTitle, { color: colors.textPrimary }]}>
                            {item.title}
                        </Text>
                        <Text style={[styles.itemTime, { color: colors.textSecondary }]}>
                            {item.time}
                        </Text>
                    </View>
                    <Text style={[styles.itemDescription, { color: colors.textSecondary }]}>
                        {item.description}
                    </Text>
                </View>
            </View>
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

                {/* Bell Button (Active indicator on Notifications screen) */}
                <TouchableOpacity
                    style={[
                        styles.bellButton,
                        {
                            backgroundColor: colors.card,
                            shadowColor: colors.shadowColor,
                        },
                    ]}
                    onPress={() => navigate('Dashboard')}
                    activeOpacity={0.7}
                >
                    <Ionicons name="notifications" size={22} color={colors.primary} />
                </TouchableOpacity>
            </View>

            {/* Main Content */}
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Screen Title */}
                <View style={styles.titleSection}>
                    <Text style={[styles.screenTitle, { color: colors.textPrimary }]}>
                        Notifications
                    </Text>
                </View>

                {/* Section: Today */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                        Today
                    </Text>
                    {TODAY_NOTIFICATIONS.map(renderNotificationCard)}
                </View>

                {/* Section: Earlier */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                        Earlier
                    </Text>
                    {EARLIER_NOTIFICATIONS.map(renderNotificationCard)}
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
        paddingBottom: 24,
    },
    titleSection: {
        marginTop: 8,
        marginBottom: 16,
    },
    screenTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#111827',
        letterSpacing: -0.2,
    },
    section: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6B7280',
        marginBottom: 10,
        marginLeft: 2,
    },
    notificationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        shadowColor: '#1A2A4E',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 1.5,
        borderWidth: 1,
        borderColor: 'rgba(226, 232, 240, 0.7)',
    },
    iconCircle: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 13,
    },
    contentColumn: {
        flex: 1,
    },
    cardHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 3,
    },
    itemTitle: {
        fontSize: 13.5,
        fontWeight: '700',
        color: '#111827',
        flex: 1,
        marginRight: 8,
    },
    itemTime: {
        fontSize: 11,
        color: '#6B7280',
        fontWeight: '500',
    },
    itemDescription: {
        fontSize: 12,
        color: '#6B7280',
        lineHeight: 16,
    },
});

export default NotificationsScreen;
