import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Badge,
  IconButton,
  useToast,
  Flex,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
} from '@chakra-ui/react';
import {
  SearchIcon,
  AddIcon,
  ChevronDownIcon,
  FilterIcon,
} from '@chakra-ui/icons';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Task, TaskStatus, TaskPriority } from '../../types/task';
import TaskCard from './TaskCard';
import CreateTaskModal from './CreateTaskModal';

const TaskList = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'createdAt'>('createdAt');
  const { user } = useAuth();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (!user) return;

    // Firestore sorgusu oluştur
    const tasksQuery = query(
      collection(db, 'tasks'),
      where('assignedTo', 'array-contains', user.uid),
      orderBy(sortBy, 'desc')
    );

    // Real-time listener
    const unsubscribe = onSnapshot(
      tasksQuery,
      (snapshot) => {
        const taskList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Task[];
        setTasks(taskList);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching tasks:', error);
        toast({
          title: 'Görevler yüklenemedi',
          status: 'error',
          duration: 3000,
        });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, sortBy, toast]);

  // Filtreleme fonksiyonu
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'high':
        return 'red';
      case 'medium':
        return 'yellow';
      case 'low':
        return 'green';
      default:
        return 'gray';
    }
  };

  return (
    <Box p={4}>
      {/* Üst Bar */}
      <Flex justify="space-between" align="center" mb={6}>
        <Text fontSize="2xl" fontWeight="bold">
          Görevler
        </Text>
        <Button
          leftIcon={<AddIcon />}
          colorScheme="brand"
          onClick={onOpen}
        >
          Yeni Görev
        </Button>
      </Flex>

      {/* Filtreler */}
      <HStack spacing={4} mb={6}>
        <InputGroup maxW="300px">
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Görev ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </InputGroup>

        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'all')}
          maxW="200px"
        >
          <option value="all">Tüm Durumlar</option>
          <option value="todo">Yapılacak</option>
          <option value="in-progress">Devam Ediyor</option>
          <option value="done">Tamamlandı</option>
        </Select>

        <Select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | 'all')}
          maxW="200px"
        >
          <option value="all">Tüm Öncelikler</option>
          <option value="high">Yüksek</option>
          <option value="medium">Orta</option>
          <option value="low">Düşük</option>
        </Select>

        <Menu>
          <MenuButton
            as={Button}
            rightIcon={<ChevronDownIcon />}
            variant="outline"
          >
            Sırala
          </MenuButton>
          <MenuList>
            <MenuItem onClick={() => setSortBy('dueDate')}>
              Bitiş Tarihi
            </MenuItem>
            <MenuItem onClick={() => setSortBy('priority')}>
              Öncelik
            </MenuItem>
            <MenuItem onClick={() => setSortBy('createdAt')}>
              Oluşturma Tarihi
            </MenuItem>
          </MenuList>
        </Menu>
      </HStack>

      {/* Görev Listesi */}
      {loading ? (
        <Text>Yükleniyor...</Text>
      ) : filteredTasks.length === 0 ? (
        <Text color="gray.500" textAlign="center" py={8}>
          Görev bulunamadı
        </Text>
      ) : (
        <VStack spacing={4} align="stretch">
          {filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </VStack>
      )}

      {/* Yeni Görev Modalı */}
      <CreateTaskModal isOpen={isOpen} onClose={onClose} />
    </Box>
  );
};

export default TaskList; 