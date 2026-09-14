import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useTheme } from '../theme/ThemeContext';
import { DateRangeModal } from './DateRangeModal';
import { AttendanceGroup, AttendanceHistoryProps, AttendanceStatus, FilterType } from '../types';
import { filterOptions, SHORT_MONTHS } from '../constants/attendance.constants';




export const AttendanceHistory: React.FC<AttendanceHistoryProps> = ({
  style,
  initialFilter = 'monthly',
  initialSearchQuery = '',
  groups = [],
  onRecordPress,
  onCustomRangePress,
}) => {
  const { colors, isDark } = useTheme();
  const [activeFilter, setActiveFilter] = useState<FilterType>(initialFilter);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [isCalendarModalVisible, setIsCalendarModalVisible] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);



  const handleClearFilters = () => {
    setSearchQuery('');
    setCustomStartDate(null);
    setCustomEndDate(null);
    setActiveFilter('monthly');
  };

  const handleApplyCustomRange = (startDate: Date, endDate: Date) => {
    setCustomStartDate(startDate);
    setCustomEndDate(endDate);
    setActiveFilter('custom');
  };

  const handleResetCustomRange = () => {
    setCustomStartDate(null);
    setCustomEndDate(null);
    setActiveFilter('monthly');
  };

  const formatCustomPillLabel = (): string => {
    if (customStartDate && customEndDate) {
      const startStr = `${SHORT_MONTHS[customStartDate.getMonth()]} ${customStartDate.getDate()}`;
      const endStr = `${SHORT_MONTHS[customEndDate.getMonth()]} ${customEndDate.getDate()}`;
      return startStr === endStr ? startStr : `${startStr} - ${endStr}`;
    }
    return 'Custom Range';
  };

  // Filter records based on activeFilter, custom date range, and searchQuery
  const filteredGroups = useMemo(() => {
    const trimmedQuery = searchQuery.trim().toLowerCase();
    const now = new Date();
    const todayYear = now.getFullYear();
    const todayMonth = String(now.getMonth() + 1).padStart(2, '0');
    const todayDay = String(now.getDate()).padStart(2, '0');
    const todayYMD = `${todayYear}-${todayMonth}-${todayDay}`;

    // Start of week (Monday 00:00:00)
    const day = now.getDay();
    const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.getFullYear(), now.getMonth(), diffToMonday, 0, 0, 0, 0);
    const startOfWeekMs = monday.getTime();

    // Start of current month (1st 00:00:00)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const startOfMonthMs = startOfMonth.getTime();

    // Custom date range timestamps
    const customStartMs = customStartDate
      ? new Date(
        customStartDate.getFullYear(),
        customStartDate.getMonth(),
        customStartDate.getDate(),
        0,
        0,
        0,
        0
      ).getTime()
      : null;

    const customEndMs = customEndDate
      ? new Date(
        customEndDate.getFullYear(),
        customEndDate.getMonth(),
        customEndDate.getDate(),
        23,
        59,
        59,
        999
      ).getTime()
      : null;

    const result = groups
      .map((group) => {
        // Filter records inside group
        const matchedRecords = group.records.filter((record) => {
          // 1. Filter by Active Tab
          if (activeFilter === 'today') {
            if (record.rawDate) {
              if (record.rawDate !== todayYMD) return false;
            } else if (record.timestamp) {
              const recDate = new Date(record.timestamp);
              if (
                recDate.getFullYear() !== now.getFullYear() ||
                recDate.getMonth() !== now.getMonth() ||
                recDate.getDate() !== now.getDate()
              ) {
                return false;
              }
            } else {
              const todayStr = `${SHORT_MONTHS[now.getMonth()]} ${now.getDate()}`;
              if (!record.date.includes(todayStr)) return false;
            }
          } else if (activeFilter === 'weekly') {
            if (record.timestamp && record.timestamp < startOfWeekMs) {
              return false;
            }
          } else if (activeFilter === 'monthly') {
            // Keep monthly groups intact
          } else if (activeFilter === 'custom') {
            if (customStartMs && customEndMs) {
              if (record.timestamp) {
                if (record.timestamp < customStartMs || record.timestamp > customEndMs) {
                  return false;
                }
              } else if (record.rawDate) {
                const recTime = new Date(record.rawDate + 'T12:00:00').getTime();
                if (recTime < customStartMs || recTime > customEndMs) {
                  return false;
                }
              }
            }
          }

          // 2. Filter by search query
          if (!trimmedQuery) return true;
          return (
            record.date.toLowerCase().includes(trimmedQuery) ||
            record.location.toLowerCase().includes(trimmedQuery) ||
            record.timeRange.toLowerCase().includes(trimmedQuery) ||
            record.status.toLowerCase().includes(trimmedQuery)
          );
        });

        // If no records match in this group, do not render empty group container
        if (matchedRecords.length === 0) {
          return null;
        }

        return {
          ...group,
          records: matchedRecords,
        };
      })
      .filter((g): g is AttendanceGroup => g !== null);

    // If no records found after filtering, show helpful contextual empty state
    if (result.length === 0) {
      let emptyTitle = 'No records found';
      let emptyDesc = 'You have no attendance logs for this selected time period.';

      if (activeFilter === 'today') {
        emptyTitle = 'No attendance logs today';
        emptyDesc = 'You have not checked in today yet.';
      } else if (activeFilter === 'weekly') {
        emptyTitle = 'No records this week';
        emptyDesc = 'No attendance logs recorded for this week yet.';
      } else if (activeFilter === 'custom') {
        const rangeText = formatCustomPillLabel();
        emptyTitle = 'No records in date range';
        emptyDesc = `No attendance logs found for ${rangeText}.`;
      } else if (trimmedQuery) {
        emptyTitle = 'No results found';
        emptyDesc = `No attendance logs matched "${searchQuery}".`;
      }

      return [
        {
          id: 'filtered_empty',
          sectionTitle:
            activeFilter === 'today'
              ? 'Today'
              : activeFilter === 'weekly'
                ? 'This Week'
                : activeFilter === 'custom'
                  ? formatCustomPillLabel()
                  : 'Attendance Records',
          records: [],
          emptyState: {
            title: emptyTitle,
            description: emptyDesc,
            showClearFilter:
              activeFilter !== 'monthly' || trimmedQuery.length > 0,
          },
        },
      ];
    }

    return result;
  }, [groups, searchQuery, activeFilter, customStartDate, customEndDate]);

  const getStatusBadgeStyle = (statusType?: AttendanceStatus) => {
    switch (statusType) {
      case 'late':
        return {
          bg: isDark ? 'rgba(234, 179, 8, 0.15)' : '#FEF3C7',
          text: isDark ? '#FBBF24' : '#D97706',
        };
      case 'absent':
        return {
          bg: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2',
          text: isDark ? '#F87171' : '#DC2626',
        };
      case 'half-day':
        return {
          bg: isDark ? 'rgba(59, 130, 246, 0.15)' : '#DBEAFE',
          text: isDark ? '#60A5FA' : '#2563EB',
        };
      case 'present':
      default:
        return {
          bg: isDark ? 'rgba(34, 197, 94, 0.15)' : '#DCFCE7',
          text: isDark ? '#4ADE80' : '#15803D',
        };
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* Search Bar */}
      <View
        style={[
          styles.searchContainer,
          {
            backgroundColor: isDark ? colors.card : '#FFFFFF',
            borderColor: isDark ? colors.inputBorder : '#E2E8F0',
          },
        ]}
      >
        <Ionicons
          name="search-outline"
          size={18}
          color={isDark ? colors.textTertiary : '#94A3B8'}
          style={styles.searchIcon}
        />
        <TextInput
          style={[
            styles.searchInput,
            {
              color: colors.textPrimary,
            },
          ]}
          placeholder="Search by date (e.g., Sep 13) or location..."
          placeholderTextColor={isDark ? colors.textTertiary : '#9CA3AF'}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="close-circle"
              size={18}
              color={isDark ? colors.textTertiary : '#94A3B8'}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs / Pills */}
      <View style={styles.filterPillsContainer}>
        <View style={styles.filterRowPrimary}>
          {filterOptions.map((filter) => {
            const isActive = activeFilter === filter.key;
            return (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterPill,
                  isActive
                    ? [styles.filterPillActive, { backgroundColor: colors.primary }]
                    : [
                      styles.filterPillInactive,
                      {
                        backgroundColor: isDark ? colors.card : '#F1F5F9',
                        borderColor: isDark ? colors.cardBorder : '#E2E8F0',
                      },
                    ],
                ]}
                onPress={() => {
                  setActiveFilter(filter.key);
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    isActive
                      ? styles.filterPillTextActive
                      : [
                        styles.filterPillTextInactive,
                        { color: isDark ? colors.textSecondary : '#475569' },
                      ],
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Custom Range Pill with interactive Calendar Modal trigger */}
        <TouchableOpacity
          style={[
            styles.filterPill,
            styles.customRangePill,
            activeFilter === 'custom'
              ? [styles.filterPillActive, { backgroundColor: colors.primary }]
              : [
                styles.filterPillInactive,
                {
                  backgroundColor: isDark ? colors.card : '#F1F5F9',
                  borderColor: isDark ? colors.cardBorder : '#E2E8F0',
                },
              ],
          ]}
          onPress={() => {
            setIsCalendarModalVisible(true);
            onCustomRangePress?.();
          }}
          activeOpacity={0.7}
        >
          <Ionicons
            name="calendar-outline"
            size={14}
            color={
              activeFilter === 'custom'
                ? '#FFFFFF'
                : isDark
                  ? colors.textSecondary
                  : '#475569'
            }
            style={styles.customRangeIconLeft}
          />
          <Text
            style={[
              styles.filterPillText,
              activeFilter === 'custom'
                ? styles.filterPillTextActive
                : [
                  styles.filterPillTextInactive,
                  { color: isDark ? colors.textSecondary : '#475569' },
                ],
            ]}
          >
            {formatCustomPillLabel()}
          </Text>

          {activeFilter === 'custom' && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                handleResetCustomRange();
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.customRangeClose}
            >
              <Ionicons name="close-circle" size={15} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </View>

      {/* Timeline Attendance List */}
      <View style={styles.timelineListContainer}>
        {filteredGroups.map((group, groupIdx) => {
          const isFirstGroup = groupIdx === 0;

          return (
            <View key={group.id} style={styles.groupContainer}>
              {/* Section Header */}
              <Text
                style={[
                  styles.sectionTitle,
                  { color: isDark ? colors.textSecondary : '#334155' },
                ]}
              >
                {group.sectionTitle}
              </Text>

              {/* Records within group */}
              {group.records.map((record, recIdx) => {
                const badgeStyle = getStatusBadgeStyle(record.statusType);
                const isFirstRecordOverall = isFirstGroup && recIdx === 0;
                const isRecordHighlighted =
                  record.isHighlighted ?? isFirstRecordOverall;

                return (
                  <View key={record.id} style={styles.timelineRow}>
                    {/* Timeline Left Track & Dot */}
                    <View style={styles.timelineLeftColumn}>
                      <View
                        style={[
                          styles.timelineLine,
                          {
                            backgroundColor: isDark
                              ? colors.inputBorder
                              : '#E2E8F0',
                          },
                        ]}
                      />
                      <View
                        style={[
                          styles.timelineDot,
                          isRecordHighlighted
                            ? [
                              styles.timelineDotActive,
                              { backgroundColor: colors.primary },
                            ]
                            : [
                              styles.timelineDotInactive,
                              {
                                backgroundColor: isDark
                                  ? colors.inputBorder
                                  : '#CBD5E1',
                              },
                            ],
                        ]}
                      />
                    </View>

                    {/* Attendance Record Card */}
                    <TouchableOpacity
                      style={[
                        styles.recordCard,
                        {
                          backgroundColor: colors.card,
                          borderColor: isDark ? colors.cardBorder : '#F1F5F9',
                          shadowColor: colors.shadowColor,
                        },
                      ]}
                      activeOpacity={onRecordPress ? 0.7 : 1}
                      onPress={() => onRecordPress?.(record)}
                    >
                      {/* Top Row: Date & Status Badge */}
                      <View style={styles.cardHeaderRow}>
                        <Text
                          style={[
                            styles.recordDateText,
                            { color: colors.textPrimary },
                          ]}
                        >
                          {record.date}
                        </Text>
                        <View
                          style={[
                            styles.statusBadge,
                            { backgroundColor: badgeStyle.bg },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusBadgeText,
                              { color: badgeStyle.text },
                            ]}
                          >
                            {record.status}
                          </Text>
                        </View>
                      </View>

                      {/* Time Range Row */}
                      <View style={styles.cardDetailRow}>
                        <Ionicons
                          name="time-outline"
                          size={14}
                          color={isDark ? colors.textTertiary : '#64748B'}
                          style={styles.detailIcon}
                        />
                        <Text
                          style={[
                            styles.detailText,
                            {
                              color: isDark
                                ? colors.textSecondary
                                : '#475569',
                            },
                          ]}
                        >
                          {record.timeRange}
                        </Text>
                      </View>

                      {/* Location Row */}
                      <View style={styles.cardDetailRow}>
                        <Ionicons
                          name="location-outline"
                          size={14}
                          color={isDark ? colors.textTertiary : '#64748B'}
                          style={styles.detailIcon}
                        />
                        <Text
                          style={[
                            styles.detailText,
                            {
                              color: isDark
                                ? colors.textSecondary
                                : '#475569',
                            },
                          ]}
                        >
                          {record.location}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              })}

              {/* Group Empty State */}
              {group.records.length === 0 && group.emptyState && (
                <View style={styles.timelineRow}>
                  {/* Timeline Left Track & Dot */}
                  <View style={styles.timelineLeftColumn}>
                    <View
                      style={[
                        styles.timelineLine,
                        {
                          backgroundColor: isDark
                            ? colors.inputBorder
                            : '#E2E8F0',
                        },
                      ]}
                    />
                    <View
                      style={[
                        styles.timelineDot,
                        styles.timelineDotInactive,
                        {
                          backgroundColor: isDark
                            ? colors.inputBorder
                            : '#E2E8F0',
                        },
                      ]}
                    />
                  </View>

                  {/* Dashed Empty Card */}
                  <View
                    style={[
                      styles.emptyStateCard,
                      {
                        backgroundColor: colors.card,
                        borderColor: isDark ? colors.cardBorder : '#CBD5E1',
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.emptyIconCircle,
                        {
                          backgroundColor: isDark
                            ? 'rgba(59, 130, 246, 0.1)'
                            : '#EEF2F6',
                        },
                      ]}
                    >
                      <Ionicons
                        name="calendar-outline"
                        size={22}
                        color={isDark ? colors.primary : '#64748B'}
                      />
                    </View>

                    <Text
                      style={[
                        styles.emptyStateTitle,
                        { color: colors.textPrimary },
                      ]}
                    >
                      {group.emptyState.title}
                    </Text>

                    <Text
                      style={[
                        styles.emptyStateDescription,
                        { color: isDark ? colors.textSecondary : '#64748B' },
                      ]}
                    >
                      {group.emptyState.description}
                    </Text>

                    <View style={styles.emptyActionsRow}>
                      {activeFilter === 'custom' && (
                        <TouchableOpacity
                          onPress={() => setIsCalendarModalVisible(true)}
                          style={[
                            styles.changeRangeButton,
                            { backgroundColor: colors.primary },
                          ]}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name="calendar"
                            size={14}
                            color="#FFFFFF"
                            style={{ marginRight: 5 }}
                          />
                          <Text style={styles.changeRangeText}>
                            Change Range
                          </Text>
                        </TouchableOpacity>
                      )}

                      {group.emptyState.showClearFilter && (
                        <TouchableOpacity
                          onPress={handleClearFilters}
                          style={styles.clearFilterButton}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.clearFilterText,
                              { color: colors.primary },
                            ]}
                          >
                            Clear Filters
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* Date Range Calendar Modal */}
      <DateRangeModal
        visible={isCalendarModalVisible}
        startDate={customStartDate}
        endDate={customEndDate}
        onClose={() => setIsCalendarModalVisible(false)}
        onApply={handleApplyCustomRange}
        onReset={handleResetCustomRange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 14,
    shadowColor: '#1A2A4E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 0,
  },
  filterPillsContainer: {
    marginBottom: 20,
    gap: 8,
  },
  filterRowPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterPillActive: {
    backgroundColor: '#004AC6',
  },
  filterPillInactive: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterPillText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  filterPillTextInactive: {
    color: '#475569',
  },
  customRangePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  customRangeIconLeft: {
    marginRight: 6,
  },
  customRangeClose: {
    marginLeft: 6,
  },
  timelineListContainer: {
    position: 'relative',
  },
  groupContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    marginBottom: 14,
    marginLeft: 32,
    letterSpacing: -0.2,
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 12,
    position: 'relative',
  },
  timelineLeftColumn: {
    width: 24,
    alignItems: 'center',
    marginRight: 8,
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    top: -14,
    bottom: -14,
    width: 2,
    backgroundColor: '#E2E8F0',
    left: 11,
  },
  timelineDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    marginTop: 18,
    zIndex: 2,
  },
  timelineDotActive: {
    backgroundColor: '#1D61F2',
  },
  timelineDotInactive: {
    backgroundColor: '#CBD5E1',
  },
  recordCard: {
    flex: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#1A2A4E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1.5,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recordDateText: {
    fontSize: 14.5,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  detailIcon: {
    marginRight: 6,
  },
  detailText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyStateCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEF2F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyStateTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptyStateDescription: {
    fontSize: 12.5,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 12,
    maxWidth: 240,
  },
  emptyActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  changeRangeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  changeRangeText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  clearFilterButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  clearFilterText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
});

export default AttendanceHistory;
