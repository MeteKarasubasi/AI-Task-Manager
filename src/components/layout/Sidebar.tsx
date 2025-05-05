import React from 'react';
import {
  Box,
  CloseButton,
  Flex,
  Icon,
  Text,
  BoxProps,
  VStack,
  useColorModeValue,
  Image,
  Divider,
} from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  ViewBoardsIcon,
  CalendarIcon,
  ChartPieIcon,
  CogIcon,
  UserCircleIcon,
} from '@heroicons/react/outline';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

interface SidebarProps extends BoxProps {
  onClose: () => void;
}

interface NavItemProps extends BoxProps {
  icon: any;
  children: string;
  to: string;
  isActive?: boolean;
}

const NavItem = ({ icon, children, to, isActive, ...rest }: NavItemProps) => {
  return (
    <MotionBox
      as={Link}
      to={to}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.95 }}
      style={{ width: '100%', textDecoration: 'none' }}
    >
      <Flex
        align="center"
        p="4"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        bg={isActive ? 'brand.500' : 'transparent'}
        color={isActive ? 'white' : 'gray.600'}
        _hover={{
          bg: isActive ? 'brand.600' : 'brand.50',
          color: isActive ? 'white' : 'brand.600',
        }}
        transition="all 0.2s"
        {...rest}
      >
        <Icon
          mr="4"
          fontSize="18"
          as={icon}
          color={isActive ? 'white' : 'gray.500'}
          _groupHover={{
            color: isActive ? 'white' : 'brand.500',
          }}
        />
        <Text fontSize="sm" fontWeight="medium">
          {children}
        </Text>
      </Flex>
    </MotionBox>
  );
};

const Sidebar = ({ onClose, ...rest }: SidebarProps) => {
  const location = useLocation();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  const NavItems = [
    { name: 'Dashboard', icon: HomeIcon, path: '/' },
    { name: 'Görevler', icon: ViewBoardsIcon, path: '/tasks' },
    { name: 'Takvim', icon: CalendarIcon, path: '/calendar' },
    { name: 'Analitik', icon: ChartPieIcon, path: '/analytics' },
    { name: 'Profil', icon: UserCircleIcon, path: '/profile' },
    { name: 'Ayarlar', icon: CogIcon, path: '/settings' },
  ];

  return (
    <Box
      bg={bgColor}
      borderRight="1px"
      borderRightColor={borderColor}
      pos="fixed"
      h="full"
      {...rest}
    >
      <Flex h="20" alignItems="center" justifyContent="space-between" px="8">
        <Flex alignItems="center">
          <Image src="/logo.svg" alt="Logo" boxSize="8" mr="3" />
          <Text fontSize="2xl" fontWeight="bold" color="brand.500">
            TaskMaster
          </Text>
        </Flex>
        <CloseButton display={{ base: 'flex', lg: 'none' }} onClick={onClose} />
      </Flex>

      <VStack spacing="1" align="stretch">
        <Box px="4" py="2">
          <Text fontSize="xs" fontWeight="semibold" color="gray.500" textTransform="uppercase">
            Ana Menü
          </Text>
        </Box>
        {NavItems.slice(0, 4).map((item) => (
          <NavItem
            key={item.path}
            icon={item.icon}
            to={item.path}
            isActive={location.pathname === item.path}
          >
            {item.name}
          </NavItem>
        ))}

        <Divider my="4" borderColor={borderColor} />

        <Box px="4" py="2">
          <Text fontSize="xs" fontWeight="semibold" color="gray.500" textTransform="uppercase">
            Kullanıcı
          </Text>
        </Box>
        {NavItems.slice(4).map((item) => (
          <NavItem
            key={item.path}
            icon={item.icon}
            to={item.path}
            isActive={location.pathname === item.path}
          >
            {item.name}
          </NavItem>
        ))}
      </VStack>

      {/* Version Info */}
      <Text
        position="absolute"
        bottom="4"
        width="full"
        textAlign="center"
        fontSize="xs"
        color="gray.500"
      >
        v1.0.0
      </Text>
    </Box>
  );
};

export default Sidebar; 