import React from 'react';
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
import { AttendanceHistory } from '../../components/AttendanceHistory';
import { BottomTabBar } from '../../components/BottomTabBar';
import { styles } from './AttendanceHistory.styles';

export const AttendanceHistoryScreen: React.FC = () => {
    const { user, navigate, goBack } = useAuth();
    const { colors, isDark } = useTheme();

    const avatarUrl =
        user?.avatarUrl ||
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80';

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
                </TouchableOpacity>
            </View>

            {/* Main Scroll Content */}
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
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
                <AttendanceHistory />
            </ScrollView>

            {/* Bottom Navigation */}
            <BottomTabBar activeTab="Attendance" />
        </SafeAreaView>
    );
};

export default AttendanceHistoryScreen;
