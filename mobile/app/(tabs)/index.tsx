import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { ProjectCard } from '../components/ProjectCard';
import { colors, spacing, shadows } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { generateProjectTemplate, ProjectTemplate } from '../services/gemini';

export default function HomeScreen() {
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');

  const handleCategorySelect = async (category: string) => {
    setSelectedCategory(category);
    setIsLoading(true);
    try {
      const template = await generateProjectTemplate(category as any);
      // Template'i kullanarak projeyi oluştur
      console.log('Generated template:', template);
    } catch (error) {
      console.error('Error generating template:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const projects = [
    {
      id: '1',
      title: 'E-ticaret Web Sitesi',
      description: 'Modern ve kullanıcı dostu bir e-ticaret platformu',
      category: 'development' as const,
      members: 5,
      tasks: 12,
    },
    {
      id: '2',
      title: 'Mobil Uygulama Tasarımı',
      description: 'Yeni nesil mobil uygulama arayüz tasarımı',
      category: 'design' as const,
      members: 3,
      tasks: 8,
    },
    {
      id: '3',
      title: 'Sosyal Medya Kampanyası',
      description: 'Yaz sezonu için sosyal medya pazarlama kampanyası',
      category: 'marketing' as const,
      members: 4,
      tasks: 15,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <ThemedText variant="title">Projelerim</ThemedText>
          <ThemedText variant="body" style={styles.subtitle}>
            Tüm projelerinizi tek bir yerden yönetin
          </ThemedText>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setIsCreateModalVisible(true)}
        >
          <Ionicons name="add-circle" size={32} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            title={project.title}
            description={project.description}
            category={project.category}
            members={project.members}
            tasks={project.tasks}
            onPress={() => {}}
          />
        ))}
      </ScrollView>

      <Modal
        visible={isCreateModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText variant="heading">Yeni Proje Oluştur</ThemedText>
              <TouchableOpacity 
                onPress={() => setIsCreateModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <ThemedText variant="body" style={styles.loadingText}>
                  Proje şablonu oluşturuluyor...
                </ThemedText>
              </View>
            ) : (
              <View style={styles.categoryGrid}>
                <TouchableOpacity 
                  style={[
                    styles.categoryCard,
                    selectedCategory === 'development' && styles.selectedCategory
                  ]}
                  onPress={() => handleCategorySelect('development')}
                >
                  <Ionicons name="code-slash" size={32} color={colors.primary} />
                  <ThemedText variant="body">Geliştirme</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.categoryCard,
                    selectedCategory === 'design' && styles.selectedCategory
                  ]}
                  onPress={() => handleCategorySelect('design')}
                >
                  <Ionicons name="color-palette" size={32} color={colors.secondary} />
                  <ThemedText variant="body">Tasarım</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.categoryCard,
                    selectedCategory === 'marketing' && styles.selectedCategory
                  ]}
                  onPress={() => handleCategorySelect('marketing')}
                >
                  <Ionicons name="megaphone" size={32} color={colors.accent} />
                  <ThemedText variant="body">Pazarlama</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.categoryCard,
                    selectedCategory === 'management' && styles.selectedCategory
                  ]}
                  onPress={() => handleCategorySelect('management')}
                >
                  <Ionicons name="people" size={32} color={colors.warning} />
                  <ThemedText variant="body">Yönetim</ThemedText>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    ...shadows.large,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  subtitle: {
    marginTop: spacing.xs,
    opacity: 0.8,
  },
  addButton: {
    padding: spacing.sm,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: spacing.xl,
    ...shadows.large,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  closeButton: {
    padding: spacing.sm,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    height: 120,
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.medium,
  },
  selectedCategory: {
    backgroundColor: colors.primary,
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    textAlign: 'center',
  },
});
