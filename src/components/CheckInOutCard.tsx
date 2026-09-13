import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useTheme } from '../theme/ThemeContext';

export interface CheckInOutCardProps {
  variant?: 'session' | 'full';
  isCheckedIn?: boolean;
  onCheckIn?: () => void;
  onCheckOut?: () => void;
  initialSessionSeconds?: number;
  todayHours?: string;
  weekHours?: string;
  locationText?: string;
}

export const CheckInOutCard: React.FC<CheckInOutCardProps> = ({
  variant = 'session',
  isCheckedIn = false,
  onCheckIn,
  onCheckOut,
  initialSessionSeconds = 0,
  todayHours = '0h 0m',
  weekHours = '32h 15m',
}) => {
  const { colors, isDark } = useTheme();
  const [checkedIn, setCheckedIn] = useState(isCheckedIn);
  const [sessionSeconds, setSessionSeconds] = useState(initialSessionSeconds);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);

  // Sync prop changes
  useEffect(() => {
    setCheckedIn(isCheckedIn);
    if (initialSessionSeconds > 0) {
      setSessionSeconds(initialSessionSeconds);
    }
  }, [isCheckedIn, initialSessionSeconds]);

  // Session duration timer
  useEffect(() => {
    if (!checkedIn) return;

    const interval = setInterval(() => {
      setSessionSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [checkedIn]);

  // Real-time clock for full variant
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(clockInterval);
  }, []);

  const formatSessionTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}:${
      seconds < 10 ? '0' : ''
    }${seconds}`;
  };

  const formatClockTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}`;
  };

  const formatDate = (date: Date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
  };

  const handleToggle = async (action: 'in' | 'out') => {
    setIsLoading(true);
    try {
      if (action === 'in') {
        if (onCheckIn) await onCheckIn();
        setCheckedIn(true);
      } else {
        if (onCheckOut) await onCheckOut();
        setCheckedIn(false);
        setSessionSeconds(0);
      }
    } catch (error) {
      console.warn('Check in/out toggle error:', error);
    } finally {
      setIsLoading(false);
    }
  };


  // -------------------------------------------------------------
  // Variant: "session" and checked-in
  // -------------------------------------------------------------
  if (variant === 'session' && checkedIn) {
    return (
      <View
        style={[
          styles.card,
          styles.cardCheckedIn,
          {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
            shadowColor: colors.shadowColor,
          },
        ]}
      >
        {/* Header Row */}
        <View style={styles.sessionHeaderRow}>
          <Text style={[styles.sessionTitle, { color: colors.textPrimary }]}>Current Status</Text>
          <View style={[styles.checkedInBadge, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#E6F9F0' }]}>
            <View style={styles.greenDot} />
            <Text style={styles.checkedInBadgeText}>Checked In</Text>
          </View>
        </View>

        {/* Center Clock / Duration */}
        <View style={styles.sessionBody}>
          <Text style={[styles.sessionSubtitle, { color: colors.textSecondary }]}>Session Duration</Text>
          <Text style={[styles.sessionDuration, { color: colors.textPrimary }]}>
            {formatSessionTime(sessionSeconds)}
          </Text>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={[
            styles.checkOutButton,
            { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.12)' : '#F3F4F6' },
          ]}
          onPress={() => handleToggle('out')}
          disabled={isLoading}
          activeOpacity={0.75}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.error} size="small" />
          ) : (
            <Text style={[styles.checkOutButtonText, { color: colors.error }]}>Check Out</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  // -------------------------------------------------------------
  // Ready to Check In State (Matches provided UI screenshot)
  // -------------------------------------------------------------
  return (
    <View
      style={[
        styles.fullCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
          borderLeftColor: checkedIn ? '#10B981' : isDark ? '#4B5563' : '#94A3B8',
          shadowColor: colors.shadowColor,
        },
      ]}
    >
      {/* Top Status Pill */}
      <View style={styles.fullStatusRow}>
        <Text style={[styles.statusSectionLabel, { color: isDark ? colors.textTertiary : '#4B5563' }]}>
          CURRENT STATUS
        </Text>
        <View
          style={
            checkedIn
              ? [styles.checkedInBadge, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#E6F9F0' }]
              : [styles.readyBadge, { backgroundColor: isDark ? colors.inputBackground : '#F1F5F9' }]
          }
        >
          <View style={checkedIn ? styles.greenDot : styles.grayDot} />
          <Text
            style={
              checkedIn
                ? styles.checkedInBadgeText
                : [styles.readyBadgeText, { color: isDark ? colors.textSecondary : '#475569' }]
            }
          >
            {checkedIn ? 'Checked In' : 'Ready to Check In'}
          </Text>
        </View>
      </View>

      {/* Big Time Display */}
      <View style={styles.clockContainer}>
        <Text style={[styles.bigClockText, { color: colors.textPrimary }]}>{formatClockTime(currentTime)}</Text>
        <Text style={[styles.clockDateText, { color: colors.textSecondary }]}>{formatDate(currentTime)}</Text>
      </View>

      {/* Buttons */}
      <View style={styles.fullButtonsContainer}>
        <TouchableOpacity
          style={[
            styles.primaryCheckInButton,
            { backgroundColor: colors.primary },
            checkedIn && [styles.buttonMuted, { backgroundColor: isDark ? colors.inputBackground : '#F1F3FB' }],
          ]}
          onPress={() => handleToggle('in')}
          disabled={checkedIn || isLoading}
          activeOpacity={0.85}
        >
          {isLoading && !checkedIn ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <View style={styles.buttonContent}>
              <Ionicons
                name="log-in-outline"
                size={18}
                color={checkedIn ? (isDark ? colors.textTertiary : '#94A3B8') : '#FFFFFF'}
                style={styles.buttonIcon}
              />
              <Text
                style={[
                  styles.primaryCheckInText,
                  checkedIn && [styles.buttonTextMuted, { color: isDark ? colors.textTertiary : '#94A3B8' }],
                ]}
              >
                Check In
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.primaryCheckOutButton,
            { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EEF2FF' },
            !checkedIn && [styles.buttonMuted, { backgroundColor: isDark ? colors.inputBackground : '#F1F3FB' }],
          ]}
          onPress={() => handleToggle('out')}
          disabled={!checkedIn || isLoading}
          activeOpacity={0.85}
        >
          {isLoading && checkedIn ? (
            <ActivityIndicator color={colors.error} size="small" />
          ) : (
            <View style={styles.buttonContent}>
              <Ionicons
                name="log-out-outline"
                size={18}
                color={!checkedIn ? (isDark ? colors.textTertiary : '#94A3B8') : colors.error}
                style={styles.buttonIcon}
              />
              <Text
                style={[
                  styles.primaryCheckOutText,
                  { color: colors.primary },
                  !checkedIn && [styles.buttonTextMuted, { color: isDark ? colors.textTertiary : '#94A3B8' }],
                ]}
              >
                Check Out
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Footer Stats Row */}
      <View
        style={[
          styles.footerDivider,
          { backgroundColor: isDark ? colors.inputBorder : '#F1F5F9' },
        ]}
      />
      <View style={styles.footerStatsRow}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.textPrimary }]}>{todayHours}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Today</Text>
        </View>
        <View
          style={[
            styles.verticalDivider,
            { backgroundColor: isDark ? colors.inputBorder : '#E2E8F0' },
          ]}
        />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.textPrimary }]}>{weekHours}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>This Week</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Session Variant Styles
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginVertical: 8,
    shadowColor: '#1A2A4E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.7)',
    overflow: 'hidden',
  },
  cardCheckedIn: {
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  sessionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sessionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  checkedInBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F9F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  checkedInBadgeText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#10B981',
  },
  readyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  grayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#94A3B8',
    marginRight: 6,
  },
  readyBadgeText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  sessionBody: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginBottom: 14,
  },
  sessionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  sessionDuration: {
    fontSize: 30,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: 0.5,
  },
  checkOutButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOutButtonText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '600',
  },
  checkInButton: {
    backgroundColor: '#004AC6',
    borderRadius: 10,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkInButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 6,
  },

  // Full Variant Styles
  fullCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    shadowColor: '#1A2A4E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    borderLeftWidth: 4,
    borderLeftColor: '#94A3B8',
    overflow: 'hidden',
  },
  fullStatusRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  statusSectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  clockContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  bigClockText: {
    fontSize: 38,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
  clockDateText: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '500',
  },
  fullButtonsContainer: {
    marginBottom: 18,
  },
  primaryCheckInButton: {
    backgroundColor: '#004AC6',
    borderRadius: 10,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  primaryCheckInText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '600',
  },
  primaryCheckOutButton: {
    backgroundColor: '#EEF2FF',
    borderRadius: 10,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryCheckOutText: {
    color: '#004AC6',
    fontSize: 14.5,
    fontWeight: '600',
  },
  buttonMuted: {
    backgroundColor: '#F1F3FB',
  },
  buttonTextMuted: {
    color: '#94A3B8',
  },
  footerDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 14,
  },
  footerStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  verticalDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E2E8F0',
  },
});

export default CheckInOutCard;
