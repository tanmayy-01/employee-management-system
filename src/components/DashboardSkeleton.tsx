import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export interface SkeletonPulseProps {
    style?: StyleProp<ViewStyle>;
    isDark?: boolean;
}

export const SkeletonPulse: React.FC<SkeletonPulseProps> = ({ style, isDark }) => {
    const pulseAnim = useRef(new Animated.Value(0.35)).current;

    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 0.95,
                    duration: 750,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 0.35,
                    duration: 750,
                    useNativeDriver: true,
                }),
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, [pulseAnim]);

    const baseColor = isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0';

    return (
        <Animated.View
            style={[
                styles.skeletonBox,
                {
                    backgroundColor: baseColor,
                    opacity: pulseAnim,
                },
                style,
            ]}
        />
    );
};

export const DashboardSkeleton: React.FC = () => {
    const { colors, isDark } = useTheme();

    return (
        <View style={styles.container}>
            {/* Greeting Card Skeleton */}
            <View
                style={[
                    styles.skeletonCard,
                    {
                        backgroundColor: colors.card,
                        borderColor: colors.cardBorder,
                        shadowColor: colors.shadowColor,
                    },
                ]}
            >
                <SkeletonPulse
                    isDark={isDark}
                    style={{ width: '40%', height: 13, marginBottom: 12, borderRadius: 4 }}
                />
                <SkeletonPulse
                    isDark={isDark}
                    style={{ width: '75%', height: 22, marginBottom: 10, borderRadius: 6 }}
                />
                <SkeletonPulse
                    isDark={isDark}
                    style={{ width: '30%', height: 13, borderRadius: 4 }}
                />
            </View>

            {/* Stat Card 1 Skeleton */}
            <View
                style={[
                    styles.skeletonStatCard,
                    {
                        backgroundColor: colors.card,
                        borderColor: colors.cardBorder,
                        shadowColor: colors.shadowColor,
                    },
                ]}
            >
                <SkeletonPulse
                    isDark={isDark}
                    style={{ width: 44, height: 44, borderRadius: 22, marginRight: 14 }}
                />
                <View style={{ flex: 1 }}>
                    <SkeletonPulse
                        isDark={isDark}
                        style={{ width: '50%', height: 11, marginBottom: 8, borderRadius: 3 }}
                    />
                    <SkeletonPulse
                        isDark={isDark}
                        style={{ width: '35%', height: 18, borderRadius: 4 }}
                    />
                </View>
            </View>

            {/* Stat Card 2 Skeleton */}
            <View
                style={[
                    styles.skeletonStatCard,
                    {
                        backgroundColor: colors.card,
                        borderColor: colors.cardBorder,
                        shadowColor: colors.shadowColor,
                    },
                ]}
            >
                <SkeletonPulse
                    isDark={isDark}
                    style={{ width: 44, height: 44, borderRadius: 22, marginRight: 14 }}
                />
                <View style={{ flex: 1 }}>
                    <SkeletonPulse
                        isDark={isDark}
                        style={{ width: '45%', height: 11, marginBottom: 8, borderRadius: 3 }}
                    />
                    <SkeletonPulse
                        isDark={isDark}
                        style={{ width: '30%', height: 18, borderRadius: 4 }}
                    />
                </View>
            </View>

            {/* Check-In Action Card Skeleton */}
            <View
                style={[
                    styles.skeletonCheckInCard,
                    {
                        backgroundColor: colors.card,
                        borderColor: colors.cardBorder,
                        shadowColor: colors.shadowColor,
                    },
                ]}
            >
                <View style={[styles.skeletonRow, { justifyContent: 'space-between', marginBottom: 16 }]}>
                    <SkeletonPulse
                        isDark={isDark}
                        style={{ width: '40%', height: 16, borderRadius: 4 }}
                    />
                    <SkeletonPulse
                        isDark={isDark}
                        style={{ width: '25%', height: 16, borderRadius: 4 }}
                    />
                </View>
                <SkeletonPulse
                    isDark={isDark}
                    style={{ width: '100%', height: 50, borderRadius: 12, marginTop: 4 }}
                />
            </View>

            {/* Timeline Card Skeleton */}
            <View
                style={[
                    styles.skeletonCard,
                    {
                        backgroundColor: colors.card,
                        borderColor: colors.cardBorder,
                        shadowColor: colors.shadowColor,
                    },
                ]}
            >
                <SkeletonPulse
                    isDark={isDark}
                    style={{ width: '35%', height: 15, marginBottom: 16, borderRadius: 4 }}
                />
                <View style={styles.skeletonRow}>
                    <SkeletonPulse
                        isDark={isDark}
                        style={{ width: 20, height: 20, borderRadius: 10, marginRight: 12 }}
                    />
                    <View style={{ flex: 1 }}>
                        <SkeletonPulse
                            isDark={isDark}
                            style={{ width: '60%', height: 14, marginBottom: 6, borderRadius: 4 }}
                        />
                        <SkeletonPulse
                            isDark={isDark}
                            style={{ width: '45%', height: 11, borderRadius: 3 }}
                        />
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    skeletonCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 18,
        marginVertical: 6,
        shadowColor: '#1A2A4E',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 1,
        borderWidth: 1,
        borderColor: 'rgba(226, 232, 240, 0.7)',
    },
    skeletonBox: {
        backgroundColor: '#E2E8F0',
        borderRadius: 6,
    },
    skeletonRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    skeletonStatCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 14,
        marginVertical: 5,
        borderWidth: 1,
        borderColor: 'rgba(226, 232, 240, 0.7)',
    },
    skeletonCheckInCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 18,
        marginVertical: 6,
        borderWidth: 1,
        borderColor: 'rgba(226, 232, 240, 0.7)',
    },
});

export default DashboardSkeleton;
