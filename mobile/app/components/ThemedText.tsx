import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { typography } from '../theme';

interface ThemedTextProps extends TextProps {
  variant?: keyof typeof typography;
}

export const ThemedText: React.FC<ThemedTextProps> = ({ 
  variant = 'body', 
  style, 
  ...props 
}) => {
  return (
    <Text 
      style={[typography[variant], style]} 
      {...props} 
    />
  );
};

export default ThemedText; 