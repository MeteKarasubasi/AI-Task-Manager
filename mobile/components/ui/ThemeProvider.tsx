import React from 'react';
import { useColorScheme } from 'react-native';
import { PaperProvider, MD3LightTheme, MD3DarkTheme, adaptNavigationTheme } from 'react-native-paper';
import { ThemeProvider as StyledThemeProvider } from '@react-navigation/native';
import { DefaultTheme as NavigationDefaultTheme, DarkTheme as NavigationDarkTheme } from '@react-navigation/native';

type ThemeProviderProps = {
  children: React.ReactNode;
};

// Custom theme colors
const customColors = {
  light: {
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#F59E0B',
    background: '#FFFFFF',
    surface: '#FFFFFF',
    error: '#EF4444',
    text: '#1F2937',
    disabled: '#9CA3AF',
    placeholder: '#6B7280',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    notification: '#F87171',
  },
  dark: {
    primary: '#60A5FA',
    secondary: '#34D399',
    accent: '#FBBF24',
    background: '#111827',
    surface: '#1F2937',
    error: '#F87171',
    text: '#F9FAFB',
    disabled: '#6B7280',
    placeholder: '#9CA3AF',
    backdrop: 'rgba(0, 0, 0, 0.7)',
    notification: '#F87171',
  },
};

// Create custom light and dark themes
const CustomLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...customColors.light,
  },
};

const CustomDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...customColors.dark,
  },
};

// Adapt navigation themes
const { LightTheme: adaptedLightTheme, DarkTheme: adaptedDarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});

const CombinedLightTheme = {
  ...CustomLightTheme,
  ...adaptedLightTheme,
  colors: {
    ...CustomLightTheme.colors,
    ...adaptedLightTheme.colors,
  },
};

const CombinedDarkTheme = {
  ...CustomDarkTheme,
  ...adaptedDarkTheme,
  colors: {
    ...CustomDarkTheme.colors,
    ...adaptedDarkTheme.colors,
  },
};

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const theme = isDarkMode ? CombinedDarkTheme : CombinedLightTheme;

  return (
    <PaperProvider theme={theme}>
      <StyledThemeProvider value={theme}>
        {children}
      </StyledThemeProvider>
    </PaperProvider>
  );
};

export default ThemeProvider; 