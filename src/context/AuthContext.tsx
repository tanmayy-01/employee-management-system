import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, ScreenName, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER: User = {
  id: 'usr_101',
  name: 'Alex Rivera',
  email: 'alex.rivera@workpulse.io',
  employeeId: 'EMP-8492',
  role: 'Senior Software Engineer',
  department: 'Product & Engineering',
  avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
};

const DEFAULT_PREVIOUS_SCREEN: Record<ScreenName, ScreenName | null> = {
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

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('Splash');
  const [screenHistory, setScreenHistory] = useState<ScreenName[]>([]);

  const navigate = (screen: ScreenName) => {
    if (screen === currentScreen) return;
    if (screen === 'Login' || screen === 'Dashboard' || screen === 'Home' || screen === 'Splash') {
      setScreenHistory([]);
    } else {
      setScreenHistory(prev => [...prev, currentScreen]);
    }
    setCurrentScreen(screen);
  };

  const goBack = () => {
    if (screenHistory.length > 0) {
      const nextHistory = [...screenHistory];
      const prevScreen = nextHistory.pop();
      setScreenHistory(nextHistory);
      if (prevScreen) {
        setCurrentScreen(prevScreen);
        return;
      }
    }

    const fallback = DEFAULT_PREVIOUS_SCREEN[currentScreen];
    if (fallback) {
      setCurrentScreen(fallback);
    }
  };

  const canGoBack = screenHistory.length > 0 || DEFAULT_PREVIOUS_SCREEN[currentScreen] !== null;

  const login = async (email: string, _password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulate network authentication delay
      await new Promise<void>(resolve => setTimeout(() => resolve(), 800));

      // In real app, validate with backend API
      const loggedUser: User = {
        ...DEMO_USER,
        email: email || DEMO_USER.email,
      };

      setUser(loggedUser);
      setScreenHistory([]);
      setCurrentScreen('Dashboard');
      return true;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setScreenHistory([]);
    setCurrentScreen('Login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        currentScreen,
        navigate,
        goBack,
        canGoBack,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
