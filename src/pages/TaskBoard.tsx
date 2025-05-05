import React, { useState } from 'react';
import {
  Box,
  Button,
  Heading,
  HStack,
  useColorModeValue,
  Text,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
} from '@chakra-ui/react';
import { AddIcon, DotsVerticalIcon } from '@heroicons/react/outline';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  status: 'todo' | 'inProgress' | 'done';
}

const TaskCard: React.FC<{ task: Task; index: number }> = ({ task, index }) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const priorityColors = {
    high: 'red',
    medium: 'yellow',
    low: 'green',
  };

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <Box
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          bg={cardBg}
          p={4}
          mb={2}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={borderColor}
          boxShadow={snapshot.isDragging ? 'lg' : 'sm'}
          opacity={snapshot.isDragging ? 0.8 : 1}
        >
          <HStack justify="space-between" mb={2}>
            <Text fontWeight="medium">{task.title}</Text>
            <Box
              px={2}
              py={1}
              borderRadius="full"
              bg={`${priorityColors[task.priority]}.100`}
              color={`${priorityColors[task.priority]}.700`}
              fontSize="xs"
              fontWeight="medium"
            >
              {task.priority}
            </Box>
          </HStack>
          {task.description && (
            <Text fontSize="sm" color="gray.500" noOfLines={2}>
              {task.description}
            </Text>
          )}
          {task.dueDate && (
            <Text fontSize="xs" color="gray.500" mt={2}>
              {new Date(task.dueDate).toLocaleDateString('tr-TR')}
            </Text>
          )}
        </Box>
      )}
    </Draggable>
  );
};

const Column: React.FC<{
  title: string;
  tasks: Task[];
  status: Task['status'];
}> = ({ title, tasks, status }) => {
  const columnBg = useColorModeValue('gray.50', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box
      bg={columnBg}
      p={4}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
      width="full"
      minH="70vh"
    >
      <HStack justify="space-between" mb={4}>
        <Heading size="sm">{title}</Heading>
        <HStack>
          <Text fontSize="sm" color="gray.500">
            {tasks.length} görev
          </Text>
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<DotsVerticalIcon className="w-5 h-5" />}
              variant="ghost"
              size="sm"
              aria-label="Daha fazla"
            />
            <MenuList>
              <MenuItem>Tümünü Seç</MenuItem>
              <MenuItem>Filtreleme</MenuItem>
              <MenuItem>Sıralama</MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </HStack>

      <Droppable droppableId={status}>
        {(provided) => (
          <Box
            ref={provided.innerRef}
            {...provided.droppableProps}
            minH="200px"
          >
            {tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} />
            ))}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
    </Box>
  );
};

const TaskBoard = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Proje Planlaması',
      description: 'Q2 için proje planlaması yapılacak',
      status: 'todo',
      priority: 'high',
      dueDate: '2024-05-15',
    },
    {
      id: '2',
      title: 'Müşteri Toplantısı',
      description: 'Yeni özellikler hakkında görüşme',
      status: 'inProgress',
      priority: 'medium',
      dueDate: '2024-05-10',
    },
    {
      id: '3',
      title: 'Raporlama',
      description: 'Aylık rapor hazırlanacak',
      status: 'done',
      priority: 'low',
      dueDate: '2024-05-01',
    },
  ]);

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const newTasks = Array.from(tasks);
    const [movedTask] = newTasks.splice(source.index, 1);
    movedTask.status = destination.droppableId;
    newTasks.splice(destination.index, 0, movedTask);
    setTasks(newTasks);
  };

  return (
    <Box>
      <HStack justify="space-between" mb={8}>
        <Box>
          <Heading size="lg">Görev Tahtası</Heading>
          <Text color="gray.500">Görevlerinizi sürükleyip bırakarak yönetin</Text>
        </Box>
        <Button leftIcon={<AddIcon className="w-5 h-5" />} colorScheme="brand">
          Yeni Görev
        </Button>
      </HStack>

      <DragDropContext onDragEnd={onDragEnd}>
        <HStack spacing={8} align="start">
          <Column
            title="Yapılacak"
            tasks={tasks.filter((t) => t.status === 'todo')}
            status="todo"
          />
          <Column
            title="Devam Ediyor"
            tasks={tasks.filter((t) => t.status === 'inProgress')}
            status="inProgress"
          />
          <Column
            title="Tamamlandı"
            tasks={tasks.filter((t) => t.status === 'done')}
            status="done"
          />
        </HStack>
      </DragDropContext>
    </Box>
  );
};

export default TaskBoard; 