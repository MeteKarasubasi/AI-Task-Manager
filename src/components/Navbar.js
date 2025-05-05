import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  Badge,
  ListItemAvatar,
  Fade,
  Chip,
  alpha
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Assignment as TaskIcon,
  Group as MeetingIcon,
  Person as ProfileIcon,
  Notifications as NotificationIcon,
  Logout as LogoutIcon,
  Close as CloseIcon,
  Settings as SettingsIcon,
  QuestionMark as HelpIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElNotifications, setAnchorElNotifications] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Yeni Görev', message: 'Size yeni bir görev atandı', read: false, time: '10dk önce' },
    { id: 2, title: 'Toplantı', message: '15:00 toplantısı için hatırlatma', read: false, time: '30dk önce' },
  ]);

  // Kullanıcı menüsünü aç/kapat
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  
  // Bildirim menüsünü aç/kapat
  const handleOpenNotificationsMenu = (event) => {
    setAnchorElNotifications(event.currentTarget);
  };

  const handleCloseNotificationsMenu = () => {
    setAnchorElNotifications(null);
  };

  // Drawer aç/kapat
  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  // Çıkış yap
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Çıkış yapılırken hata oluştu:', error);
    }
    handleCloseUserMenu();
  };

  // Ana navigasyon öğeleri
  const navItems = [
    { name: 'Gösterge Paneli', path: '/', icon: <DashboardIcon /> },
    { name: 'Görevler', path: '/tasks', icon: <TaskIcon /> },
    { name: 'Toplantılar', path: '/meetings', icon: <MeetingIcon /> },
  ];

  // Aktif sayfa kontrolü
  const isActive = (path) => location.pathname === path;

  // Okunmamış bildirim sayısı
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;
  
  // Bildirim okundu olarak işaretle
  const markNotificationAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? {...notification, read: true} : notification
      )
    );
  };

  // Mobil için çekmece menü içeriği
  const drawerContent = (
    <Box 
      sx={{ 
        width: 280, 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        background: 'linear-gradient(180deg, rgba(67, 97, 238, 0.03) 0%, rgba(67, 97, 238, 0) 100%)'
      }} 
      role="presentation"
    >
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          p: 2,
          background: 'linear-gradient(90deg, rgba(67, 97, 238, 0.12) 0%, rgba(76, 201, 240, 0.06) 100%)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box 
            component="img"
            src="/logo.svg"
            alt="Logo"
            sx={{ height: 32, width: 32, mr: 1.5 }}
          />
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', background: 'linear-gradient(90deg, #4361ee 0%, #4cc9f0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              AI Task Manager
          </Typography>
        </Box>
        <IconButton onClick={toggleDrawer(false)} sx={{ color: 'text.secondary' }}>
          <CloseIcon />
        </IconButton>
      </Box>
      
      <Divider />
      
      {currentUser && (
        <Box 
          sx={{ 
            p: 2.5, 
            background: 'linear-gradient(135deg, rgba(67, 97, 238, 0.04) 0%, rgba(76, 201, 240, 0.02) 100%)',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar 
              sx={{ 
                width: 48, 
                height: 48, 
                bgcolor: 'primary.main', 
                mr: 2,
                boxShadow: '0 4px 8px rgba(67, 97, 238, 0.25)'
              }}
              alt={currentUser.displayName || currentUser.email}
              src={currentUser.photoURL}
            >
              {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : currentUser.email[0].toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.25 }}>
                {currentUser.displayName || 'Kullanıcı'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                {currentUser.email}
              </Typography>
            </Box>
          </Box>
          
          <Button 
            component={RouterLink}
              to="/profile"
            fullWidth
            variant="outlined"
            startIcon={<ProfileIcon />}
            size="small"
            sx={{ mt: 2, borderRadius: 2 }}
          >
            Profil Görüntüle
          </Button>
        </Box>
      )}
      
      <List sx={{ px: 1, py: 2, flexGrow: 1 }}>
        {navItems.map((item) => (
          <ListItem key={item.name} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton 
              component={RouterLink} 
              to={item.path}
              selected={isActive(item.path)}
              sx={{
                py: 1.25,
                borderRadius: 2,
                '&.Mui-selected': {
                  bgcolor: 'primary.light',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.main',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  }
                },
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                },
              }}
            >
              <ListItemIcon sx={{ 
                minWidth: 40, 
                color: isActive(item.path) ? 'inherit' : 'primary.main' 
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.name} 
                primaryTypographyProps={{ 
                  fontWeight: isActive(item.path) ? 600 : 500,
                  fontSize: '0.9rem'
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      <Divider />
      
      <List sx={{ px: 1, py: 1 }}>
        <ListItem disablePadding>
          <ListItemButton 
            sx={{
              py: 1.25,
              borderRadius: 2,
              color: 'error.main',
              '&:hover': {
                bgcolor: alpha(theme.palette.error.main, 0.08),
              },
            }}
              onClick={handleLogout}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'error.main' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Çıkış Yap" 
              primaryTypographyProps={{ 
                fontWeight: 500,
                fontSize: '0.9rem'
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar 
        position="sticky" 
        color="inherit" 
        elevation={0} 
        sx={{ 
          backdropFilter: 'blur(10px)',
          bgcolor: 'rgba(255, 255, 255, 0.8)',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
        component={motion.div}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: { xs: '64px' } }}>
            {/* Mobil menü butonu */}
            {isMobile && (
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={toggleDrawer(true)}
                sx={{ 
                  mr: 1,
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                  },
                }}
              >
                <MenuIcon />
              </IconButton>
            )}

            {/* Logo */}
            <Typography
              variant="h6"
              noWrap
              component={RouterLink}
              to="/"
              sx={{
                mr: 2,
                display: 'flex',
                fontWeight: 700,
                alignItems: 'center',
                textDecoration: 'none',
                color: 'primary.main',
                background: 'linear-gradient(90deg, #4361ee 0%, #4cc9f0 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              <Box 
                component="img"
                src="/logo.svg"
                sx={{ 
                  height: 26, 
                  width: 26, 
                  mr: 1,
                  display: { xs: 'none', sm: 'inline-block' }
                }}
                alt="Logo"
              />
              AI Task Manager
            </Typography>

            {/* Masaüstü Navigasyon Linkleri */}
            {!isMobile && (
              <Box sx={{ flexGrow: 1, display: 'flex', ml: 4 }}>
                {navItems.map((item) => (
                  <Button
                    key={item.name}
                    component={RouterLink}
                    to={item.path}
                    startIcon={item.icon}
                    sx={{
                      mx: 1,
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      color: isActive(item.path) ? 'primary.main' : 'text.primary',
                      fontWeight: isActive(item.path) ? 600 : 500,
                      transition: 'all 0.2s',
                      position: 'relative',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        transform: 'translateY(-2px)',
                      },
                      ...(isActive(item.path) && {
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          bottom: 6,
                          left: '20%',
                          width: '60%',
                          height: '3px',
                          bgcolor: 'primary.main',
                          borderRadius: '3px',
                        },
                      }),
                    }}
                  >
                    {item.name}
                  </Button>
                ))}
              </Box>
            )}

            {/* Sağ Taraf - Arama, Bildirimler ve Kullanıcı */}
            <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center' }}>
              {/* Arama Butonu */}
              {!isMobile && (
                <Tooltip title="Ara">
                  <IconButton 
                    sx={{ 
                      mx: 0.5,
                      color: 'text.secondary',
                      bgcolor: theme.palette.grey[50],
                      '&:hover': {
                        bgcolor: theme.palette.grey[100],
                      }
                    }}
                  >
                    <SearchIcon />
                  </IconButton>
                </Tooltip>
              )}
              
              {/* Bildirim İkonu */}
              <Tooltip title="Bildirimler">
                <IconButton 
                  sx={{ 
                    mx: 0.5,
                    color: 'text.secondary',
                    bgcolor: theme.palette.grey[50],
                    '&:hover': {
                      bgcolor: theme.palette.grey[100],
                    }
                  }}
                  onClick={handleOpenNotificationsMenu}
                >
                  <Badge badgeContent={unreadNotificationsCount} color="error">
                    <NotificationIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
              
              {/* Bildirim Menüsü */}
              <Menu
                sx={{ mt: '45px' }}
                id="notifications-menu"
                anchorEl={anchorElNotifications}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElNotifications)}
                onClose={handleCloseNotificationsMenu}
                TransitionComponent={Fade}
                PaperProps={{
                  elevation: 2,
                  sx: {
                    borderRadius: 2,
                    minWidth: 320,
                    maxWidth: 400,
                    maxHeight: 'calc(100vh - 200px)',
                    overflowY: 'auto',
                    '&::-webkit-scrollbar': {
                      width: '8px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.2),
                      borderRadius: '4px',
                    }
                  }
                }}
              >
                <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="subtitle1" fontWeight={600}>Bildirimler</Typography>
                </Box>
                
                {notifications.length === 0 ? (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Bildiriminiz bulunmuyor
                    </Typography>
                  </Box>
                ) : (
                  <List sx={{ py: 0 }}>
                    {notifications.map((notification) => (
                      <React.Fragment key={notification.id}>
                        <ListItem 
                          alignItems="flex-start" 
                          sx={{
                            px: 2,
                            py: 1.5,
                            bgcolor: notification.read ? 'transparent' : alpha(theme.palette.primary.main, 0.05),
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.08),
                            }
                          }}
                          dense
                          onClick={() => markNotificationAsRead(notification.id)}
                          button
                        >
                          <ListItemAvatar sx={{ minWidth: 40 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: notification.read ? 'grey.300' : 'primary.main' }}>
                              <NotificationIcon fontSize="small" />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" fontWeight={notification.read ? 400 : 600}>
                                  {notification.title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {notification.time}
                                </Typography>
                              </Box>
                            }
                            secondary={
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                {notification.message}
                              </Typography>
                            }
                          />
                        </ListItem>
                        <Divider component="li" />
                      </React.Fragment>
                    ))}
                    <Box sx={{ p: 1.5, textAlign: 'center' }}>
                      <Button
                        size="small"
                        color="primary"
                        sx={{ borderRadius: 2, fontWeight: 500, fontSize: '0.8rem' }}
                      >
                        Tüm Bildirimleri Görüntüle
                      </Button>
                    </Box>
                  </List>
                )}
              </Menu>

              {/* Kullanıcı Menüsü */}
              <Tooltip title="Kullanıcı menüsü">
                <IconButton 
                  onClick={handleOpenUserMenu} 
                  sx={{ 
                    p: 0.5, 
                    ml: 1,
                    border: '2px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      borderColor: 'primary.main',
                    }
                  }}
                >
                  <Avatar 
                    alt={currentUser?.displayName || currentUser?.email}
                    src={currentUser?.photoURL}
                    sx={{ 
                      bgcolor: 'primary.main', 
                      width: 34, 
                      height: 34,
                      fontWeight: 'bold'
                    }}
                  >
                    {currentUser?.displayName 
                      ? currentUser.displayName[0].toUpperCase() 
                      : currentUser?.email[0].toUpperCase()}
                  </Avatar>
                </IconButton>
              </Tooltip>
              
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
                TransitionComponent={Fade}
                PaperProps={{
                  elevation: 2,
                  sx: {
                    borderRadius: 2,
                    overflow: 'visible',
                    mt: 1.5,
                    minWidth: 230,
                    '&:before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      top: 0,
                      right: 15,
                      width: 10,
                      height: 10,
                      bgcolor: 'background.paper',
                      transform: 'translateY(-50%) rotate(45deg)',
                      zIndex: 0,
                    },
                  }
                }}
              >
                {currentUser && (
                  <Box 
                    sx={{ 
                      px: 2, 
                      py: 1.5, 
                      borderBottom: '1px solid', 
                      borderColor: 'divider',
                      background: 'linear-gradient(135deg, rgba(67, 97, 238, 0.04) 0%, rgba(76, 201, 240, 0.02) 100%)',
                    }}
                  >
                    <Typography sx={{ fontWeight: 600 }}>
                      {currentUser.displayName || 'Kullanıcı'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 1 }}>
                      {currentUser.email}
                    </Typography>
                    <Chip 
                      label="Premium Üye" 
                      size="small"
                      color="primary"
                      sx={{ 
                        height: 20, 
                        fontSize: '0.65rem',
                        background: 'linear-gradient(90deg, #4361ee 0%, #4cc9f0 100%)'
                      }}
                    />
                  </Box>
                )}
                
                <MenuItem component={RouterLink} to="/profile" onClick={handleCloseUserMenu} sx={{ borderRadius: 1, m: 0.5 }}>
                  <ListItemIcon>
                    <ProfileIcon fontSize="small" color="primary" />
                  </ListItemIcon>
                  <Typography variant="body2">Profil</Typography>
                </MenuItem>
                
                <MenuItem onClick={handleCloseUserMenu} sx={{ borderRadius: 1, m: 0.5 }}>
                  <ListItemIcon>
                    <SettingsIcon fontSize="small" color="primary" />
                  </ListItemIcon>
                  <Typography variant="body2">Ayarlar</Typography>
                </MenuItem>
                
                <MenuItem onClick={handleCloseUserMenu} sx={{ borderRadius: 1, m: 0.5 }}>
                  <ListItemIcon>
                    <HelpIcon fontSize="small" color="primary" />
                  </ListItemIcon>
                  <Typography variant="body2">Yardım</Typography>
                </MenuItem>
                
                <Divider sx={{ my: 0.5 }} />
                
                <MenuItem onClick={handleLogout} sx={{ borderRadius: 1, m: 0.5 }}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" color="error" />
                  </ListItemIcon>
                  <Typography variant="body2" color="error.main">Çıkış Yap</Typography>
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobil Çekmece Menü */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        PaperProps={{
          sx: {
            borderTopRightRadius: 16,
            borderBottomRightRadius: 16,
            overflow: 'hidden',
          }
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
}

export default Navbar; 