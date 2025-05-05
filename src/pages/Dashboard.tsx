import React from 'react';
import {
  Box,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Text,
  Heading,
  VStack,
  HStack,
  Progress,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import TaskPriorityChart from '../components/TaskPriorityChart';
import TaskOptimizationSuggestions from '../components/TaskOptimizationSuggestions';

const MotionBox = motion(Box);

const StatCard = ({ title, value, change, type }: any) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.200');

  return (
    <MotionBox
      whileHover={{ y: -5 }}
      p={6}
      bg={cardBg}
      rounded="xl"
      borderWidth="1px"
      borderColor={useColorModeValue('gray.100', 'gray.600')}
      shadow="sm"
    >
      <Stat>
        <StatLabel color={textColor}>{title}</StatLabel>
        <StatNumber fontSize="2xl" fontWeight="bold" mt={2}>
          {value}
        </StatNumber>
        <StatHelpText>
          <StatArrow type={type} />
          {change}
        </StatHelpText>
      </Stat>
    </MotionBox>
  );
};

const TaskProgress = ({ title, value, total, colorScheme }: any) => {
  return (
    <VStack align="stretch" spacing={1}>
      <HStack justify="space-between">
        <Text fontSize="sm" color="gray.500">
          {title}
        </Text>
        <Text fontSize="sm" fontWeight="medium">
          {value}/{total}
        </Text>
      </HStack>
      <Progress value={(value / total) * 100} size="sm" colorScheme={colorScheme} rounded="full" />
    </VStack>
  );
};

const Dashboard = () => {
  const bgColor = useColorModeValue('gray.50', 'gray.800');

  // Örnek veriler (gerçek uygulamada Firebase'den gelecek)
  const tasks = [
    {
      id: '1',
      title: 'Proje Planlaması',
      description: 'Q2 için proje planlaması ve kaynak tahsisi',
      status: 'inProgress',
      priority: 'high',
      dueDate: '2024-05-15',
      createdAt: '2024-04-01',
      updatedAt: '2024-04-01',
      progress: 60,
    },
    {
      id: '2',
      title: 'Müşteri Toplantısı',
      description: 'Yeni özellikler hakkında müşteri görüşmesi',
      status: 'todo',
      priority: 'medium',
      dueDate: '2024-05-10',
      createdAt: '2024-04-01',
      updatedAt: '2024-04-01',
    },
    // ... diğer görevler
  ];

  const suggestions = [
    {
      id: 1,
      taskId: '2',
      taskTitle: 'Müşteri Toplantısı',
      currentPriority: 'medium',
      newPriority: 'high',
      reason: 'Toplantı tarihi yaklaşıyor ve hazırlık gerekiyor',
    },
    // ... diğer öneriler
  ];

  return (
    <Box>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" mb={2}>
            Hoş Geldiniz 👋
          </Heading>
          <Text color="gray.500">
            İşte görevlerinizin ve aktivitelerinizin genel durumu
          </Text>
        </Box>

        {/* Stats */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          <StatCard
            title="Toplam Görev"
            value="24"
            change="23.36%"
            type="increase"
          />
          <StatCard
            title="Tamamlanan"
            value="16"
            change="12.5%"
            type="increase"
          />
          <StatCard
            title="Devam Eden"
            value="5"
            change="8.2%"
            type="decrease"
          />
          <StatCard
            title="Geciken"
            value="3"
            change="14.5%"
            type="decrease"
          />
        </SimpleGrid>

        {/* Task Progress */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          <Box
            bg={useColorModeValue('white', 'gray.700')}
            p={6}
            rounded="xl"
            borderWidth="1px"
            borderColor={useColorModeValue('gray.100', 'gray.600')}
            shadow="sm"
          >
            <VStack align="stretch" spacing={4}>
              <Heading size="md">Görev İlerlemesi</Heading>
              <TaskProgress
                title="Yüksek Öncelikli"
                value={8}
                total={10}
                colorScheme="red"
              />
              <TaskProgress
                title="Orta Öncelikli"
                value={12}
                total={15}
                colorScheme="yellow"
              />
              <TaskProgress
                title="Düşük Öncelikli"
                value={15}
                total={20}
                colorScheme="green"
              />
            </VStack>
          </Box>

          {/* Recent Activity */}
          <Box
            bg={useColorModeValue('white', 'gray.700')}
            p={6}
            rounded="xl"
            borderWidth="1px"
            borderColor={useColorModeValue('gray.100', 'gray.600')}
            shadow="sm"
          >
            <VStack align="stretch" spacing={4}>
              <Heading size="md">Son Aktiviteler</Heading>
              {[
                {
                  title: 'Proje Planlaması tamamlandı',
                  time: '2 saat önce',
                  type: 'success',
                },
                {
                  title: 'Yeni görev atandı: Müşteri Toplantısı',
                  time: '4 saat önce',
                  type: 'info',
                },
                {
                  title: 'Raporlama görevi gecikti',
                  time: '1 gün önce',
                  type: 'warning',
                },
              ].map((activity, index) => (
                <HStack key={index} justify="space-between">
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm" fontWeight="medium">
                      {activity.title}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {activity.time}
                    </Text>
                  </VStack>
                  <Badge
                    colorScheme={
                      activity.type === 'success'
                        ? 'green'
                        : activity.type === 'warning'
                        ? 'yellow'
                        : 'blue'
                    }
                  >
                    {activity.type}
                  </Badge>
                </HStack>
              ))}
            </VStack>
          </Box>
        </SimpleGrid>

        {/* İstatistikler */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Görev Durumu
            </h3>
            <TaskPriorityChart tasks={tasks} />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              AI Önerileri
            </h3>
            <TaskOptimizationSuggestions
              suggestions={suggestions}
              onAccept={(suggestion) => {
                console.log('Öneri kabul edildi:', suggestion);
              }}
              onReject={(suggestion) => {
                console.log('Öneri reddedildi:', suggestion);
              }}
            />
          </div>
        </motion.div>

        {/* Yaklaşan Görevler */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Yaklaşan Görevler
          </h3>
          <div className="space-y-4">
            {tasks
              .filter((task) => task.status !== 'done')
              .slice(0, 3)
              .map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h4 className="font-medium text-gray-900">{task.title}</h4>
                    <p className="text-sm text-gray-500">{task.description}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        task.priority === 'high'
                          ? 'bg-red-100 text-red-800'
                          : task.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(task.dueDate).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </motion.div>
      </VStack>
    </Box>
  );
};

export default Dashboard; 