import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import {
  getAuth,
  onAuthStateChanged,
  onIdTokenChanged,
  getIdTokenResult,
  User as FirebaseUser,
} from '@react-native-firebase/auth';
import { User, AuthSession, ScreenName, AuthContextType, SignUpPayload } from '../types';
import { databaseService } from '../services/database.service';
import { firebaseAuthService } from '../services/firebaseAuth.service';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

// Check session validity interval: 1 minute
const SESSION_CHECK_INTERVAL_MS = 60 * 1000;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('Splash');
  const [screenHistory, setScreenHistory] = useState<ScreenName[]>([]);

  const sessionCheckTimerRef = useRef<any>(null);

  const navigate = (screen: ScreenName) => {
    if (screen === currentScreen) return;
    if (screen === 'Login' || screen === 'Dashboard' || screen === 'Home' || screen === 'Splash') {
      setScreenHistory([]);
    } else {
      setScreenHistory((prev) => [...prev, currentScreen]);
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

  const clearAuthError = () => {
    setAuthError(null);
  };

  /**
   * Log out user, clear SQLite session, and reset auth state
   */
  const logout = useCallback(async (reason?: string) => {
    setIsLoading(true);
    try {
      await firebaseAuthService.signOut();
      setUser(null);
      setSession(null);
      setScreenHistory([]);
      if (reason) {
        setAuthError(reason);
      }
      setCurrentScreen('Login');
    } catch (error) {
      console.warn('Logout error:', error);
      setUser(null);
      setSession(null);
      setCurrentScreen('Login');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Refresh ID Token and update SQLite & React state
   */
  const refreshSessionToken = useCallback(async (): Promise<string | null> => {
    if (!session) return null;

    try {
      const newToken = await firebaseAuthService.refreshSessionToken(session.userId);
      if (newToken) {
        const updated = await databaseService.getActiveAuthSession();
        if (updated) {
          setSession(updated);
        }
        return newToken;
      }
      return null;
    } catch (error) {
      console.warn('Failed to refresh session token:', error);
      return null;
    }
  }, [session]);

  /**
   * Periodic Session Expiry and Token Refresh Check
   */
  const checkSessionValidity = useCallback(async (): Promise<boolean> => {
    const activeSession = await databaseService.getActiveAuthSession();
    if (!activeSession) {
      if (user) {
        await logout('Your session has ended. Please sign in again.');
      }
      return false;
    }

    const status = firebaseAuthService.checkSessionExpiry(activeSession);

    if (!status.isValid) {
      if (status.reason === 'INACTIVE') {
        await logout('Session timed out due to inactivity. Please sign in again.');
      } else {
        await logout('Your session has expired. Please sign in again.');
      }
      return false;
    }

    // Proactively refresh token if close to expiry
    if (status.needsRefresh) {
      await refreshSessionToken();
    }

    // Update last active timestamp
    await databaseService.updateLastActiveTime(activeSession.userId);
    return true;
  }, [user, logout, refreshSessionToken]);

  /**
   * Initial Auto-Login Flow on App Launch
   */
  const initializeAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      await databaseService.initDatabase();
      const cachedSession = await databaseService.getActiveAuthSession();

      if (cachedSession && cachedSession.isActive) {
        const sessionStatus = firebaseAuthService.checkSessionExpiry(cachedSession);

        if (sessionStatus.isValid) {
          const restoredUser: User = {
            id: cachedSession.userId,
            name: cachedSession.name,
            email: cachedSession.email,
            employeeId: cachedSession.employeeId,
            role: cachedSession.role,
            department: cachedSession.department,
            avatarUrl: cachedSession.avatarUrl,
          };

          setUser(restoredUser);
          setSession(cachedSession);

          // Update last active time in SQLite
          await databaseService.updateLastActiveTime(cachedSession.userId);

          // Refresh token if nearing expiration
          if (sessionStatus.needsRefresh) {
            firebaseAuthService.refreshSessionToken(cachedSession.userId).catch(() => {});
          }

          setIsLoading(false);
          return;
        } else {
          // Cached session is expired -> clean it up
          await databaseService.clearActiveAuthSession();
        }
      }

      // Check current Firebase User if available
      const currentFbUser = firebaseAuthService.getCurrentUser();
      if (currentFbUser) {
        try {
          const tokenResult = await getIdTokenResult(currentFbUser, true);
          const now = Date.now();
          const expiresAt = tokenResult.expirationTime
            ? new Date(tokenResult.expirationTime).getTime()
            : now + 3600 * 1000;

          const restoredUser: User = {
            id: currentFbUser.uid,
            name: currentFbUser.displayName || currentFbUser.email?.split('@')[0] || 'Employee',
            email: currentFbUser.email || '',
            employeeId: 'EMP-' + currentFbUser.uid.substring(0, 4).toUpperCase(),
            role: 'Employee',
            department: 'General',
            avatarUrl: currentFbUser.photoURL || undefined,
          };

          const newSession: AuthSession = {
            userId: restoredUser.id,
            email: restoredUser.email,
            name: restoredUser.name,
            employeeId: restoredUser.employeeId,
            role: restoredUser.role,
            department: restoredUser.department,
            avatarUrl: restoredUser.avatarUrl,
            idToken: tokenResult.token,
            issuedAt: now,
            expiresAt,
            lastActiveAt: now,
            rememberMe: true,
            isActive: true,
          };

          await databaseService.saveAuthSession(newSession);
          setUser(restoredUser);
          setSession(newSession);
          setIsLoading(false);
          return;
        } catch (e) {
          console.warn('Failed to restore current Firebase user:', e);
        }
      }

      setUser(null);
      setSession(null);
    } catch (error) {
      console.warn('Auth initialization error:', error);
      setUser(null);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Run initialization on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Set up Firebase Auth state listener and Token listener
  useEffect(() => {
    let unsubscribeAuth: (() => void) | undefined;
    let unsubscribeToken: (() => void) | undefined;

    try {
      const authInstance = getAuth();
      if (authInstance) {
        unsubscribeAuth = onAuthStateChanged(authInstance, async (fbUser: FirebaseUser | null) => {
          // If Firebase confirms there is no user and we had an active Firebase session, clear it
          if (!fbUser) {
            const activeSession = await databaseService.getActiveAuthSession();
            if (activeSession && activeSession.idToken) {
              setUser(null);
              setSession(null);
              await databaseService.clearActiveAuthSession();
            }
          }
        });

        unsubscribeToken = onIdTokenChanged(authInstance, async (fbUser: FirebaseUser | null) => {
          if (fbUser) {
            const tokenResult = await getIdTokenResult(fbUser);
            const expiresAt = tokenResult.expirationTime
              ? new Date(tokenResult.expirationTime).getTime()
              : Date.now() + 3600 * 1000;
            await databaseService.updateSessionToken(fbUser.uid, tokenResult.token, expiresAt);
          }
        });
      }
    } catch (e) {
      console.warn('Firebase listener attachment notice:', e);
    }

    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
      if (unsubscribeToken) unsubscribeToken();
    };
  }, []);

  // Setup periodic session check timer
  useEffect(() => {
    if (user && session) {
      sessionCheckTimerRef.current = setInterval(() => {
        checkSessionValidity();
      }, SESSION_CHECK_INTERVAL_MS);
    }

    return () => {
      if (sessionCheckTimerRef.current) {
        clearInterval(sessionCheckTimerRef.current);
      }
    };
  }, [user, session, checkSessionValidity]);

  /**
   * Sign in with Email and Password
   */
  const login = async (
    email: string,
    pass: string,
    rememberMe = false
  ): Promise<boolean> => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const { user: authUser, session: authSession } = await firebaseAuthService.signIn(
        email,
        pass,
        rememberMe
      );

      setUser(authUser);
      setSession(authSession);
      setScreenHistory([]);
      setCurrentScreen('Dashboard');
      return true;
    } catch (firebaseError: any) {
      const errorMsg = firebaseError.message || 'Login failed. Please verify your credentials.';
      setAuthError(errorMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Register new user account
   */
  const signUp = async (payload: SignUpPayload): Promise<boolean> => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const { user: authUser, session: authSession } = await firebaseAuthService.signUp(payload);
      setUser(authUser);
      setSession(authSession);
      setScreenHistory([]);
      return true;
    } catch (error: any) {
      const errorMsg = error.message || 'Registration failed. Please try again.';
      setAuthError(errorMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Send Password Reset
   */
  const sendPasswordReset = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    setAuthError(null);

    try {
      await firebaseAuthService.sendPasswordReset(email);
      return true;
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to send password reset email.';
      setAuthError(errorMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Change Password for current authenticated user
   */
  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    setIsLoading(true);
    setAuthError(null);

    try {
      await firebaseAuthService.changePassword(currentPassword, newPassword);
      return true;
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to change password.';
      setAuthError(errorMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!user && !!session?.isActive,
        isLoading,
        authError,
        currentScreen,
        navigate,
        goBack,
        canGoBack,
        login,
        signUp,
        sendPasswordReset,
        changePassword,
        logout,
        refreshSessionToken,
        checkSessionValidity,
        clearAuthError,
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

export default AuthProvider;
