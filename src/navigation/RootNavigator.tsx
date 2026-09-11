import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import {
  SplashScreen,
  LoginScreen,
  ForgotPasswordScreen,
  OtpVerificationScreen,
  ResetPasswordScreen,
  SignUpScreen,
  DashboardScreen,
  SettingsScreen,
} from '../screens';

export const RootNavigator: React.FC = () => {
  const { currentScreen, navigate } = useAuth();
  const { colors } = useTheme();
  const screenFadeAnim = useRef(new Animated.Value(1)).current;

  // Fade transition on screen change
  useEffect(() => {
    screenFadeAnim.setValue(0.4);
    Animated.timing(screenFadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [currentScreen, screenFadeAnim]);

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'Splash':
        return <SplashScreen onFinish={() => navigate('Login')} duration={2500} />;
      case 'Login':
        return <LoginScreen />;
      case 'ForgotPassword':
        return <ForgotPasswordScreen />;
      case 'OtpVerification':
        return <OtpVerificationScreen />;
      case 'ResetPassword':
        return <ResetPasswordScreen />;
      case 'SignUp':
        return <SignUpScreen />;
      case 'Dashboard':
      case 'Home':
        return <DashboardScreen />;
      case 'Settings':
        return <SettingsScreen />;
      default:
        return <LoginScreen />;
    }
  };

  return (
    <Animated.View style={[styles.container, { backgroundColor: colors.background, opacity: screenFadeAnim }]}>
      {renderCurrentScreen()}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default RootNavigator;
