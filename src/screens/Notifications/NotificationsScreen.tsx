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
import { BottomTabBar } from '../../components/BottomTabBar';
import { notificationService } from '../../services/notification.service';
import { AppNotification } from '../../types';
import { styles } from './Notifications.styles';
import { DEFAULT_AVATAR_URL } from '../../constants/profile.constants';

export const NotificationsScreen: React.FC = () => {
    const { user, navigate, currentScreen } = useAuth();
    const { colors, isDark } = useTheme();
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const loadNotifications = useCallback(async () => {
        const targetId = user?.id || user?.email;
        if (!targetId) return;

        try {
            const list = await notificationService.getNotifications(targetId);
            setNotifications(list);
            // Mark all as read once viewed
            await notificationService.markAllAsRead(targetId);
        } catch (error) {
            console.warn('Failed to load notifications:', error);
        }
    }, [user?.id, user?.email]);

    useEffect(() => {
        if (currentScreen === 'Notifications') {
            loadNotifications();
        }
    }, [currentScreen, loadNotifications]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await loadNotifications();
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleClearAll = () => {
        const targetId = user?.id || user?.email;
        if (!targetId || notifications.length === 0) return;

        Alert.alert(
            'Clear Notifications',
            'Are you sure you want to clear all notifications?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear All',
                    style: 'destructive',
                    onPress: async () => {
                        await notificationService.clearAllNotifications(targetId);
                        setNotifications([]);
                    },
                },
            ]
        );
    };

    const avatarUrl =
        user?.avatarUrl ||
        DEFAULT_AVATAR_URL

    const getIconConfig = (type: AppNotification['type']) => {
        switch (type) {
            case 'checkin':
                return {
                    name: 'checkmark-circle-outline',
                    color: colors.primary,
                    bgColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EBF2FF',
                };
            case 'checkout':
                return {
                    name: 'log-out-outline',
                    color: '#10B981',
                    bgColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5',
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
            case 'break':
                return {
                    name: 'pause-circle-outline',
                    color: '#D97706',
                    bgColor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#FEF3C7',
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

    const todayList = notifications.filter((n) => notificationService.isToday(n.timestamp));
    const earlierList = notifications.filter((n) => !notificationService.isToday(n.timestamp));

    const renderNotificationCard = (item: AppNotification) => {
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

                {/* Bell Button */}
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
                {/* Screen Title & Action */}
                <View style={styles.titleSection}>
                    <Text style={[styles.screenTitle, { color: colors.textPrimary }]}>
                        Notifications
                    </Text>
                    {notifications.length > 0 && (
                        <TouchableOpacity
                            style={styles.clearAllButton}
                            onPress={handleClearAll}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.clearAllText, { color: colors.primary }]}>
                                Clear All
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {notifications.length === 0 ? (
                    <View style={styles.emptyStateContainer}>
                        <View
                            style={[
                                styles.emptyIconCircle,
                                {
                                    backgroundColor: isDark
                                        ? 'rgba(59, 130, 246, 0.12)'
                                        : '#EBF2FF',
                                },
                            ]}
                        >
                            <Ionicons
                                name="notifications-off-outline"
                                size={32}
                                color={colors.primary}
                            />
                        </View>
                        <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                            No Notifications Yet
                        </Text>
                        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                            When you check in, check out, or complete work sessions, your total working hours will appear here.
                        </Text>
                    </View>
                ) : (
                    <>
                        {/* Section: Today */}
                        {todayList.length > 0 && (
                            <View style={styles.section}>
                                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                                    Today
                                </Text>
                                {todayList.map(renderNotificationCard)}
                            </View>
                        )}

                        {/* Section: Earlier */}
                        {earlierList.length > 0 && (
                            <View style={styles.section}>
                                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                                    Earlier
                                </Text>
                                {earlierList.map(renderNotificationCard)}
                            </View>
                        )}
                    </>
                )}
            </ScrollView>

            {/* Bottom Tab Bar Navigation */}
            <BottomTabBar activeTab="Dashboard" />
        </SafeAreaView>
    );
};

export default NotificationsScreen;
