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
import { DAYS_OF_WEEK, SHORT_MONTHS } from '../constants/attendance.constants';

export interface CheckInOutCardProps {
  variant?: 'session' | 'full';
  isCheckedIn?: boolean;
  isPaused?: boolean;
  onCheckIn?: () => Promise<void> | void;
  onCheckOut?: () => Promise<void> | void;
  onPause?: () => Promise<void> | void;
  onResume?: () => Promise<void> | void;
  initialSessionSeconds?: number;
  todayHours?: string;
  weekHours?: string;
  locationText?: string;
}

export const CheckInOutCard: React.FC<CheckInOutCardProps> = ({
  variant = 'session',
  isCheckedIn = false,
  isPaused = false,
  onCheckIn,
  onCheckOut,
  onPause,
  onResume,
  initialSessionSeconds = 0,
  todayHours = '0h 0m',
  weekHours = '32h 15m',
}) => {
  const { colors, isDark } = useTheme();
  const [checkedIn, setCheckedIn] = useState(isCheckedIn);
  const [paused, setPaused] = useState(isPaused);
  const [sessionSeconds, setSessionSeconds] = useState(initialSessionSeconds);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loadingAction, setLoadingAction] = useState<'in' | 'out' | 'pause' | 'resume' | null>(null);

  useEffect(() => {
    setCheckedIn(isCheckedIn);
  }, [isCheckedIn]);

  useEffect(() => {
    setPaused(isPaused);
  }, [isPaused]);

  useEffect(() => {
    if (initialSessionSeconds >= 0) {
      setSessionSeconds(initialSessionSeconds);
    }
  }, [initialSessionSeconds]);

  useEffect(() => {
    if (!checkedIn || paused) return;

    const interval = setInterval(() => {
      setSessionSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [checkedIn, paused]);

  // Clock time update
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
    return `${hours < 10 ? '0' : ''}${hours}:${
      minutes < 10 ? '0' : ''
    }${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const formatClockTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours < 10 ? '0' : ''}${hours}:${
      minutes < 10 ? '0' : ''
    }${minutes}`;
  };

  const formatDate = (date: Date) => {
    const days = DAYS_OF_WEEK;
    const months = SHORT_MONTHS;
    return `${days[date.getDay()]}, ${
      months[date.getMonth()]
    } ${date.getDate()}`;
  };

  const handleToggle = async (action: 'in' | 'out') => {
    setLoadingAction(action);
    try {
      if (action === 'in') {
        if (onCheckIn) await onCheckIn();
        setCheckedIn(true);
        setPaused(false);
      } else {
        if (onCheckOut) await onCheckOut();
        setCheckedIn(false);
        setPaused(false);
        setSessionSeconds(0);
      }
    } catch (error) {
      console.warn('Check in/out toggle error:', error);
    } finally {
      setLoadingAction(null);
    }
  };

  const handlePause = async () => {
    setLoadingAction('pause');
    try {
      if (onPause) await onPause();
      setPaused(true);
    } catch (error) {
      console.warn('Pause error:', error);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleResume = async () => {
    setLoadingAction('resume');
    try {
      if (onResume) await onResume();
      setPaused(false);
    } catch (error) {
      console.warn('Resume error:', error);
    } finally {
      setLoadingAction(null);
    }
  };

  if (variant === 'session' && checkedIn) {
    return (
      <View
        style={[
          styles.card,
          paused ? styles.cardPaused : styles.cardCheckedIn,
          {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
            shadowColor: colors.shadowColor,
          },
        ]}
      >
        {/* Header Row */}
        <View style={styles.sessionHeaderRow}>
          <Text style={[styles.sessionTitle, { color: colors.textPrimary }]}>
            Current Status
          </Text>
          <View
            style={[
              paused ? styles.pausedBadge : styles.checkedInBadge,
              {
                backgroundColor: paused
                  ? isDark
                    ? 'rgba(245, 158, 11, 0.18)'
                    : '#FEF3C7'
                  : isDark
                  ? 'rgba(16, 185, 129, 0.15)'
                  : '#E6F9F0',
              },
            ]}
          >
            <View style={paused ? styles.amberDot : styles.greenDot} />
            <Text
              style={[
                styles.badgeText,
                { color: paused ? (isDark ? '#FBBF24' : '#D97706') : '#10B981' },
              ]}
            >
              {paused ? 'On Break' : 'Checked In'}
            </Text>
          </View>
        </View>

        {/* Center Clock / Duration */}
        <View style={styles.sessionBody}>
          <Text
            style={[
              styles.sessionSubtitle,
              { color: paused ? (isDark ? '#FBBF24' : '#D97706') : colors.textSecondary },
            ]}
          >
            {paused ? 'Session Paused • On Break' : 'Session Duration'}
          </Text>
          <Text
            style={[
              styles.sessionDuration,
              {
                color: paused
                  ? isDark
                    ? '#FBBF24'
                    : '#B45309'
                  : colors.textPrimary,
              },
            ]}
          >
            {formatSessionTime(sessionSeconds)}
          </Text>
        </View>

        {/* Action Buttons Row: Pause / Resume & Check Out */}
        <View style={styles.sessionActionsRow}>
          {paused ? (
            <TouchableOpacity
              style={[
                styles.actionButtonHalf,
                styles.resumeButton,
                { backgroundColor: isDark ? '#10B981' : '#059669' },
              ]}
              onPress={handleResume}
              disabled={loadingAction !== null}
              activeOpacity={0.8}
            >
              {loadingAction === 'resume' ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <View style={styles.buttonContent}>
                  <Ionicons name="play" size={16} color="#FFFFFF" style={styles.buttonIcon} />
                  <Text style={styles.resumeButtonText}>Resume</Text>
                </View>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.actionButtonHalf,
                styles.pauseButton,
                {
                  backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#FFFBEB',
                  borderColor: isDark ? 'rgba(245, 158, 11, 0.4)' : '#FDE68A',
                },
              ]}
              onPress={handlePause}
              disabled={loadingAction !== null}
              activeOpacity={0.8}
            >
              {loadingAction === 'pause' ? (
                <ActivityIndicator color={isDark ? '#FBBF24' : '#D97706'} size="small" />
              ) : (
                <View style={styles.buttonContent}>
                  <Ionicons
                    name="pause"
                    size={16}
                    color={isDark ? '#FBBF24' : '#D97706'}
                    style={styles.buttonIcon}
                  />
                  <Text
                    style={[
                      styles.pauseButtonText,
                      { color: isDark ? '#FBBF24' : '#D97706' },
                    ]}
                  >
                    Pause
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.actionButtonHalf,
              styles.checkOutButtonHalf,
              {
                backgroundColor: isDark ? 'rgba(239, 68, 68, 0.12)' : '#FEE2E2',
                borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : '#FECACA',
              },
            ]}
            onPress={() => handleToggle('out')}
            disabled={loadingAction !== null}
            activeOpacity={0.8}
          >
            {loadingAction === 'out' ? (
              <ActivityIndicator color={colors.error} size="small" />
            ) : (
              <View style={styles.buttonContent}>
                <Ionicons
                  name="log-out-outline"
                  size={16}
                  color={colors.error}
                  style={styles.buttonIcon}
                />
                <Text style={[styles.checkOutButtonText, { color: colors.error }]}>
                  Check Out
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.fullCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
          borderLeftColor: checkedIn
            ? paused
              ? '#F59E0B'
              : '#10B981'
            : isDark
            ? '#4B5563'
            : '#94A3B8',
          shadowColor: colors.shadowColor,
        },
      ]}
    >
      {/* Top Status Pill */}
      <View style={styles.fullStatusRow}>
        <Text
          style={[
            styles.statusSectionLabel,
            { color: isDark ? colors.textTertiary : '#4B5563' },
          ]}
        >
          CURRENT STATUS
        </Text>
        <View
          style={
            checkedIn
              ? paused
                ? [
                    styles.pausedBadge,
                    {
                      backgroundColor: isDark
                        ? 'rgba(245, 158, 11, 0.18)'
                        : '#FEF3C7',
                    },
                  ]
                : [
                    styles.checkedInBadge,
                    {
                      backgroundColor: isDark
                        ? 'rgba(16, 185, 129, 0.15)'
                        : '#E6F9F0',
                    },
                  ]
              : [
                  styles.readyBadge,
                  {
                    backgroundColor: isDark
                      ? colors.inputBackground
                      : '#F1F5F9',
                  },
                ]
          }
        >
          <View
            style={
              checkedIn
                ? paused
                  ? styles.amberDot
                  : styles.greenDot
                : styles.grayDot
            }
          />
          <Text
            style={
              checkedIn
                ? [
                    styles.badgeText,
                    {
                      color: paused
                        ? isDark
                          ? '#FBBF24'
                          : '#D97706'
                        : '#10B981',
                    },
                  ]
                : [
                    styles.readyBadgeText,
                    { color: isDark ? colors.textSecondary : '#475569' },
                  ]
            }
          >
            {checkedIn
              ? paused
                ? 'On Break (Paused)'
                : 'Checked In'
              : 'Ready to Check In'}
          </Text>
        </View>
      </View>

      {/* Big Time Display */}
      <View style={styles.clockContainer}>
        <Text style={[styles.bigClockText, { color: colors.textPrimary }]}>
          {formatClockTime(currentTime)}
        </Text>
        <Text style={[styles.clockDateText, { color: colors.textSecondary }]}>
          {formatDate(currentTime)}
        </Text>
      </View>

      {/* Buttons */}
      <View style={styles.fullButtonsContainer}>
        {checkedIn ? (
          <View style={styles.fullActionButtonsRow}>
            {paused ? (
              <TouchableOpacity
                style={[
                  styles.fullActionBtn,
                  { backgroundColor: isDark ? '#10B981' : '#059669' },
                ]}
                onPress={handleResume}
                disabled={loadingAction !== null}
                activeOpacity={0.85}
              >
                {loadingAction === 'resume' ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <View style={styles.buttonContent}>
                    <Ionicons name="play" size={17} color="#FFFFFF" style={styles.buttonIcon} />
                    <Text style={styles.primaryCheckInText}>Resume</Text>
                  </View>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.fullActionBtn,
                  {
                    backgroundColor: isDark ? 'rgba(245, 158, 11, 0.18)' : '#FEF3C7',
                    borderWidth: 1,
                    borderColor: isDark ? 'rgba(245, 158, 11, 0.4)' : '#FDE68A',
                  },
                ]}
                onPress={handlePause}
                disabled={loadingAction !== null}
                activeOpacity={0.85}
              >
                {loadingAction === 'pause' ? (
                  <ActivityIndicator color={isDark ? '#FBBF24' : '#D97706'} size="small" />
                ) : (
                  <View style={styles.buttonContent}>
                    <Ionicons
                      name="pause"
                      size={17}
                      color={isDark ? '#FBBF24' : '#D97706'}
                      style={styles.buttonIcon}
                    />
                    <Text
                      style={[
                        styles.primaryCheckInText,
                        { color: isDark ? '#FBBF24' : '#D97706' },
                      ]}
                    >
                      Pause
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.fullActionBtn,
                {
                  backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2',
                  borderWidth: 1,
                  borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : '#FECACA',
                },
              ]}
              onPress={() => handleToggle('out')}
              disabled={loadingAction !== null}
              activeOpacity={0.85}
            >
              {loadingAction === 'out' ? (
                <ActivityIndicator color={colors.error} size="small" />
              ) : (
                <View style={styles.buttonContent}>
                  <Ionicons
                    name="log-out-outline"
                    size={17}
                    color={colors.error}
                    style={styles.buttonIcon}
                  />
                  <Text style={[styles.primaryCheckOutText, { color: colors.error }]}>
                    Check Out
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.primaryCheckInButton,
              { backgroundColor: colors.primary },
            ]}
            onPress={() => handleToggle('in')}
            disabled={loadingAction !== null}
            activeOpacity={0.85}
          >
            {loadingAction === 'in' ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <View style={styles.buttonContent}>
                <Ionicons
                  name="log-in-outline"
                  size={18}
                  color="#FFFFFF"
                  style={styles.buttonIcon}
                />
                <Text style={styles.primaryCheckInText}>Check In</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
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
          <Text style={[styles.statNumber, { color: colors.textPrimary }]}>
            {todayHours}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Today
          </Text>
        </View>
        <View
          style={[
            styles.verticalDivider,
            { backgroundColor: isDark ? colors.inputBorder : '#E2E8F0' },
          ]}
        />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.textPrimary }]}>
            {weekHours}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            This Week
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
  cardPaused: {
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
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
  pausedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  greenDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  amberDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#F59E0B',
    marginRight: 6,
  },
  badgeText: {
    fontSize: 11.5,
    fontWeight: '700',
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
    paddingVertical: 6,
    marginBottom: 14,
  },
  sessionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '600',
  },
  sessionDuration: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: 0.5,
  },
  sessionActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 6,
  },
  actionButtonHalf: {
    flex: 1,
    borderRadius: 12,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseButton: {
    borderWidth: 1,
  },
  pauseButtonText: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  resumeButton: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  resumeButtonText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
  checkOutButtonHalf: {
    borderWidth: 1,
  },
  checkOutButtonText: {
    fontSize: 13.5,
    fontWeight: '700',
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
  fullActionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  fullActionBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryCheckInButton: {
    borderRadius: 12,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryCheckInText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
  },
  primaryCheckOutText: {
    fontSize: 14.5,
    fontWeight: '700',
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
