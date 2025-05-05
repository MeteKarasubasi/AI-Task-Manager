import React, { useState, FormEvent, ChangeEvent } from 'react';
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
  FormErrorMessage,
} from '@chakra-ui/react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { useNavigate } from 'react-router-dom';

const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const validateEmail = (email: string): boolean => {
    if (!email) {
      setError('E-posta adresi gerekli');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Geçerli bir e-posta adresi girin');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateEmail(email)) return;

    setLoading(true);
    setError('');

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
      toast({
        title: 'Şifre sıfırlama e-postası gönderildi',
        description: 'Lütfen e-posta kutunuzu kontrol edin',
        status: 'success',
        duration: 5000,
      });
    } catch (error: any) {
      let errorMessage = 'Bir hata oluştu';
      
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Geçersiz e-posta adresi';
          break;
        case 'auth/user-not-found':
          errorMessage = 'Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Çok fazla deneme yaptınız. Lütfen daha sonra tekrar deneyin';
          break;
      }

      setError(errorMessage);
      toast({
        title: 'Hata',
        description: errorMessage,
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError('');
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
          <Text fontSize="xl" fontWeight="bold" mb={4}>
            Şifre Sıfırlama
          </Text>

          {success ? (
            <VStack spacing={4}>
              <Text textAlign="center" color="green.500">
                Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.
                Lütfen e-posta kutunuzu kontrol edin.
              </Text>
              <Button onClick={() => navigate('/login')} width="full">
                Giriş Sayfasına Dön
              </Button>
            </VStack>
          ) : (
            <>
              <Text fontSize="sm" textAlign="center" mb={4}>
                E-posta adresinizi girin. Size şifre sıfırlama bağlantısı göndereceğiz.
              </Text>

              <FormControl isRequired isInvalid={!!error}>
                <FormLabel>E-posta</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="ornek@email.com"
                />
                <FormErrorMessage>{error}</FormErrorMessage>
              </FormControl>

              <Button
                type="submit"
                colorScheme="brand"
                width="full"
                isLoading={loading}
              >
                Şifre Sıfırlama Bağlantısı Gönder
              </Button>

              <Link
                color="brand.500"
                href="/login"
                fontSize="sm"
                textAlign="center"
              >
                Giriş sayfasına dön
              </Link>
            </>
          )}
        </VStack>
      </form>
    </Box>
  );
};

export default ForgotPasswordForm; 