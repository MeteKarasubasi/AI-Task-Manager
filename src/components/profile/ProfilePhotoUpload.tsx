import React, { useState, useRef, ChangeEvent } from 'react';
import {
  Box,
  IconButton,
  useToast,
  Input,
  Avatar,
  Spinner,
  VStack,
  Text,
} from '@chakra-ui/react';
import { EditIcon } from '@chakra-ui/icons';
import { useAuth } from '../../context/AuthContext';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { storage, db } from '../../config/firebase';

interface ProfilePhotoUploadProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const ProfilePhotoUpload: React.FC<ProfilePhotoUploadProps> = ({ size = 'xl' }) => {
  const { user, refreshUserData } = useAuth();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Dosya tipi kontrolü
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Hata',
        description: 'Lütfen geçerli bir resim dosyası seçin',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    // Dosya boyutu kontrolü (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Hata',
        description: 'Dosya boyutu 5MB\'dan küçük olmalıdır',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setUploading(true);

    // Dosya adını unique yap
    const fileExtension = file.name.split('.').pop();
    const fileName = `${user.uid}_${Date.now()}.${fileExtension}`;

    // Storage referansı
    const storageRef = ref(storage, `profile-photos/${fileName}`);

    // Dosyayı yükle
    uploadBytes(storageRef, file)
      .then((snapshot) => getDownloadURL(snapshot.ref))
      .then(async (downloadURL) => {
        // Auth profilini güncelle
        await updateProfile(user, {
          photoURL: downloadURL,
        });

        // Firestore'u güncelle
        await updateDoc(doc(db, 'users', user.uid), {
          photoURL: downloadURL,
        });

        // Context'i güncelle
        await refreshUserData();

        toast({
          title: 'Başarılı',
          description: 'Profil fotoğrafı güncellendi',
          status: 'success',
          duration: 3000,
        });
      })
      .catch((error) => {
        console.error('Error uploading photo:', error);
        toast({
          title: 'Hata',
          description: 'Fotoğraf yüklenirken bir hata oluştu',
          status: 'error',
          duration: 3000,
        });
      })
      .finally(() => {
        setUploading(false);
      });
  };

  return (
    <Box position="relative" display="inline-block">
      {uploading ? (
        <VStack
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          justify="center"
          align="center"
          bg="blackAlpha.300"
          borderRadius="full"
          zIndex={2}
        >
          <Spinner color="brand.500" />
          <Text fontSize="xs" color="brand.500">
            Yükleniyor...
          </Text>
        </VStack>
      ) : (
        <IconButton
          aria-label="Fotoğraf değiştir"
          icon={<EditIcon />}
          size="sm"
          colorScheme="brand"
          position="absolute"
          bottom="0"
          right="0"
          rounded="full"
          onClick={() => fileInputRef.current?.click()}
          zIndex={2}
        />
      )}

      <Avatar
        size={size}
        name={user?.displayName || undefined}
        src={user?.photoURL || undefined}
      />

      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        display="none"
        onChange={handleFileSelect}
      />
    </Box>
  );
};

export default ProfilePhotoUpload; 