import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from './ThemedText';
import { colors, shadows, spacing, borderRadius } from '../theme';
import { Ionicons } from '@expo/vector-icons';

interface ProjectCardProps {
  title: string;
  description: string;
  category: 'development' | 'design' | 'marketing' | 'management';
  members: number;
  tasks: number;
  onPress: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  title,
  description,
  category,
  members,
  tasks,
  onPress,
}) => {
  const getCategoryIcon = () => {
    switch (category) {
      case 'development':
        return 'code-slash';
      case 'design':
        return 'color-palette';
      case 'marketing':
        return 'megaphone';
      case 'management':
        return 'people';
      default:
        return 'folder';
    }
  };

  const getGradientColors = () => {
    switch (category) {
      case 'development':
        return ['#7C3AED', '#4F46E5'];
      case 'design':
        return ['#EC4899', '#DB2777'];
      case 'marketing':
        return ['#10B981', '#059669'];
      case 'management':
        return ['#F59E0B', '#D97706'];
      default:
        return colors.gradient.primary;
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <LinearGradient
        colors={getGradientColors()}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View style={styles.categoryContainer}>
            <Ionicons name={getCategoryIcon()} size={24} color={colors.surface} />
          </View>
          <ThemedText variant="heading" style={styles.title}>
            {title}
          </ThemedText>
        </View>

        <ThemedText variant="body" style={styles.description}>
          {description}
        </ThemedText>

        <View style={styles.footer}>
          <View style={styles.statsContainer}>
            <Ionicons name="people" size={16} color={colors.surface} />
            <ThemedText variant="caption" style={styles.statsText}>
              {members} Üye
            </ThemedText>
          </View>
          <View style={styles.statsContainer}>
            <Ionicons name="checkbox" size={16} color={colors.surface} />
            <ThemedText variant="caption" style={styles.statsText}>
              {tasks} Görev
            </ThemedText>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 200,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    ...shadows.medium,
  },
  gradient: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.round,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  title: {
    color: colors.surface,
    flex: 1,
  },
  description: {
    color: colors.surface,
    opacity: 0.9,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsText: {
    color: colors.surface,
    marginLeft: spacing.xs,
  },
});

export default ProjectCard; 