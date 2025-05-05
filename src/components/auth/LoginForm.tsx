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
  Divider,
  Flex,
  Heading,
  useColorModeValue,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon, EmailIcon, LockIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import GoogleSignInButton from './GoogleSignInButton';
import { useAuth } from '../../contexts/AuthContext';

interface LoginFormData {
  email: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();

  // Dinamik renkler
  const cardBg = useColorModeValue('rgba(255, 255, 255, 0.9)', 'rgba(26, 32, 44, 0.8)');
  const inputBg = useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(45, 55, 72, 0.5)');
  const borderColor = useColorModeValue('rgba(255, 255, 255, 0.7)', 'rgba(255, 255, 255, 0.1)');

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {};

    if (!formData.email) {
      newErrors.email = 'E-posta gerekli';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi girin';
    }

    if (!formData.password) {
      newErrors.password = 'Şifre gerekli';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      await login(formData.email, formData.password);

      toast({
        title: 'Giriş başarılı',
        description: 'Hoş geldiniz! Yönlendiriliyorsunuz...',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
        variant: 'subtle',
      });

      navigate('/');
    } catch (error: any) {
      let errorMessage = 'Giriş başarısız';

      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Geçersiz e-posta adresi';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Bu hesap devre dışı bırakılmış';
          break;
        case 'auth/user-not-found':
          errorMessage = 'Kullanıcı bulunamadı';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Hatalı şifre';
          break;
      }

      toast({
        title: 'Giriş başarısız',
        description: errorMessage,
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
        variant: 'subtle',
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
    if (errors[name as keyof LoginFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  return (
    <Box
      p={{ base: 6, md: 8 }}
      maxWidth="450px"
      borderRadius="24px"
      boxShadow="xl"
      bg={cardBg}
      backdropFilter="blur(10px)"
      borderWidth="1px"
      borderColor={borderColor}
      transition="all 0.3s ease"
      _hover={{ transform: 'translateY(-5px)', boxShadow: '2xl' }}
    >
      <form onSubmit={handleEmailLogin}>
        <VStack spacing={6}>
          <Flex direction="column" align="center" mb={2}>
            <Heading 
              as="h1" 
              size="xl" 
              fontWeight="800" 
              bgGradient="linear(to-r, #3a86ff, #7209b7)" 
              bgClip="text"
              mb={2}
            >
              Hoş Geldiniz
            </Heading>
            <Text fontSize="md" color="gray.500" textAlign="center">
              AI destekli görev yönetim sisteminize giriş yapın
            </Text>
          </Flex>

          <FormControl isRequired isInvalid={!!errors.email}>
            <FormLabel fontWeight="600">E-posta</FormLabel>
            <InputGroup>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ornek@email.com"
                bg={inputBg}
                backdropFilter="blur(8px)"
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="16px"
                fontSize="md"
                py={6}
                pl={12}
                _focus={{
                  boxShadow: '0 0 0 3px rgba(58, 134, 255, 0.3)',
                  borderColor: 'blue.400',
                }}
                _hover={{
                  borderColor: 'blue.300',
                }}
              />
              <InputRightElement top="4px" left="0" width="auto" pointerEvents="none" pl={3}>
                <EmailIcon color="gray.400" w={5} h={5} />
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage>{errors.email}</FormErrorMessage>
          </FormControl>

          <FormControl isRequired isInvalid={!!errors.password}>
            <FormLabel fontWeight="600">Şifre</FormLabel>
            <InputGroup>
              <Input
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                placeholder="********"
                bg={inputBg}
                backdropFilter="blur(8px)"
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="16px"
                fontSize="md"
                py={6}
                pl={12}
                _focus={{
                  boxShadow: '0 0 0 3px rgba(58, 134, 255, 0.3)',
                  borderColor: 'blue.400',
                }}
                _hover={{
                  borderColor: 'blue.300',
                }}
              />
              <InputRightElement top="4px" left="0" width="auto" pointerEvents="none" pl={3}>
                <LockIcon color="gray.400" w={5} h={5} />
              </InputRightElement>
              <InputRightElement top="4px">
                <IconButton
                  aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                  icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                  variant="ghost"
                  color="gray.400"
                  onClick={() => setShowPassword(!showPassword)}
                  _hover={{ background: 'transparent', color: 'blue.400' }}
                />
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage>{errors.password}</FormErrorMessage>
          </FormControl>

          <Link
            color="blue.500"
            href="/forgot-password"
            alignSelf="flex-end"
            fontSize="sm"
            fontWeight="500"
            _hover={{ textDecoration: 'none', color: 'blue.600' }}
            mt={-2}
          >
            Şifremi Unuttum
          </Link>

          <Button
            type="submit"
            colorScheme="blue"
            width="full"
            isLoading={loading}
            py={6}
            borderRadius="16px"
            bgGradient="linear(to-r, #3a86ff, #4cc9f0)"
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 20px -8px rgba(58, 134, 255, 0.5)',
              bgGradient: 'linear(to-r, #3a86ff, #4cc9f0)',
              opacity: 0.9,
            }}
            _active={{
              transform: 'translateY(0)',
              boxShadow: 'none',
            }}
            fontWeight="600"
            fontSize="md"
          >
            Giriş Yap
          </Button>

          <Divider my={4} />

          <GoogleSignInButton />

          <Text fontSize="md" textAlign="center" mt={4}>
            Hesabınız yok mu?{' '}
            <Link 
              fontWeight="600" 
              color="blue.500" 
              href="/register"
              _hover={{ textDecoration: 'none', color: 'blue.600' }}
            >
              Kayıt Ol
            </Link>
          </Text>
        </VStack>
      </form>
    </Box>
  );
};

export default LoginForm; 