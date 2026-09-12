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
