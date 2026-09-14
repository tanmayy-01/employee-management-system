import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated, BackHandler, ToastAndroid, Platform } from 'react-native';
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
  NotificationsScreen,
  ProfileScreen,
  EditProfileScreen,
  AttendanceScreen,
  AttendanceHistoryScreen,
  ChangePasswordScreen,
} from '../screens';


export const RootNavigator: React.FC = () => {
  const { currentScreen, navigate, goBack, isAuthenticated } = useAuth();
  const { colors } = useTheme();
  const screenFadeAnim = useRef(new Animated.Value(1)).current;
  const lastBackPressTime = useRef<number>(0);


  useEffect(() => {
    screenFadeAnim.setValue(0.4);
    Animated.timing(screenFadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [currentScreen, screenFadeAnim]);

  useEffect(() => {
    const handleHardwareBackPress = () => {
      if (currentScreen === 'Splash') {
        return true;
      }


      if (currentScreen === 'Login' || currentScreen === 'Dashboard' || currentScreen === 'Home') {
        const now = Date.now();
        if (now - lastBackPressTime.current < 2000) {
          BackHandler.exitApp();
          return true;
        }
        lastBackPressTime.current = now;
        if (Platform.OS === 'android') {
          ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
        }
        return true;
      }
      goBack();
      return true;
    };

    const backSubscription = BackHandler.addEventListener(
      'hardwareBackPress',
      handleHardwareBackPress
    );

    return () => {
      backSubscription.remove();
    };
  }, [currentScreen, goBack]);

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'Splash':
        return (
          <SplashScreen
            onFinish={() => navigate(isAuthenticated ? 'Dashboard' : 'Login')}
            duration={2200}
          />
        );
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
      case 'Attendance':
        return <AttendanceScreen />;
      case 'AttendanceHistory':
        return <AttendanceHistoryScreen />;
      case 'Profile':
        return <ProfileScreen />;
      case 'EditProfile':
        return <EditProfileScreen />;
      case 'Settings':
        return <SettingsScreen />;
      case 'Notifications':
        return <NotificationsScreen />;
      case 'ChangePassword':
        return <ChangePasswordScreen />;
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
