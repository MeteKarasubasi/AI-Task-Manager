import React from 'react';
import {
  Box,
  Flex,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerContent,
  useColorModeValue,
} from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  return (
    <Box minH="100vh" bg={bgColor} className="fade-in">
      {/* Sidebar - Desktop */}
      <Sidebar
        onClose={onClose}
        display={{ base: 'none', lg: 'block' }}
        w={{ base: 'full', lg: '280px' }}
        className="slide-in"
      />

      {/* Sidebar - Mobile */}
      <Drawer
        autoFocus={false}
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full"
      >
        <DrawerContent>
          <Sidebar onClose={onClose} w="full" />
        </DrawerContent>
      </Drawer>

      {/* Mobile nav */}
      <IconButton
        aria-label="Menu"
        display={{ base: 'flex', lg: 'none' }}
        onClick={onOpen}
        variant="ghost"
        size="lg"
        icon={<HamburgerIcon />}
        position="fixed"
        top="4"
        left="4"
        zIndex="overlay"
        className="glass"
      />

      {/* Main content */}
      <Box
        ml={{ base: 0, lg: '280px' }}
        transition=".3s ease"
        minH="100vh"
        position="relative"
      >
        <Header />
        <Box
          as="main"
          p={{ base: 4, lg: 8 }}
          maxW="7xl"
          mx="auto"
          minH="calc(100vh - 80px)"
        >
          <Flex
            direction="column"
            gap={8}
            className="fade-in"
            w="full"
            h="full"
          >
            {children}
          </Flex>
        </Box>
      </Box>
    </Box>
  );
};

export default Layout; 