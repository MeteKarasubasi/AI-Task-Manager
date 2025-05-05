import React, { useState, ChangeEvent } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  useToast,
  Divider,
  Container,
  Heading,
  IconButton,
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
} from '@chakra-ui/react';
import { EditIcon } from '@chakra-ui/icons';
import { useAuth } from '../../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db } from '../../config/firebase';
import WorkingHoursSettings from './WorkingHoursSettings';
import ProfilePhotoUpload from './ProfilePhotoUpload';

interface ProfileData {
  displayName: string;
}

const ProfilePage: React.FC = () => {
  const { user, userData, refreshUserData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    displayName: user?.displayName || '',
  });
  const [error, setError] = useState('');
  const toast = useToast();

  const handleEdit = () => {
    setProfileData({
      displayName: user?.displayName || '',
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      // Firebase Auth profilini güncelle
      await updateProfile(user, {
        displayName: profileData.displayName,
      });

      // Firestore dokümanını güncelle
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: profileData.displayName,
      });

      // Context'teki kullanıcı verilerini yenile
      await refreshUserData();

      setIsEditing(false);
      toast({
        title: 'Profil güncellendi',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      setError('Profil güncellenirken bir hata oluştu');
      toast({
        title: 'Hata',
        description: 'Profil güncellenirken bir hata oluştu',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setProfileData((prev) => ({
      ...prev,
      displayName: e.target.value,
    }));
  };

  if (!user || !userData) {
    return (
      <Container maxW="container.md" py={8}>
        <Text>Yükleniyor...</Text>
      </Container>
    );
  }

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8} align="stretch">
        <HStack justify="space-between">
          <Heading size="lg">Profil Bilgileri</Heading>
          {!isEditing && (
            <IconButton
              aria-label="Profili düzenle"
              icon={<EditIcon />}
              onClick={handleEdit}
            />
          )}
        </HStack>

        <Box p={6} borderWidth={1} borderRadius="lg" bg="white">
          <VStack spacing={6} align="stretch">
            <HStack spacing={6}>
              <ProfilePhotoUpload size="xl" />
              <VStack align="start" flex={1}>
                {isEditing ? (
                  <FormControl isInvalid={!!error}>
                    <FormLabel>Ad Soyad</FormLabel>
                    <Input
                      value={profileData.displayName}
                      onChange={handleNameChange}
                    />
                    <FormErrorMessage>{error}</FormErrorMessage>
                  </FormControl>
                ) : (
                  <>
                    <Text fontSize="2xl" fontWeight="bold">
                      {userData.displayName}
                    </Text>
                    <Text color="gray.600">{userData.email}</Text>
                  </>
                )}
              </VStack>
            </HStack>

            {isEditing && (
              <HStack justify="flex-end" pt={4}>
                <Button variant="ghost" onClick={handleCancel}>
                  İptal
                </Button>
                <Button
                  colorScheme="brand"
                  onClick={handleSave}
                  isLoading={loading}
                >
                  Kaydet
                </Button>
              </HStack>
            )}
          </VStack>
        </Box>

        <Divider />

        <Box>
          <Heading size="md" mb={4}>
            Çalışma Saatleri
          </Heading>
          <WorkingHoursSettings />
        </Box>
      </VStack>
    </Container>
  );
};

export default ProfilePage; 