import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import { ScreenName } from '../types';

export interface TabItem {
  key: ScreenName;
  label: string;
  iconName: string;
  activeIconName: string;
}

const TABS: TabItem[] = [
  {
    key: 'Dashboard',
    label: 'Dashboard',
    iconName: 'grid-outline',
    activeIconName: 'grid',
  },
  {
    key: 'Attendance',
    label: 'Attendance',
    iconName: 'calendar-outline',
    activeIconName: 'calendar',
  },
  {
    key: 'Profile',
    label: 'Profile',
    iconName: 'person-outline',
    activeIconName: 'person',
  },
  {
    key: 'Settings',
    label: 'Settings',
    iconName: 'settings-outline',
    activeIconName: 'settings',
  },
];

interface BottomTabBarProps {
  activeTab?: ScreenName;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ activeTab = 'Dashboard' }) => {
  const { currentScreen, navigate } = useAuth();
  const { colors, isDark } = useTheme();
  const current = activeTab || currentScreen;

  return (
    <View
      style={[
        styles.tabContainer,
        {
          backgroundColor: isDark ? colors.card : '#FFFFFF',
          borderTopColor: isDark ? colors.cardBorder : 'rgba(226, 232, 240, 0.8)',
        },
      ]}
    >
      {TABS.map((tab) => {
        const isActive = current === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabButton,
              isActive && [styles.activeTabButton, { backgroundColor: colors.primary }],
            ]}
            onPress={() => navigate(tab.key)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={(isActive ? tab.activeIconName : tab.iconName) as any}
              size={20}
              color={isActive ? '#FFFFFF' : isDark ? colors.textSecondary : '#64748B'}
              style={styles.tabIcon}
            />
            <Text
              style={[
                styles.tabLabel,
                { color: isDark ? colors.textSecondary : '#64748B' },
                isActive && styles.activeTabLabel,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    borderTopWidth: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#1A2A4E',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 8,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: '#004AC6',
  },
  tabIcon: {
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 10.5,
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default BottomTabBar;
