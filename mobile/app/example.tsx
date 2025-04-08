import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, FlatList, Pressable, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedScrollHandler, 
  useAnimatedStyle, 
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Ionicons } from '@expo/vector-icons';
import AnimatedLoader from '../components/ui/AnimatedLoader';

// Sample task data
const TASKS = [
  { id: '1', title: 'Müşteri toplantısına katıl', category: 'İş', priority: 'high', completed: false },
  { id: '2', title: 'Raporu tamamla', category: 'İş', priority: 'medium', completed: false },
  { id: '3', title: 'Alışveriş yap', category: 'Kişisel', priority: 'low', completed: true },
  { id: '4', title: 'Spor salonuna git', category: 'Sağlık', priority: 'medium', completed: false },
  { id: '5', title: 'Kitap oku', category: 'Kişisel', priority: 'low', completed: false },
  { id: '6', title: 'Mobil uygulamayı güncelle', category: 'İş', priority: 'high', completed: false },
];

// Priority colors
const PRIORITY_COLORS = {
  high: ['#EF4444', '#B91C1C'],
  medium: ['#F59E0B', '#D97706'],
  low: ['#10B981', '#059669'],
};

const Example = () => {
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState('all');

  // Animation values
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  // Header animation
  const headerStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, 100],
      [200, 120],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      scrollY.value,
      [0, 60, 90],
      [1, 0.5, 0],
      Extrapolate.CLAMP
    );

    return {
      height,
      opacity,
    };
  });

  // Title animation
  const titleStyle = useAnimatedStyle(() => {
    const fontSize = interpolate(
      scrollY.value,
      [0, 100],
      [32, 24],
      Extrapolate.CLAMP
    );

    const paddingLeft = interpolate(
      scrollY.value,
      [0, 100],
      [24, 80],
      Extrapolate.CLAMP
    );

    return {
      fontSize,
      paddingLeft,
    };
  });

  // Filter tasks based on selected tab
  const getFilteredTasks = () => {
    switch (selectedTab) {
      case 'all':
        return TASKS;
      case 'completed':
        return TASKS.filter(task => task.completed);
      case 'pending':
        return TASKS.filter(task => !task.completed);
      default:
        return TASKS;
    }
  };

  // Toggle task completion
  const toggleTaskCompletion = (taskId: string) => {
    // In a real app, you would update the task in state or database
    console.log(`Toggle task completion for task ${taskId}`);
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  // Add new task
  const addNewTask = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  };

  // Render task item
  const renderTask = ({ item }: { item: typeof TASKS[0] }) => (
    <Card
      style={styles.taskCard}
      pressable
      animationType="scale"
      onPress={() => toggleTaskCompletion(item.id)}
      content={
        <View style={styles.taskContent}>
          <View style={styles.taskHeader}>
            <View style={[styles.priorityIndicator, { backgroundColor: PRIORITY_COLORS[item.priority][0] }]} />
            <Text style={styles.taskCategory}>{item.category}</Text>
          </View>
          
          <Text style={[styles.taskTitle, item.completed && styles.completedTaskTitle]}>
            {item.title}
          </Text>
          
          <View style={styles.taskFooter}>
            <View style={[styles.priorityTag, { backgroundColor: `${PRIORITY_COLORS[item.priority][0]}20` }]}>
              <Text style={[styles.priorityText, { color: PRIORITY_COLORS[item.priority][0] }]}>
                {item.priority === 'high' ? 'Yüksek' : item.priority === 'medium' ? 'Orta' : 'Düşük'}
              </Text>
            </View>
            
            <Pressable 
              style={[styles.checkButton, item.completed && styles.completedCheckButton]}
              onPress={() => toggleTaskCompletion(item.id)}
            >
              {item.completed ? (
                <Ionicons name="checkmark" size={18} color="#fff" />
              ) : (
                <View style={styles.emptyCheck} />
              )}
            </Pressable>
          </View>
        </View>
      }
    />
  );

  // Tab bar for filtering tasks
  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <Pressable 
        style={[styles.tab, selectedTab === 'all' && styles.activeTab]}
        onPress={() => setSelectedTab('all')}
      >
        <Text style={[styles.tabText, selectedTab === 'all' && styles.activeTabText]}>Tümü</Text>
      </Pressable>
      
      <Pressable 
        style={[styles.tab, selectedTab === 'pending' && styles.activeTab]}
        onPress={() => setSelectedTab('pending')}
      >
        <Text style={[styles.tabText, selectedTab === 'pending' && styles.activeTabText]}>Bekleyen</Text>
      </Pressable>
      
      <Pressable 
        style={[styles.tab, selectedTab === 'completed' && styles.activeTab]}
        onPress={() => setSelectedTab('completed')}
      >
        <Text style={[styles.tabText, selectedTab === 'completed' && styles.activeTabText]}>Tamamlanan</Text>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header with gradient background */}
      <Animated.View style={[styles.header, headerStyle]}>
        <LinearGradient
          colors={['#3B82F6', '#1D4ED8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <Animated.Text style={[styles.headerTitle, titleStyle]}>
            Görev Yöneticisi
          </Animated.Text>
          <Text style={styles.headerSubtitle}>
            Bugün {TASKS.filter(t => !t.completed).length} tamamlanmamış görevin var
          </Text>
        </LinearGradient>
      </Animated.View>
      
      {/* Tab Bar */}
      {renderTabBar()}
      
      {/* Task List */}
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        <FlatList
          data={getFilteredTasks()}
          renderItem={renderTask}
          keyExtractor={item => item.id}
          scrollEnabled={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Görev bulunamadı</Text>
            </View>
          }
        />
      </Animated.ScrollView>
      
      {/* Add Task Button */}
      <View style={styles.fabContainer}>
        <Button
          title="Yeni Görev"
          variant="primary"
          size="lg"
          icon={<Ionicons name="add" size={20} color="#fff" />}
          onPress={addNewTask}
        />
      </View>
      
      {/* Loading Animation */}
      <AnimatedLoader 
        visible={loading} 
        text="İşlem yapılıyor..." 
        animationType="pulse" 
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    height: 200,
    width: '100%',
    overflow: 'hidden',
  },
  headerGradient: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'flex-end',
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 24,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderRadius: 30,
    marginHorizontal: 20,
    marginVertical: 12,
    height: 48,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#EBF5FF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  taskCard: {
    marginVertical: 8,
  },
  taskContent: {
    padding: 0,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  priorityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  taskCategory: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  completedTaskTitle: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priorityTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '500',
  },
  checkButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedCheckButton: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  emptyCheck: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '500',
  },
});

export default Example; 