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

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('Splash');

  const navigate = (screen: ScreenName) => {
    setCurrentScreen(screen);
  };

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
