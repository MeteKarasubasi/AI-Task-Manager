import React from 'react';
import { Pressable, Text, ActivityIndicator, ViewStyle, TextStyle, View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

const Button = ({
  onPress,
  title,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon,
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) => {
  // Animation for press feedback
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  // Button variants styling
  const getVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primary;
      case 'secondary':
        return styles.secondary;
      case 'accent':
        return styles.accent;
      case 'danger':
        return styles.danger;
      case 'outline':
        return styles.outline;
      case 'ghost':
        return styles.ghost;
      default:
        return styles.primary;
    }
  };

  // Size variations
  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return styles.sizeSmall;
      case 'md':
        return styles.sizeMedium;
      case 'lg':
        return styles.sizeLarge;
      default:
        return styles.sizeMedium;
    }
  };

  // Text color based on variant
  const getTextStyle = () => {
    if (variant === 'outline' || variant === 'ghost') {
      return styles.textPrimary;
    }
    return styles.textLight;
  };

  // Width style
  const getWidthStyle = () => {
    return fullWidth ? styles.fullWidth : {};
  };

  // Gradient colors based on variant
  const getGradientColors = (): [string, string] => {
    switch (variant) {
      case 'primary':
        return ['#4F46E5', '#3B82F6'];
      case 'secondary':
        return ['#10B981', '#059669'];
      case 'accent':
        return ['#F59E0B', '#D97706'];
      case 'danger':
        return ['#EF4444', '#DC2626'];
      default:
        return ['#3B82F6', '#2563EB'];
    }
  };

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 10, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 150 });
  };

  // Button content
  const renderContent = () => (
    <>
      {isLoading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' || variant === 'ghost' ? '#3B82F6' : '#FFFFFF'} 
        />
      ) : (
        <>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text 
            style={[
              getTextStyle(),
              styles.text,
              textStyle
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </>
  );

  // Main component
  const ButtonContent = () => {
    // For variants that use gradients
    if (['primary', 'secondary', 'accent', 'danger'].includes(variant)) {
      return (
        <LinearGradient
          colors={getGradientColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.container,
            getSizeStyle(),
            getWidthStyle(),
            disabled && styles.disabled
          ]}
        >
          {renderContent()}
        </LinearGradient>
      );
    }

    // For outline and ghost variants
    return (
      <Animated.View 
        style={[
          getVariantStyle(),
          styles.container,
          getSizeStyle(),
          getWidthStyle(),
          animatedStyle,
          disabled && styles.disabled,
          style
        ]}
      >
        {renderContent()}
      </Animated.View>
    );
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || isLoading}
      style={({pressed}) => [
        getWidthStyle(),
        pressed && styles.pressed
      ]}
    >
      <ButtonContent />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primary: {
    backgroundColor: '#3B82F6',
  },
  secondary: {
    backgroundColor: '#10B981',
  },
  accent: {
    backgroundColor: '#F59E0B',
  },
  danger: {
    backgroundColor: '#EF4444',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  sizeSmall: {
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  sizeMedium: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  sizeLarge: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  fullWidth: {
    width: '100%',
  },
  textPrimary: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  textLight: {
    color: 'white',
    fontWeight: '600',
  },
  text: {
    textAlign: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  disabled: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.9,
  }
});

export default Button; 