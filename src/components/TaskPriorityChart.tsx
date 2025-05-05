import React from 'react';
import { motion } from 'framer-motion';
import { Task } from '../types/Task';

interface TaskPriorityChartProps {
  tasks: Task[];
}

const TaskPriorityChart: React.FC<TaskPriorityChartProps> = ({ tasks }) => {
  // Görev sayılarını hesapla
  const totalTasks = tasks.length;
  const highPriorityTasks = tasks.filter(task => task.priority === 'high').length;
  const mediumPriorityTasks = tasks.filter(task => task.priority === 'medium').length;
  const lowPriorityTasks = tasks.filter(task => task.priority === 'low').length;

  // Yüzdeleri hesapla
  const highPriorityPercentage = (highPriorityTasks / totalTasks) * 100;
  const mediumPriorityPercentage = (mediumPriorityTasks / totalTasks) * 100;
  const lowPriorityPercentage = (lowPriorityTasks / totalTasks) * 100;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 w-full">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Görev Öncelik Dağılımı</h2>
      
      {/* Yüksek Öncelikli Görevler */}
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">Yüksek Öncelik</span>
          <span className="text-sm font-medium text-gray-700">{highPriorityTasks} görev ({highPriorityPercentage.toFixed(1)}%)</span>
        </div>
        <motion.div 
          className="h-4 bg-gray-200 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="h-4 bg-red-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${highPriorityPercentage}%` }}
            transition={{ duration: 0.5, delay: 0.2 }}
          />
        </motion.div>
      </div>

      {/* Orta Öncelikli Görevler */}
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">Orta Öncelik</span>
          <span className="text-sm font-medium text-gray-700">{mediumPriorityTasks} görev ({mediumPriorityPercentage.toFixed(1)}%)</span>
        </div>
        <motion.div 
          className="h-4 bg-gray-200 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="h-4 bg-yellow-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${mediumPriorityPercentage}%` }}
            transition={{ duration: 0.5, delay: 0.4 }}
          />
        </motion.div>
      </div>

      {/* Düşük Öncelikli Görevler */}
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">Düşük Öncelik</span>
          <span className="text-sm font-medium text-gray-700">{lowPriorityTasks} görev ({lowPriorityPercentage.toFixed(1)}%)</span>
        </div>
        <motion.div 
          className="h-4 bg-gray-200 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="h-4 bg-green-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${lowPriorityPercentage}%` }}
            transition={{ duration: 0.5, delay: 0.6 }}
          />
        </motion.div>
      </div>

      {/* Toplam Görev Sayısı */}
      <div className="mt-6 text-center">
        <span className="text-lg font-semibold text-gray-800">Toplam: {totalTasks} görev</span>
      </div>
    </div>
  );
};

export default TaskPriorityChart; 