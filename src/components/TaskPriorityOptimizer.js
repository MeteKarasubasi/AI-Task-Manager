import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Görev önceliklerini AI yardımıyla optimize eden ve görüntüleyen bileşen
 */
const TaskPriorityOptimizer = ({ tasks, onOptimize, isOptimizing }) => {
  const [showOptimizationDetails, setShowOptimizationDetails] = useState(false);

  const priorityColors = {
    high: { bg: 'bg-red-100', text: 'text-red-800', icon: 'text-red-500' },
    medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: 'text-yellow-500' },
    low: { bg: 'bg-green-100', text: 'text-green-800', icon: 'text-green-500' }
  };

  const priorityChanges = tasks.filter(task => task.originalPriority !== task.optimizedPriority);

  if (isOptimizing) {
    return (
      <div className="bg-background-light p-4 rounded-lg shadow-md">
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
          <span className="text-gray-600">Öncelikler optimize ediliyor...</span>
        </div>
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return null;
  }

  return (
    <div className="bg-background-light p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-primary">
          Öncelik Optimizasyonu
        </h3>
        <button
          onClick={() => onOptimize()}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
        >
          Yeniden Optimize Et
        </button>
      </div>

      <div className="mb-4">
        <button
          onClick={() => setShowOptimizationDetails(!showOptimizationDetails)}
          className="text-sm text-primary hover:text-primary-dark flex items-center"
        >
          <span>{showOptimizationDetails ? 'Detayları Gizle' : 'Detayları Göster'}</span>
          <svg
            className={`ml-1 h-4 w-4 transform transition-transform ${
              showOptimizationDetails ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {showOptimizationDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 overflow-hidden"
          >
            {priorityChanges.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-3 rounded-md shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-800">{task.title}</h4>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        priorityColors[task.originalPriority].bg
                      } ${priorityColors[task.originalPriority].text}`}>
                        Önceki: {task.originalPriority.charAt(0).toUpperCase() + task.originalPriority.slice(1)}
                      </span>
                      <svg
                        className="h-4 w-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        priorityColors[task.optimizedPriority].bg
                      } ${priorityColors[task.optimizedPriority].text}`}>
                        Yeni: {task.optimizedPriority.charAt(0).toUpperCase() + task.optimizedPriority.slice(1)}
                      </span>
                    </div>
                    {task.optimizationReason && (
                      <p className="text-sm text-gray-600 mt-2">
                        {task.optimizationReason}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 p-3 bg-blue-50 rounded-md">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-800">
              Optimizasyon Özeti
            </h4>
            <p className="text-sm text-blue-700 mt-1">
              {priorityChanges.length} görevin önceliği değiştirildi.
              Bu değişiklikler iş akışınızı daha verimli hale getirmeyi amaçlıyor.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskPriorityOptimizer; 