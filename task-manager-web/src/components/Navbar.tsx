import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GroupIcon from '@mui/icons-material/Group';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';

const Navbar = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMobileMenuAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      handleMenuClose();
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Çıkış yapılırken hata oluştu:', error);
    }
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Tasks', icon: <AssignmentIcon />, path: '/tasks' },
    { text: 'Meetings', icon: <GroupIcon />, path: '/meetings' },
  ];

  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
      PaperProps={{
        elevation: 3,
        sx: { mt: 1.5, minWidth: 180 }
      }}
    >
      <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
        <AccountCircleIcon sx={{ mr: 2 }} />
        Profile
      </MenuItem>
      <Divider />
      <MenuItem onClick={handleLogout}>
        <LogoutIcon sx={{ mr: 2 }} />
        Logout
      </MenuItem>
    </Menu>
  );

  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMenuAnchorEl}
      open={Boolean(mobileMenuAnchorEl)}
      onClose={handleMenuClose}
      PaperProps={{
        elevation: 3,
        sx: { mt: 1.5, minWidth: 200 }
      }}
    >
      {menuItems.map((item) => (
        <MenuItem
          key={item.text}
          onClick={() => { handleMenuClose(); navigate(item.path); }}
        >
          {item.icon}
          <Typography sx={{ ml: 2 }}>{item.text}</Typography>
        </MenuItem>
      ))}
      <Divider />
      <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
        <AccountCircleIcon sx={{ mr: 2 }} />
        Profile
      </MenuItem>
      <MenuItem onClick={handleLogout}>
        <LogoutIcon sx={{ mr: 2 }} />
        Logout
      </MenuItem>
    </Menu>
  );

  return (
    <AppBar position="static" elevation={1}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {isMobile && currentUser && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleMobileMenuOpen}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography
            variant="h6"
            component="div"
            sx={{
              display: 'flex',
              alignItems: 'center',
              fontWeight: 600,
              letterSpacing: '0.5px',
            }}
          >
            AI Task Manager
          </Typography>
        </Box>

        {currentUser ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {!isMobile && (
              <Box sx={{ display: 'flex', mr: 2 }}>
                {menuItems.map((item) => (
                  <Button
                    key={item.text}
                    color="inherit"
                    startIcon={item.icon}
                    onClick={() => navigate(item.path)}
                    sx={{ mx: 1 }}
                  >
                    {item.text}
                  </Button>
                ))}
              </Box>
            )}
            <IconButton
              onClick={handleProfileMenuOpen}
              sx={{
                padding: 0.5,
                border: '2px solid rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  border: '2px solid rgba(255, 255, 255, 0.5)',
                },
              }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: 'primary.dark',
                  fontSize: '1rem',
                }}
              >
                {currentUser.email?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
          </Box>
        ) : (
          <Box>
            <Button
              color="inherit"
              onClick={() => navigate('/login')}
              sx={{ mr: 1 }}
            >
              Login
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => navigate('/signup')}
              sx={{
                borderColor: 'rgba(255, 255, 255, 0.5)',
                '&:hover': {
                  borderColor: 'rgba(255, 255, 255, 0.8)',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Sign Up
            </Button>
          </Box>
        )}
        {renderMenu}
        {renderMobileMenu}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 