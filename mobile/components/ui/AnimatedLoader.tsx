import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import LottieView from 'lottie-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  withSequence,
  Easing
} from 'react-native-reanimated';

interface AnimatedLoaderProps {
  visible: boolean;
  animationSource?: any; // Lottie animation source
  text?: string;
  size?: number;
  textColor?: string;
  containerStyle?: ViewStyle;
  animationType?: 'pulse' | 'bounce' | 'fade' | 'none';
}

const DEFAULT_LOADING_ANIMATION = require('../../assets/animations/loading.json');

const AnimatedLoader = ({
  visible,
  animationSource = DEFAULT_LOADING_ANIMATION,
  text,
  size = 100,
  textColor = '#3B82F6',
  containerStyle,
  animationType = 'pulse'
}: AnimatedLoaderProps) => {
  // Animation values
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      switch (animationType) {
        case 'pulse':
          scale.value = withRepeat(
            withSequence(
              withTiming(1.05, { duration: 700, easing: Easing.inOut(Easing.ease) }),
              withTiming(0.95, { duration: 700, easing: Easing.inOut(Easing.ease) })
            ),
            -1, // infinite
            true // reverse
          );
          break;
        case 'bounce':
          translateY.value = withRepeat(
            withSequence(
              withTiming(-10, { duration: 500, easing: Easing.inOut(Easing.ease) }),
              withTiming(0, { duration: 500, easing: Easing.bounce })
            ),
            -1 // infinite
          );
          break;
        case 'fade':
          opacity.value = withRepeat(
            withSequence(
              withTiming(0.5, { duration: 700, easing: Easing.inOut(Easing.ease) }),
              withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) })
            ),
            -1, // infinite
            true // reverse
          );
          break;
        default:
          break;
      }
    }
  }, [visible, animationType, scale, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateY: translateY.value }
      ],
      opacity: opacity.value,
    };
  });

  if (!visible) return null;

  return (
    <View style={[styles.container, containerStyle]}>
      <Animated.View style={[styles.lottieContainer, animatedStyle]}>
        <LottieView
          source={animationSource}
          autoPlay
          loop
          style={{ width: size, height: size }}
        />
      </Animated.View>
      
      {text && (
        <Text style={[styles.text, { color: textColor }]}>
          {text}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 999,
  },
  lottieContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  }
});

export default AnimatedLoader; 