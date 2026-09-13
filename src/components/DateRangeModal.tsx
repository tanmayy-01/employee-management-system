import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useTheme } from '../theme/ThemeContext';

export interface DateRangeModalProps {
  visible: boolean;
  startDate: Date | null;
  endDate: Date | null;
  onClose: () => void;
  onApply: (startDate: Date, endDate: Date) => void;
  onReset?: () => void;
}

const SHORT_MONTH_NAMES = [
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

const toDateString = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDateString = (str: string): Date => {
  const [year, month, day] = str.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
};

export const DateRangeModal: React.FC<DateRangeModalProps> = ({
  visible,
  startDate,
  endDate,
  onClose,
  onApply,
  onReset,
}) => {
  const { colors, isDark } = useTheme();

  const [startStr, setStartStr] = useState<string | null>(
    startDate ? toDateString(startDate) : null
  );
  const [endStr, setEndStr] = useState<string | null>(
    endDate ? toDateString(endDate) : null
  );

  useEffect(() => {
    if (visible) {
      setStartStr(startDate ? toDateString(startDate) : null);
      setEndStr(endDate ? toDateString(endDate) : null);
    }
  }, [visible, startDate, endDate]);

  const handleDayPress = (day: DateData) => {
    const selectedDate = day.dateString;

    if (!startStr || (startStr && endStr)) {
      // New selection starts
      setStartStr(selectedDate);
      setEndStr(null);
    } else if (startStr && !endStr) {
      if (selectedDate < startStr) {
        // Clicked date is earlier than start date, make it the new start
        setStartStr(selectedDate);
        setEndStr(null);
      } else {
        setEndStr(selectedDate);
      }
    }
  };

  // Quick Preset Selection
  const handlePresetSelect = (
    preset: 'last7' | 'last14' | 'thisMonth' | 'lastMonth'
  ) => {
    const today = new Date();

    if (preset === 'last7') {
      const past = new Date(today);
      past.setDate(past.getDate() - 6);
      setStartStr(toDateString(past));
      setEndStr(toDateString(today));
    } else if (preset === 'last14') {
      const past = new Date(today);
      past.setDate(past.getDate() - 13);
      setStartStr(toDateString(past));
      setEndStr(toDateString(today));
    } else if (preset === 'thisMonth') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      setStartStr(toDateString(firstDay));
      setEndStr(toDateString(today));
    } else if (preset === 'lastMonth') {
      const firstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth(), 0);
      setStartStr(toDateString(firstDay));
      setEndStr(toDateString(lastDay));
    }
  };

  // Build markedDates object for react-native-calendars period marking
  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};

    if (startStr && !endStr) {
      marks[startStr] = {
        startingDay: true,
        endingDay: true,
        color: colors.primary,
        textColor: '#FFFFFF',
      };
    } else if (startStr && endStr) {
      if (startStr === endStr) {
        marks[startStr] = {
          startingDay: true,
          endingDay: true,
          color: colors.primary,
          textColor: '#FFFFFF',
        };
      } else {
        const cur = parseDateString(startStr);
        const end = parseDateString(endStr);

        while (cur <= end) {
          const curString = toDateString(cur);
          const isStart = curString === startStr;
          const isEnd = curString === endStr;

          if (isStart) {
            marks[curString] = {
              startingDay: true,
              color: colors.primary,
              textColor: '#FFFFFF',
            };
          } else if (isEnd) {
            marks[curString] = {
              endingDay: true,
              color: colors.primary,
              textColor: '#FFFFFF',
            };
          } else {
            marks[curString] = {
              color: isDark
                ? 'rgba(59, 130, 246, 0.25)'
                : 'rgba(0, 74, 198, 0.12)',
              textColor: colors.primary,
            };
          }

          cur.setDate(cur.getDate() + 1);
        }
      }
    }

    return marks;
  }, [startStr, endStr, colors.primary, isDark]);

  const handleApply = () => {
    if (!startStr) return;
    const finalStart = parseDateString(startStr);
    finalStart.setHours(0, 0, 0, 0);

    const finalEnd = endStr ? parseDateString(endStr) : parseDateString(startStr);
    finalEnd.setHours(23, 59, 59, 999);

    onApply(finalStart, finalEnd);
    onClose();
  };

  const handleReset = () => {
    setStartStr(null);
    setEndStr(null);
    onReset?.();
    onClose();
  };

  const formatDisplayDate = (str: string | null): string => {
    if (!str) return 'Select Date';
    const d = parseDateString(str);
    return `${SHORT_MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor: colors.card,
              borderColor: isDark ? colors.cardBorder : '#E2E8F0',
            },
          ]}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.headerIconCircle,
                  {
                    backgroundColor: isDark
                      ? 'rgba(59, 130, 246, 0.15)'
                      : '#EBF2FF',
                  },
                ]}
              >
                <Ionicons
                  name="calendar"
                  size={18}
                  color={colors.primary}
                />
              </View>
              <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                Select Date Range
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.closeButton,
                { backgroundColor: isDark ? colors.inputBackground : '#F1F5F9' },
              ]}
              activeOpacity={0.7}
            >
              <Ionicons
                name="close"
                size={18}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Range Preview Card */}
          <View
            style={[
              styles.rangePreviewContainer,
              {
                backgroundColor: isDark ? colors.inputBackground : '#F8FAFC',
                borderColor: isDark ? colors.inputBorder : '#E2E8F0',
              },
            ]}
          >
            <View style={styles.rangePreviewCol}>
              <Text style={[styles.rangeLabel, { color: colors.textSecondary }]}>
                FROM
              </Text>
              <Text
                style={[
                  styles.rangeValueText,
                  {
                    color: startStr
                      ? colors.textPrimary
                      : isDark
                      ? colors.textTertiary
                      : '#94A3B8',
                  },
                ]}
              >
                {formatDisplayDate(startStr)}
              </Text>
            </View>

            <Ionicons
              name="arrow-forward"
              size={16}
              color={colors.primary}
              style={{ marginHorizontal: 8 }}
            />

            <View style={styles.rangePreviewCol}>
              <Text style={[styles.rangeLabel, { color: colors.textSecondary }]}>
                TO
              </Text>
              <Text
                style={[
                  styles.rangeValueText,
                  {
                    color: endStr
                      ? colors.textPrimary
                      : startStr
                      ? colors.textPrimary
                      : isDark
                      ? colors.textTertiary
                      : '#94A3B8',
                  },
                ]}
              >
                {endStr ? formatDisplayDate(endStr) : startStr ? formatDisplayDate(startStr) : 'Select Date'}
              </Text>
            </View>
          </View>

          {/* Quick Presets */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.presetsScrollView}
            contentContainerStyle={styles.presetsContainer}
          >
            <TouchableOpacity
              style={[
                styles.presetChip,
                {
                  backgroundColor: isDark ? colors.inputBackground : '#F1F5F9',
                  borderColor: isDark ? colors.inputBorder : '#E2E8F0',
                },
              ]}
              onPress={() => handlePresetSelect('last7')}
              activeOpacity={0.7}
            >
              <Text style={[styles.presetText, { color: colors.textPrimary }]}>
                Last 7 Days
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.presetChip,
                {
                  backgroundColor: isDark ? colors.inputBackground : '#F1F5F9',
                  borderColor: isDark ? colors.inputBorder : '#E2E8F0',
                },
              ]}
              onPress={() => handlePresetSelect('last14')}
              activeOpacity={0.7}
            >
              <Text style={[styles.presetText, { color: colors.textPrimary }]}>
                Last 14 Days
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.presetChip,
                {
                  backgroundColor: isDark ? colors.inputBackground : '#F1F5F9',
                  borderColor: isDark ? colors.inputBorder : '#E2E8F0',
                },
              ]}
              onPress={() => handlePresetSelect('thisMonth')}
              activeOpacity={0.7}
            >
              <Text style={[styles.presetText, { color: colors.textPrimary }]}>
                This Month
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.presetChip,
                {
                  backgroundColor: isDark ? colors.inputBackground : '#F1F5F9',
                  borderColor: isDark ? colors.inputBorder : '#E2E8F0',
                },
              ]}
              onPress={() => handlePresetSelect('lastMonth')}
              activeOpacity={0.7}
            >
              <Text style={[styles.presetText, { color: colors.textPrimary }]}>
                Last Month
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* react-native-calendars Calendar component with period marking */}
          <View
            style={[
              styles.calendarWrapper,
              {
                backgroundColor: isDark ? colors.card : '#FFFFFF',
                borderColor: isDark ? colors.cardBorder : '#F1F5F9',
              },
            ]}
          >
            <Calendar
              markingType={'period'}
              markedDates={markedDates}
              onDayPress={handleDayPress}
              enableSwipeMonths={true}
              theme={{
                backgroundColor: isDark ? colors.card : '#FFFFFF',
                calendarBackground: isDark ? colors.card : '#FFFFFF',
                textSectionTitleColor: isDark ? colors.textTertiary : '#94A3B8',
                selectedDayBackgroundColor: colors.primary,
                selectedDayTextColor: '#ffffff',
                todayTextColor: colors.primary,
                dayTextColor: colors.textPrimary,
                textDisabledColor: isDark ? '#475569' : '#CBD5E1',
                arrowColor: colors.primary,
                monthTextColor: colors.textPrimary,
                textDayFontWeight: '500',
                textMonthFontWeight: '700',
                textDayHeaderFontWeight: '600',
                textDayFontSize: 13,
                textMonthFontSize: 14.5,
                textDayHeaderFontSize: 11.5,
              }}
            />
          </View>

          {/* Action Buttons Footer */}
          <View style={styles.footerRow}>
            <TouchableOpacity
              style={[
                styles.resetButton,
                {
                  borderColor: isDark ? colors.cardBorder : '#E2E8F0',
                  backgroundColor: isDark ? colors.inputBackground : '#F8FAFC',
                },
              ]}
              onPress={handleReset}
              activeOpacity={0.7}
            >
              <Text style={[styles.resetText, { color: colors.textSecondary }]}>
                Clear
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.applyButton,
                {
                  backgroundColor: startStr
                    ? colors.primary
                    : isDark
                    ? colors.inputBackground
                    : '#CBD5E1',
                },
              ]}
              onPress={handleApply}
              disabled={!startStr}
              activeOpacity={0.7}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={18}
                color="#FFFFFF"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.applyText}>
                Apply Range
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 370,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rangePreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  rangePreviewCol: {
    flex: 1,
  },
  rangeLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  rangeValueText: {
    fontSize: 12,
    fontWeight: '700',
  },
  presetsScrollView: {
    marginBottom: 8,
  },
  presetsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  presetChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  presetText: {
    fontSize: 11,
    fontWeight: '600',
  },
  calendarWrapper: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 2,
  },
  resetButton: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetText: {
    fontSize: 13,
    fontWeight: '600',
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 12,
    shadowColor: '#004AC6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  applyText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});

export default DateRangeModal;
