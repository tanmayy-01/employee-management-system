import { ViewStyle } from "react-native";

export interface User {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  role: string;
  department: string;
  avatarUrl?: string;
  phone?: string;
  location?: string;
  joinDate?: string;
}

export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  role: string;
  department: string;
  phone?: string;
  location?: string;
  joinDate?: string;
  avatarUrl?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface AuthSession {
  userId: string;
  email: string;
  name: string;
  employeeId: string;
  role: string;
  department: string;
  avatarUrl?: string;
  phone?: string;
  location?: string;
  joinDate?: string;
  idToken: string;
  refreshToken?: string;
  issuedAt: number;
  expiresAt: number;
  lastActiveAt: number;
  rememberMe: boolean;
  isActive: boolean;
}

export interface SignUpPayload {
  fullName: string;
  email: string;
  employeeId: string;
  password: string;
  department?: string;
  role?: string;
  phone?: string;
  location?: string;
}

export type ScreenName =
  | 'Splash'
  | 'Login'
  | 'ForgotPassword'
  | 'OtpVerification'
  | 'ResetPassword'
  | 'SignUp'
  | 'Home'
  | 'Dashboard'
  | 'Attendance'
  | 'AttendanceHistory'
  | 'Profile'
  | 'Settings'
  | 'Notifications'
  | 'EditProfile'
  | 'ChangePassword';

export interface AuthContextType {
  user: User | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  currentScreen: ScreenName;
  navigate: (screen: ScreenName) => void;
  goBack: () => void;
  canGoBack: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  signUp: (payload: SignUpPayload) => Promise<boolean>;
  sendPasswordReset: (email: string) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  updateUserProfile: (data: Partial<User>) => Promise<boolean>;
  reloadUserProfile: () => Promise<User | null>;
  logout: (reason?: string) => Promise<void>;
  refreshSessionToken: () => Promise<string | null>;
  checkSessionValidity: () => Promise<boolean>;
  clearAuthError: () => void;
}

export interface AttendanceLog {

  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  checkInTime: number;
  checkOutTime: number | null;
  durationSeconds: number;
  status: 'present' | 'half-day' | 'late' | 'in-progress' | 'completed';
  checkInLocation: string;
  checkOutLocation?: string;
  createdAt: number;
  updatedAt: number;
}

export interface AttendanceBreak {
  id: string;
  attendanceId: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  startTime: number;
  endTime: number | null;
  durationSeconds: number;
  createdAt: number;
  updatedAt: number;
}

export interface AttendanceStats {
  isCheckedIn: boolean;
  isPaused?: boolean;
  activeSession: AttendanceLog | null;
  activeBreak?: AttendanceBreak | null;
  todaySeconds: number;
  todayHoursFormatted: string;
  weekSeconds: number;
  weekHoursFormatted: string;
  remainingSeconds: number;
  remainingHoursFormatted: string;
  todaySessionsCount: number;
  todayBreakSeconds?: number;
  todayBreakHoursFormatted?: string;
  sessionWorkedSeconds?: number;
  lastCheckInFormatted?: string;
  lastCheckInLocation?: string;
}

export interface AppNotification {
  id: string;
  employeeId: string;
  title: string;
  description: string;
  time: string;
  timestamp: number;
  type: 'checkin' | 'checkout' | 'meeting' | 'summary' | 'alert' | 'break';
  isRead: boolean;
}
export type FilterType = 'monthly' | 'weekly' | 'today' | 'custom';

export type AttendanceStatus = 'present' | 'late' | 'half-day' | 'absent' | 'holiday';


export interface AttendanceRecord {
  id: string;
  date: string;
  rawDate?: string; // YYYY-MM-DD
  timestamp?: number;
  dayOfWeek?: string;
  status: string;
  statusType?: AttendanceStatus;
  timeRange: string;
  duration?: string;
  location: string;
  isHighlighted?: boolean;
}

export interface AttendanceGroup {
  id: string;
  sectionTitle: string;
  records: AttendanceRecord[];
  emptyState?: {
    title: string;
    description: string;
    showClearFilter?: boolean;
  };
}

export interface AttendanceHistoryProps {
  style?: ViewStyle;
  initialFilter?: FilterType;
  initialSearchQuery?: string;
  groups?: AttendanceGroup[];
  onRecordPress?: (record: AttendanceRecord) => void;
  onCustomRangePress?: () => void;
}

export interface DateRangeModalProps {
  visible: boolean;
  startDate: Date | null;
  endDate: Date | null;
  onClose: () => void;
  onApply: (startDate: Date, endDate: Date) => void;
  onReset?: () => void;
}
