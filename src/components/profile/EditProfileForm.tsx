import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
} from '@chakra-ui/react';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

interface EditProfileFormProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: {
    displayName: string;
    email: string;
  };
  onProfileUpdate: () => void;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onProfileUpdate,
}) => {
  const [formData, setFormData] = useState({
    displayName: currentProfile.displayName,
  });
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      // Auth profilini güncelle
      await updateProfile(user, {
        displayName: formData.displayName,
      });

      // Firestore'da güncelle
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: formData.displayName,
      });

      toast({
        title: 'Profil güncellendi',
        status: 'success',
        duration: 3000,
      });

      onProfileUpdate();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Güncelleme başarısız',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Profili Düzenle</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Ad Soyad</FormLabel>
                <Input
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  placeholder="John Doe"
                />
              </FormControl>

              <FormControl>
                <FormLabel>E-posta</FormLabel>
                <Input
                  value={currentProfile.email}
                  isReadOnly
                  bg="gray.50"
                />
              </FormControl>
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
              Kaydet
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default EditProfileForm; 