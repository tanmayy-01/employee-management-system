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
  | 'Profile'
  | 'Settings'
  | 'Notifications';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  currentScreen: ScreenName;
  navigate: (screen: ScreenName) => void;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}
