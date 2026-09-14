import { TabItem } from "../components";
import { ScreenName } from "../types";

export const TABS: TabItem[] = [
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

export const DEFAULT_PREVIOUS_SCREEN: Record<ScreenName, ScreenName | null> = {
    Splash: null,
    Login: null,
    Home: null,
    Dashboard: null,
    SignUp: 'Login',
    ForgotPassword: 'Login',
    OtpVerification: 'ForgotPassword',
    ResetPassword: 'Login',
    Attendance: 'Dashboard',
    AttendanceHistory: 'Attendance',
    Profile: 'Dashboard',
    Settings: 'Dashboard',
    Notifications: 'Dashboard',
    EditProfile: 'Profile',
    ChangePassword: 'Settings',
};

// Check session validity interval: 1 minute
export const SESSION_CHECK_INTERVAL_MS = 60 * 1000;