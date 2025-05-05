import React from 'react';
import {
  Box,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
  HStack,
  Avatar,
  useColorMode,
  useColorModeValue,
  Input,
  InputGroup,
  InputLeftElement,
  Tooltip,
  Badge,
  Divider,
} from '@chakra-ui/react';
import {
  BellIcon,
  SearchIcon,
  MoonIcon,
  SunIcon,
} from '@chakra-ui/icons';
import { motion } from 'framer-motion';

const MotionFlex = motion(Flex);

const Header = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const searchBg = useColorModeValue('gray.100', 'gray.700');
  const searchHoverBg = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box
      as="header"
      bg={bg}
      borderBottom="1px"
      borderBottomColor={borderColor}
      position="sticky"
      top="0"
      zIndex="sticky"
      className="glass"
    >
      <MotionFlex
        h="16"
        alignItems="center"
        mx="auto"
        px="4"
        maxW="7xl"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {/* Search */}
        <Box flex="1" maxW="xl">
          <InputGroup size="md">
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Görev ara..."
              variant="filled"
              bg={searchBg}
              _hover={{ bg: searchHoverBg }}
              _focus={{
                bg: searchHoverBg,
                borderColor: 'brand.400',
              }}
              borderRadius="full"
            />
          </InputGroup>
        </Box>

        {/* Right Section */}
        <HStack spacing="4" ml="4">
          {/* Theme Toggle */}
          <Tooltip label={`${colorMode === 'light' ? 'Karanlık' : 'Aydınlık'} tema`}>
            <IconButton
              icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              variant="ghost"
              aria-label="Tema değiştir"
              onClick={toggleColorMode}
              borderRadius="full"
            />
          </Tooltip>

          {/* Notifications */}
          <Menu>
            <Tooltip label="Bildirimler">
              <MenuButton
                as={IconButton}
                icon={<BellIcon />}
                variant="ghost"
                aria-label="Bildirimler"
                position="relative"
                borderRadius="full"
              >
                <Badge
                  position="absolute"
                  top="2"
                  right="2"
                  px="2"
                  py="1"
                  fontSize="xs"
                  borderRadius="full"
                  colorScheme="red"
                >
                  3
                </Badge>
              </MenuButton>
            </Tooltip>
            <MenuList p="2" minW="320px">
              <Text px="3" py="2" fontWeight="medium">
                Bildirimler
              </Text>
              <Divider my="2" />
              {[
                {
                  title: 'Yeni görev atandı',
                  description: '"Q2 Planlaması" görevi size atandı.',
                  time: '2 dakika önce',
                  type: 'task',
                },
                {
                  title: 'Toplantı hatırlatması',
                  description: 'Müşteri görüşmesi 30 dakika içinde başlayacak.',
                  time: '30 dakika önce',
                  type: 'meeting',
                },
                {
                  title: 'Görev tamamlandı',
                  description: '"Rapor hazırlama" görevi tamamlandı.',
                  time: '1 saat önce',
                  type: 'completed',
                },
              ].map((notification, index) => (
                <MenuItem
                  key={index}
                  py="2"
                  px="4"
                  borderRadius="lg"
                  _hover={{ bg: searchBg }}
                >
                  <Box>
                    <HStack>
                      <Text fontWeight="medium" fontSize="sm">
                        {notification.title}
                      </Text>
                      <Badge
                        colorScheme={
                          notification.type === 'task'
                            ? 'blue'
                            : notification.type === 'meeting'
                            ? 'yellow'
                            : 'green'
                        }
                        fontSize="xs"
                      >
                        {notification.type}
                      </Badge>
                    </HStack>
                    <Text fontSize="xs" color="gray.500" mt="1">
                      {notification.description}
                    </Text>
                    <Text fontSize="xs" color="gray.400" mt="1">
                      {notification.time}
                    </Text>
                  </Box>
                </MenuItem>
              ))}
              <Divider my="2" />
              <MenuItem
                py="2"
                px="4"
                borderRadius="lg"
                _hover={{ bg: searchBg }}
                fontWeight="medium"
                fontSize="sm"
                color="brand.500"
              >
                Tüm bildirimleri gör
              </MenuItem>
            </MenuList>
          </Menu>

          {/* User Profile */}
          <Menu>
            <MenuButton>
              <HStack spacing="3">
                <Avatar
                  size="sm"
                  name="John Doe"
                  src="https://bit.ly/dan-abramov"
                />
                <Box display={{ base: 'none', md: 'block' }}>
                  <Text fontWeight="medium" fontSize="sm">
                    John Doe
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    john@example.com
                  </Text>
                </Box>
              </HStack>
            </MenuButton>
            <MenuList>
              <MenuItem>Profil</MenuItem>
              <MenuItem>Ayarlar</MenuItem>
              <Divider />
              <MenuItem color="red.500">Çıkış Yap</MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </MotionFlex>
    </Box>
  );
};

export default Header; 