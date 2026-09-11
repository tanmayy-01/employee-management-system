import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StatusBar,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { styles } from './Splash.styles';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive element dimensions based on screen proportions
export const ILLUSTRATION_WIDTH = Math.min(SCREEN_WIDTH * 0.67, 300);
export const ILLUSTRATION_HEIGHT = ILLUSTRATION_WIDTH * (286 / 512);

export const LOGO_WIDTH = Math.min(SCREEN_WIDTH * 0.48, 210);
export const LOGO_HEIGHT = LOGO_WIDTH * (147 / 184);

export const SPACING_ILLUSTRATION_TO_LOGO = Math.round(SCREEN_HEIGHT * 0.088);
export const SPACING_LOGO_TO_DOTS = Math.round(SCREEN_HEIGHT * 0.075);

interface SplashScreenProps {
  onFinish?: () => void;
  duration?: number;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish, duration = 2500 }) => {
  const { colors, isDark } = useTheme();
  const dot1Anim = useRef(new Animated.Value(0.3)).current;
  const dot2Anim = useRef(new Animated.Value(0.3)).current;
  const dot3Anim = useRef(new Animated.Value(0.3)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (Platform.OS === 'android') {
      (StatusBar as any).setBackgroundColor?.(isDark ? colors.background : '#FAF8FF', true);
      (StatusBar as any).setTranslucent?.(true);
    }
  }, [isDark, colors.background]);

  useEffect(() => {
    if (onFinish) {
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }).start(() => {
          onFinish();
        });
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [onFinish, duration, fadeAnim]);

  useEffect(() => {
    const createDotAnimation = (animValue: Animated.Value, delay: number) => {
      return Animated.sequence([
        Animated.delay(delay),
        Animated.loop(
          Animated.sequence([
            Animated.timing(animValue, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(animValue, {
              toValue: 0.3,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.delay(200),
          ])
        ),
      ]);
    };

    const pulseAnimation = Animated.parallel([
      createDotAnimation(dot1Anim, 0),
      createDotAnimation(dot2Anim, 200),
      createDotAnimation(dot3Anim, 400),
    ]);

    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, [dot1Anim, dot2Anim, dot3Anim]);

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: isDark ? colors.background : '#FAF8FF' }]}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <Animated.View
        style={[
          styles.container,
          { backgroundColor: isDark ? colors.background : '#FAF8FF', opacity: fadeAnim },
        ]}
      >
        {/* Top Section: Team Illustration */}
        <Image
          source={require('../../assets/splash-image-1.jpg')}
          style={styles.illustration}
          resizeMode="contain"
        />

        {/* Middle Section: App Brand Logo & Tagline */}
        <Image
          source={require('../../../assets/splash-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Bottom Section: Loading Dots & Status Text */}
        <View style={styles.loadingContainer}>
          <View style={styles.dotsRow}>
            <Animated.View
              style={[
                styles.dot,
                {
                  backgroundColor: colors.primary,
                  opacity: dot1Anim,
                  transform: [
                    {
                      scale: dot1Anim.interpolate({
                        inputRange: [0.3, 1],
                        outputRange: [0.85, 1.15],
                      }),
                    },
                  ],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.dot,
                {
                  backgroundColor: colors.primary,
                  opacity: dot2Anim,
                  transform: [
                    {
                      scale: dot2Anim.interpolate({
                        inputRange: [0.3, 1],
                        outputRange: [0.85, 1.15],
                      }),
                    },
                  ],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.dot,
                {
                  backgroundColor: colors.primary,
                  opacity: dot3Anim,
                  transform: [
                    {
                      scale: dot3Anim.interpolate({
                        inputRange: [0.3, 1],
                        outputRange: [0.85, 1.15],
                      }),
                    },
                  ],
                },
              ]}
            />
          </View>
          <Text style={[styles.statusText, { color: colors.textTertiary }]}>
            Initializing system...
          </Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

export default SplashScreen;