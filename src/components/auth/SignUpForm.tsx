import React, { useState } from 'react';
import {
  Box,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  Link,
  useToast,
  InputGroup,
  InputRightElement,
  IconButton,
  FormErrorMessage,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { useNavigate } from 'react-router-dom';

interface SignUpFormData {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const SignUpForm: React.FC = () => {
  const [formData, setFormData] = useState<SignUpFormData>({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<SignUpFormData>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const newErrors: Partial<SignUpFormData> = {};

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Ad Soyad gerekli';
    }

    if (!formData.email) {
      newErrors.email = 'E-posta gerekli';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi girin';
    }

    if (!formData.password) {
      newErrors.password = 'Şifre gerekli';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalı';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Firebase Auth ile kullanıcı oluştur
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Kullanıcı profilini güncelle
      await updateProfile(userCredential.user, {
        displayName: formData.displayName,
      });

      // Firestore'da kullanıcı dokümanı oluştur
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        displayName: formData.displayName,
        email: formData.email,
        createdAt: new Date().toISOString(),
        photoURL: null,
        workingHours: {
          start: '09:00',
          end: '17:00',
          workDays: [1, 2, 3, 4, 5], // Pazartesi-Cuma
        },
      });

      toast({
        title: 'Hesap oluşturuldu',
        description: 'Başarıyla kayıt oldunuz!',
        status: 'success',
        duration: 3000,
      });

      navigate('/');
    } catch (error: any) {
      let errorMessage = 'Bir hata oluştu';

      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Bu e-posta adresi zaten kullanımda';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Geçersiz e-posta adresi';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'E-posta/şifre girişi devre dışı';
          break;
        case 'auth/weak-password':
          errorMessage = 'Şifre çok zayıf';
          break;
      }

      toast({
        title: 'Kayıt başarısız',
        description: errorMessage,
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
    // Kullanıcı yazmaya başladığında ilgili hatayı temizle
    if (errors[name as keyof SignUpFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  return (
    <Box
      p={8}
      maxWidth="400px"
      borderWidth={1}
      borderRadius="lg"
      boxShadow="lg"
      bg="white"
    >
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl isRequired isInvalid={!!errors.displayName}>
            <FormLabel>Ad Soyad</FormLabel>
            <Input
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              placeholder="Ad Soyad"
            />
            <FormErrorMessage>{errors.displayName}</FormErrorMessage>
          </FormControl>

          <FormControl isRequired isInvalid={!!errors.email}>
            <FormLabel>E-posta</FormLabel>
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="ornek@email.com"
            />
            <FormErrorMessage>{errors.email}</FormErrorMessage>
          </FormControl>

          <FormControl isRequired isInvalid={!!errors.password}>
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
                  variant="ghost"
                  onClick={() => setShowPassword(!showPassword)}
                />
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage>{errors.password}</FormErrorMessage>
          </FormControl>

          <FormControl isRequired isInvalid={!!errors.confirmPassword}>
            <FormLabel>Şifre Tekrar</FormLabel>
            <InputGroup>
              <Input
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="********"
              />
              <InputRightElement>
                <IconButton
                  aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                  icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                  variant="ghost"
                  onClick={() => setShowPassword(!showPassword)}
                />
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
          </FormControl>

          <Button
            type="submit"
            colorScheme="brand"
            width="full"
            isLoading={loading}
          >
            Kayıt Ol
          </Button>

          <Text fontSize="sm">
            Zaten hesabınız var mı?{' '}
            <Link color="brand.500" href="/login">
              Giriş Yap
            </Link>
          </Text>
        </VStack>
      </form>
    </Box>
  );
};

export default SignUpForm; 