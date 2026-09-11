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
import { styles } from './Notifications.styles';

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



export default NotificationsScreen;
