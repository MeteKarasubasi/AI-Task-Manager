import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { motion } from 'framer-motion';

/**
 * Görev önceliklerini görselleştiren grafik bileşeni
 * @param {Object} props - Bileşen props'ları
 * @param {Array} props.tasks - Görev listesi
 * @param {boolean} props.showAnimation - Animasyon gösterilsin mi?
 */
const TaskPriorityChart = ({ tasks, showAnimation = true }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!tasks || tasks.length === 0) return;

    // Mevcut grafiği temizle
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Öncelik dağılımını hesapla
    const priorityDistribution = calculatePriorityDistribution(tasks);

    // Grafiği oluştur
    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Yüksek Öncelik', 'Orta Öncelik', 'Düşük Öncelik'],
        datasets: [{
          data: [
            priorityDistribution.high,
            priorityDistribution.medium,
            priorityDistribution.low
          ],
          backgroundColor: [
            'rgba(239, 68, 68, 0.8)', // Kırmızı
            'rgba(234, 179, 8, 0.8)',  // Sarı
            'rgba(34, 197, 94, 0.8)'   // Yeşil
          ],
          borderColor: [
            'rgba(239, 68, 68, 1)',
            'rgba(234, 179, 8, 1)',
            'rgba(34, 197, 94, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: {
                family: 'Inter, system-ui, sans-serif',
                size: 12
              }
            }
          },
          title: {
            display: true,
            text: 'Görev Öncelikleri Dağılımı',
            font: {
              family: 'Inter, system-ui, sans-serif',
              size: 16,
              weight: 'bold'
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.formattedValue;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((context.raw / total) * 100);
                return `${label}: ${value} görev (${percentage}%)`;
              }
            }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [tasks]);

  /**
   * Görevlerin öncelik dağılımını hesaplar
   * @param {Array} tasks - Görev listesi
   * @returns {Object} Öncelik dağılımı
   */
  const calculatePriorityDistribution = (tasks) => {
    return tasks.reduce((acc, task) => {
      acc[task.priority.toLowerCase()]++;
      return acc;
    }, { high: 0, medium: 0, low: 0 });
  };

  return (
    <motion.div
      initial={showAnimation ? { opacity: 0, y: 20 } : false}
      animate={showAnimation ? { opacity: 1, y: 0 } : false}
      transition={{ duration: 0.5 }}
      className="bg-white p-4 rounded-lg shadow-md"
    >
      <canvas ref={chartRef} />
      
      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <StatCard
          title="Yüksek Öncelikli"
          count={calculatePriorityDistribution(tasks).high}
          color="text-red-600"
          bgColor="bg-red-50"
        />
        <StatCard
          title="Orta Öncelikli"
          count={calculatePriorityDistribution(tasks).medium}
          color="text-yellow-600"
          bgColor="bg-yellow-50"
        />
        <StatCard
          title="Düşük Öncelikli"
          count={calculatePriorityDistribution(tasks).low}
          color="text-green-600"
          bgColor="bg-green-50"
        />
      </div>
    </motion.div>
  );
};

/**
 * İstatistik kartı bileşeni
 */
const StatCard = ({ title, count, color, bgColor }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className={`${bgColor} p-4 rounded-lg`}
  >
    <h3 className={`${color} font-semibold text-lg`}>{title}</h3>
    <p className={`${color} text-2xl font-bold mt-2`}>{count}</p>
    <p className={`${color} text-sm opacity-75 mt-1`}>görev</p>
  </motion.div>
);

export default TaskPriorityChart; 