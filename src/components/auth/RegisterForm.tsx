import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  useToast,
  InputGroup,
  InputRightElement,
  IconButton,
  HStack,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { useNavigate } from 'react-router-dom';

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
}

const RegisterForm = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Şifreler eşleşmiyor',
        status: 'error',
        duration: 3000,
      });
      setLoading(false);
      return;
    }

    try {
      // Kullanıcı oluştur
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Profil bilgilerini güncelle
      await updateProfile(userCredential.user, {
        displayName: formData.displayName,
      });

      // Firestore'da kullanıcı dokümanı oluştur
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: formData.email,
        displayName: formData.displayName,
        createdAt: new Date().toISOString(),
        photoURL: null,
        workingHours: {
          start: '09:00',
          end: '17:00',
        },
      });

      toast({
        title: 'Kayıt başarılı!',
        description: 'Hesabınız oluşturuldu.',
        status: 'success',
        duration: 3000,
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Kayıt başarısız',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      as="form"
      onSubmit={handleSubmit}
      p={8}
      maxWidth="400px"
      borderWidth={1}
      borderRadius="lg"
      boxShadow="lg"
      bg="white"
      className="glass"
    >
      <VStack spacing={4} align="stretch">
        <Text fontSize="2xl" fontWeight="bold" textAlign="center" mb={4}>
          Hesap Oluştur
        </Text>

        <FormControl isRequired>
          <FormLabel>Ad Soyad</FormLabel>
          <Input
            name="displayName"
            value={formData.displayName}
            onChange={handleChange}
            placeholder="John Doe"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>E-posta</FormLabel>
          <Input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="ornek@email.com"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Şifre</FormLabel>
          <InputGroup>
            <Input
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              placeholder="********"
            />
            <InputRightElement>
              <IconButton
                aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                onClick={() => setShowPassword(!showPassword)}
                variant="ghost"
                size="sm"
              />
            </InputRightElement>
          </InputGroup>
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Şifre Tekrar</FormLabel>
          <Input
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="********"
          />
        </FormControl>

        <Button
          type="submit"
          colorScheme="brand"
          size="lg"
          fontSize="md"
          isLoading={loading}
        >
          Kayıt Ol
        </Button>

        <HStack justify="center" fontSize="sm">
          <Text>Zaten hesabınız var mı?</Text>
          <Button
            variant="link"
            colorScheme="brand"
            onClick={() => navigate('/login')}
          >
            Giriş Yap
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default RegisterForm; 