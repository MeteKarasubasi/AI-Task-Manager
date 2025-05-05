import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  VStack,
  useToast,
  HStack,
} from '@chakra-ui/react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { TaskPriority, TaskStatus } from '../../types/task';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TaskFormData {
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  estimatedHours?: number;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    dueDate: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const taskData = {
        ...formData,
        createdBy: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        assignedTo: [user.uid],
        attachments: [],
        comments: [],
        tags: [],
      };

      await addDoc(collection(db, 'tasks'), taskData);

      toast({
        title: 'Görev oluşturuldu',
        status: 'success',
        duration: 3000,
      });

      onClose();
    } catch (error: any) {
      toast({
        title: 'Görev oluşturulamadı',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>Yeni Görev Oluştur</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Başlık</FormLabel>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Görev başlığı"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Açıklama</FormLabel>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Görev açıklaması"
                  rows={4}
                />
              </FormControl>

              <HStack spacing={4} width="100%">
                <FormControl isRequired>
                  <FormLabel>Öncelik</FormLabel>
                  <Select
                    name="priority"
                    value={formData.priority}
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
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="todo">Yapılacak</option>
                    <option value="in-progress">Devam Ediyor</option>
                    <option value="done">Tamamlandı</option>
                  </Select>
                </FormControl>
              </HStack>

              <HStack spacing={4} width="100%">
                <FormControl isRequired>
                  <FormLabel>Bitiş Tarihi</FormLabel>
                  <Input
                    name="dueDate"
                    type="date"
                    value={formData.dueDate}
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
                    value={formData.estimatedHours || ''}
                    onChange={handleChange}
                  />
                </FormControl>
              </HStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              İptal
            </Button>
            <Button
              type="submit"
              colorScheme="brand"
              isLoading={loading}
            >
              Oluştur
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default CreateTaskModal; 