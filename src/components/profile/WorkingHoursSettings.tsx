import React, { useState, ChangeEvent } from 'react';
import {
  Box,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  Checkbox,
  SimpleGrid,
  Text,
} from '@chakra-ui/react';
import { useAuth } from '../../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface WorkingHours {
  start: string;
  end: string;
  workDays: number[];
}

const DAYS = [
  { id: 0, name: 'Pazar' },
  { id: 1, name: 'Pazartesi' },
  { id: 2, name: 'Salı' },
  { id: 3, name: 'Çarşamba' },
  { id: 4, name: 'Perşembe' },
  { id: 5, name: 'Cuma' },
  { id: 6, name: 'Cumartesi' },
];

const WorkingHoursSettings: React.FC = () => {
  const { user, userData, refreshUserData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [workingHours, setWorkingHours] = useState<WorkingHours>({
    start: userData?.workingHours?.start || '09:00',
    end: userData?.workingHours?.end || '17:00',
    workDays: userData?.workingHours?.workDays || [1, 2, 3, 4, 5],
  });
  const toast = useToast();

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        workingHours,
      });

      await refreshUserData();

      toast({
        title: 'Çalışma saatleri güncellendi',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Çalışma saatleri güncellenirken bir hata oluştu',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleWorkDay = (dayId: number) => {
    setWorkingHours((prev) => {
      const newWorkDays = prev.workDays.includes(dayId)
        ? prev.workDays.filter((id) => id !== dayId)
        : [...prev.workDays, dayId].sort();

      return {
        ...prev,
        workDays: newWorkDays,
      };
    });
  };

  const handleTimeChange = (e: ChangeEvent<HTMLInputElement>, field: 'start' | 'end') => {
    setWorkingHours((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  return (
    <Box p={6} borderWidth={1} borderRadius="lg" bg="white">
      <VStack spacing={6} align="stretch">
        <HStack spacing={4}>
          <FormControl>
            <FormLabel>Başlangıç Saati</FormLabel>
            <Input
              type="time"
              value={workingHours.start}
              onChange={(e) => handleTimeChange(e, 'start')}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Bitiş Saati</FormLabel>
            <Input
              type="time"
              value={workingHours.end}
              onChange={(e) => handleTimeChange(e, 'end')}
            />
          </FormControl>
        </HStack>

        <Box>
          <Text mb={2} fontWeight="medium">
            Çalışma Günleri
          </Text>
          <SimpleGrid columns={[2, 3, 4]} spacing={3}>
            {DAYS.map((day) => (
              <Checkbox
                key={day.id}
                isChecked={workingHours.workDays.includes(day.id)}
                onChange={() => toggleWorkDay(day.id)}
              >
                {day.name}
              </Checkbox>
            ))}
          </SimpleGrid>
        </Box>

        <Button
          colorScheme="brand"
          onClick={handleSave}
          isLoading={loading}
          alignSelf="flex-end"
        >
          Kaydet
        </Button>
      </VStack>
    </Box>
  );
};

export default WorkingHoursSettings; 