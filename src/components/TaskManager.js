import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TaskPriorityChart from './TaskPriorityChart';
import TaskOptimizationSuggestions from './TaskOptimizationSuggestions';
import { TaskOptimizationService } from '../services/TaskOptimizationService';

/**
 * Ana görev yönetimi bileşeni
 * Görev önceliklerini görselleştirir ve AI önerilerini yönetir
 */
const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // TaskOptimizationService örneği
  const optimizationService = new TaskOptimizationService();

  useEffect(() => {
    fetchTasks();
    fetchOptimizationSuggestions();
  }, []);

  /**
   * Firestore'dan görevleri çeker
   */
  const fetchTasks = async () => {
    try {
      setLoading(true);
      // Firestore'dan görevleri çek
      const tasksSnapshot = await optimizationService.getAllTasks();
      setTasks(tasksSnapshot);
      setError(null);
    } catch (err) {
      console.error('Görevler yüklenirken hata:', err);
      setError('Görevler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * AI önerilerini çeker
   */
  const fetchOptimizationSuggestions = async () => {
    try {
      const suggestions = await optimizationService.getOptimizationSuggestions();
      setSuggestions(suggestions);
    } catch (err) {
      console.error('Öneriler yüklenirken hata:', err);
      setError('Öneriler yüklenirken bir hata oluştu.');
    }
  };

  /**
   * Öneri kabul edildiğinde çalışır
   */
  const handleAcceptSuggestion = async (suggestion) => {
    try {
      await optimizationService.applyOptimization(suggestion);
      // Görevleri ve önerileri yenile
      await fetchTasks();
      await fetchOptimizationSuggestions();
    } catch (err) {
      console.error('Öneri uygulanırken hata:', err);
      setError('Öneri uygulanırken bir hata oluştu.');
    }
  };

  /**
   * Öneri reddedildiğinde çalışır
   */
  const handleRejectSuggestion = async (suggestion) => {
    try {
      await optimizationService.rejectOptimization(suggestion);
      // Önerileri yenile
      await fetchOptimizationSuggestions();
    } catch (err) {
      console.error('Öneri reddedilirken hata:', err);
      setError('Öneri reddedilirken bir hata oluştu.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Hata! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-8"
    >
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Görev Yönetimi ve Optimizasyon
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Görev öncelik dağılımı grafiği */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Öncelik Dağılımı
          </h2>
          <TaskPriorityChart tasks={tasks} showAnimation={true} />
        </div>

        {/* AI önerileri */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <TaskOptimizationSuggestions
            suggestions={suggestions}
            onAccept={handleAcceptSuggestion}
            onReject={handleRejectSuggestion}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default TaskManager; 