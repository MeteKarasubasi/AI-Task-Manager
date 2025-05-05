import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, Pressable } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  withSpring,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface CardProps {
  title?: string;
  subtitle?: string;
  content?: React.ReactNode;
  headerContent?: React.ReactNode;
  footerContent?: React.ReactNode;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  animationType?: 'lift' | 'scale' | 'tilt' | 'none';
  variant?: 'elevated' | 'outlined' | 'filled' | 'gradient';
  gradientColors?: [string, string];
  onPress?: () => void;
  pressable?: boolean;
}

const Card = ({ 
  title, 
  subtitle, 
  content, 
  headerContent, 
  footerContent, 
  style,
  titleStyle,
  subtitleStyle,
  animationType = 'lift',
  variant = 'elevated',
  gradientColors = ['#4F46E5', '#3B82F6'],
  onPress,
  pressable = false 
}: CardProps) => {
  // Animation values
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);
  const shadowOpacity = useSharedValue(0.1);

  // Animated styles based on animationType
  const animatedStyle = useAnimatedStyle(() => {
    const scaleValue = interpolate(
      scale.value,
      [0.95, 1, 1.05],
      [0.95, 1, 1.05],
      Extrapolate.CLAMP
    );
    
    return {
      transform: [
        { scale: animationType === 'scale' ? scaleValue : 1 },
        { translateY: animationType === 'lift' ? translateY.value : 0 },
        { rotateX: animationType === 'tilt' ? `${rotateX.value}deg` : '0deg' },
        { rotateY: animationType === 'tilt' ? `${rotateY.value}deg` : '0deg' },
      ],
      shadowOpacity: shadowOpacity.value,
    };
  });

  // Get card style based on variant
  const getCardStyle = () => {
    switch (variant) {
      case 'elevated':
        return styles.elevated;
      case 'outlined':
        return styles.outlined;
      case 'filled':
        return styles.filled;
      case 'gradient':
        return styles.gradient;
      default:
        return styles.elevated;
    }
  };

  // Handle press in animation
  const handlePressIn = () => {
    if (!pressable) return;
    
    switch (animationType) {
      case 'scale':
        scale.value = withSpring(0.95, { damping: 10, stiffness: 100 });
        break;
      case 'lift':
        translateY.value = withSpring(5, { damping: 10, stiffness: 100 });
        shadowOpacity.value = withTiming(0.2, { duration: 150 });
        break;
      case 'tilt':
        rotateX.value = withSpring(-5, { damping: 10, stiffness: 100 });
        rotateY.value = withSpring(5, { damping: 10, stiffness: 100 });
        break;
      default:
        break;
    }
  };

  // Handle press out animation
  const handlePressOut = () => {
    if (!pressable) return;
    
    switch (animationType) {
      case 'scale':
        scale.value = withSpring(1, { damping: 10, stiffness: 100 });
        break;
      case 'lift':
        translateY.value = withSpring(0, { damping: 10, stiffness: 100 });
        shadowOpacity.value = withTiming(0.1, { duration: 150 });
        break;
      case 'tilt':
        rotateX.value = withSpring(0, { damping: 10, stiffness: 100 });
        rotateY.value = withSpring(0, { damping: 10, stiffness: 100 });
        break;
      default:
        break;
    }
  };

  // Card Header
  const renderHeader = () => {
    if (headerContent) {
      return <View style={styles.headerContent}>{headerContent}</View>;
    }

    if (title || subtitle) {
      return (
        <View style={styles.header}>
          {title && <Text style={[styles.title, titleStyle]}>{title}</Text>}
          {subtitle && <Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text>}
        </View>
      );
    }

    return null;
  };

  // Card Content
  const renderContent = () => {
    if (!content) return null;
    return <View style={styles.content}>{content}</View>;
  };

  // Card Footer
  const renderFooter = () => {
    if (!footerContent) return null;
    return <View style={styles.footer}>{footerContent}</View>;
  };

  // Card Container
  const CardContainer = () => {
    // For gradient variant
    if (variant === 'gradient') {
      return (
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.card, getCardStyle(), style]}
        >
          {renderHeader()}
          {renderContent()}
          {renderFooter()}
        </LinearGradient>
      );
    }

    // For other variants
    return (
      <View style={[styles.card, getCardStyle(), style]}>
        {renderHeader()}
        {renderContent()}
        {renderFooter()}
      </View>
    );
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={!pressable}
    >
      <Animated.View style={[styles.container, animatedStyle]}>
        <CardContainer />
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  elevated: {
    backgroundColor: 'white',
  },
  outlined: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filled: {
    backgroundColor: '#F3F4F6',
  },
  gradient: {
    // No background color here, LinearGradient will handle it
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerContent: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  content: {
    padding: 16,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  }
});

export default Card; 