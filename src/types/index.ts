export interface User {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  role: string;
  department: string;
  avatarUrl?: string;
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
  isAuthenticated: boolean;
  isLoading: boolean;
  currentScreen: ScreenName;
  navigate: (screen: ScreenName) => void;
  goBack: () => void;
  canGoBack: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

