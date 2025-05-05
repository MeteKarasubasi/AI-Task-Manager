import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  IconButton,
  Textarea,
  Input,
  FormControl,
  FormLabel,
  Select,
  useToast,
  Divider,
  Avatar,
  AvatarGroup,
  Progress,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useDisclosure,
} from '@chakra-ui/react';
import {
  EditIcon,
  DeleteIcon,
  AttachmentIcon,
  ChatIcon,
  CheckIcon,
  CloseIcon,
} from '@chakra-ui/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Task, TaskPriority, TaskStatus } from '../../types/task';
import DeleteConfirmationModal from '../common/DeleteConfirmationModal';
import TaskAttachments from './TaskAttachments';
import TaskComments from './TaskComments';

const TaskDetail: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [task, setTask] = useState<Task | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editedTask, setEditedTask] = useState<Partial<Task>>({});

  useEffect(() => {
    const fetchTask = async () => {
      if (!taskId) return;

      try {
        const taskDoc = await getDoc(doc(db, 'tasks', taskId));
        if (taskDoc.exists()) {
          setTask({ id: taskDoc.id, ...taskDoc.data() } as Task);
          setEditedTask({ id: taskDoc.id, ...taskDoc.data() } as Task);
        } else {
          toast({
            title: 'Görev bulunamadı',
            status: 'error',
            duration: 3000,
          });
          navigate('/tasks');
        }
      } catch (error) {
        toast({
          title: 'Görev yüklenemedi',
          status: 'error',
          duration: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [taskId, navigate, toast]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedTask(task || {});
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!taskId || !editedTask) return;

    try {
      await updateDoc(doc(db, 'tasks', taskId), {
        ...editedTask,
        updatedAt: new Date().toISOString(),
      });

      setTask({ ...task, ...editedTask } as Task);
      setIsEditing(false);

      toast({
        title: 'Görev güncellendi',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Görev güncellenemedi',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleDelete = async () => {
    if (!taskId) return;

    try {
      await deleteDoc(doc(db, 'tasks', taskId));
      toast({
        title: 'Görev silindi',
        status: 'success',
        duration: 3000,
      });
      navigate('/tasks');
    } catch (error) {
      toast({
        title: 'Görev silinemedi',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditedTask((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading || !task) {
    return <Text>Yükleniyor...</Text>;
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Üst Bar */}
        <HStack justify="space-between">
          <HStack spacing={4}>
            <Badge colorScheme={getPriorityColor(task.priority)} size="lg">
              {task.priority.toUpperCase()}
            </Badge>
            <Badge colorScheme={getStatusColor(task.status)} size="lg">
              {getStatusText(task.status)}
            </Badge>
          </HStack>
          <HStack spacing={2}>
            {isEditing ? (
              <>
                <IconButton
                  aria-label="Kaydet"
                  icon={<CheckIcon />}
                  colorScheme="green"
                  onClick={handleSave}
                />
                <IconButton
                  aria-label="İptal"
                  icon={<CloseIcon />}
                  colorScheme="red"
                  variant="outline"
                  onClick={handleCancel}
                />
              </>
            ) : (
              <>
                <IconButton
                  aria-label="Düzenle"
                  icon={<EditIcon />}
                  onClick={handleEdit}
                />
                <IconButton
                  aria-label="Sil"
                  icon={<DeleteIcon />}
                  colorScheme="red"
                  onClick={onOpen}
                />
              </>
            )}
          </HStack>
        </HStack>

        {/* Ana İçerik */}
        <VStack spacing={4} align="stretch">
          {isEditing ? (
            <>
              <FormControl isRequired>
                <FormLabel>Başlık</FormLabel>
                <Input
                  name="title"
                  value={editedTask.title}
                  onChange={handleChange}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Açıklama</FormLabel>
                <Textarea
                  name="description"
                  value={editedTask.description}
                  onChange={handleChange}
                  rows={4}
                />
              </FormControl>

              <HStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Öncelik</FormLabel>
                  <Select
                    name="priority"
                    value={editedTask.priority}
                    onChange={handleChange}
                  >
                    <option value="low">Düşük</option>
                    <option value="medium">Orta</option>
                    <option value="high">Yüksek</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Durum</FormLabel>
                  <Select
                    name="status"
                    value={editedTask.status}
                    onChange={handleChange}
                  >
                    <option value="todo">Yapılacak</option>
                    <option value="in-progress">Devam Ediyor</option>
                    <option value="done">Tamamlandı</option>
                  </Select>
                </FormControl>
              </HStack>

              <HStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Bitiş Tarihi</FormLabel>
                  <Input
                    name="dueDate"
                    type="date"
                    value={editedTask.dueDate?.split('T')[0]}
                    onChange={handleChange}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Tahmini Süre (Saat)</FormLabel>
                  <Input
                    name="estimatedHours"
                    type="number"
                    min="0"
                    step="0.5"
                    value={editedTask.estimatedHours || ''}
                    onChange={handleChange}
                  />
                </FormControl>
              </HStack>
            </>
          ) : (
            <>
              <Text fontSize="2xl" fontWeight="bold">
                {task.title}
              </Text>
              <Text color="gray.600" whiteSpace="pre-wrap">
                {task.description}
              </Text>
            </>
          )}
        </VStack>

        <Divider />

        {/* Sekmeler */}
        <Tabs>
          <TabList>
            <Tab>Detaylar</Tab>
            <Tab>
              Ekler ({task.attachments.length})
            </Tab>
            <Tab>
              Yorumlar ({task.comments.length})
            </Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              {/* Alt Bilgiler */}
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Text color="gray.600" fontSize="sm">
                    Oluşturulma: {format(new Date(task.createdAt), 'dd MMM yyyy HH:mm', { locale: tr })}
                  </Text>
                  <Text color="gray.600" fontSize="sm">
                    Son Güncelleme: {format(new Date(task.updatedAt), 'dd MMM yyyy HH:mm', { locale: tr })}
                  </Text>
                </HStack>

                <HStack spacing={4}>
                  <HStack>
                    <AttachmentIcon />
                    <Text fontSize="sm" color="gray.600">
                      {task.attachments.length} Ek
                    </Text>
                  </HStack>
                  <HStack>
                    <ChatIcon />
                    <Text fontSize="sm" color="gray.600">
                      {task.comments.length} Yorum
                    </Text>
                  </HStack>
                </HStack>

                {task.estimatedHours && task.actualHours && (
                  <Box>
                    <HStack justify="space-between" mb={1}>
                      <Text fontSize="sm" color="gray.600">
                        İlerleme
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {Math.min(100, (task.actualHours / task.estimatedHours) * 100).toFixed(0)}%
                      </Text>
                    </HStack>
                    <Progress
                      value={Math.min(100, (task.actualHours / task.estimatedHours) * 100)}
                      size="sm"
                      colorScheme="brand"
                      borderRadius="full"
                    />
                  </Box>
                )}
              </VStack>
            </TabPanel>

            <TabPanel>
              <TaskAttachments
                taskId={task.id}
                attachments={task.attachments}
                userId={user?.uid || ''}
              />
            </TabPanel>

            <TabPanel>
              <TaskComments
                taskId={task.id}
                comments={task.comments}
                user={{
                  uid: user?.uid || '',
                  displayName: user?.displayName,
                  photoURL: user?.photoURL,
                }}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Silme Onay Modalı */}
        <DeleteConfirmationModal
          isOpen={isOpen}
          onClose={onClose}
          onConfirm={handleDelete}
          title="Görevi Sil"
          message="Bu görevi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        />
      </VStack>
    </Box>
  );
};

// Yardımcı fonksiyonlar
const getStatusColor = (status: TaskStatus) => {
  switch (status) {
    case 'todo':
      return 'gray';
    case 'in-progress':
      return 'yellow';
    case 'done':
      return 'green';
    default:
      return 'gray';
  }
};

const getPriorityColor = (priority: TaskPriority) => {
  switch (priority) {
    case 'high':
      return 'red';
    case 'medium':
      return 'orange';
    case 'low':
      return 'green';
    default:
      return 'gray';
  }
};

const getStatusText = (status: TaskStatus) => {
  switch (status) {
    case 'todo':
      return 'Yapılacak';
    case 'in-progress':
      return 'Devam Ediyor';
    case 'done':
      return 'Tamamlandı';
    default:
      return status;
  }
};

export default TaskDetail; 