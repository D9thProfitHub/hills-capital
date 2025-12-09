import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  Tooltip,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon as MuiListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  AccountCircle,
  Login,
  School,
  SignalCellularAlt,
  People,
  AttachMoney,
  Menu as MenuIcon,
  Dashboard,
  BarChart,
  Settings,
  Logout,
  Policy,
  Description,
  Memory as MemoryIcon,
  GroupAdd as GroupAddIcon,
  Home
} from '@mui/icons-material';

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isMenuOpen = Boolean(anchorEl);
  const { user, isAuthenticated, logout } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const pages = [
    { name: 'Home', path: '/', icon: <Home fontSize="small" /> },
    { name: 'Markets', path: '/markets', icon: <BarChart fontSize="small" /> },
    { name: 'Forex', path: '/forex-education', icon: <School fontSize="small" /> },
    { name: 'Crypto', path: '/crypto-education', icon: <School fontSize="small" /> },
    { name: 'Signals', path: '/signals', icon: <SignalCellularAlt fontSize="small" /> },
    { name: 'Copy', path: '/copy-trading', icon: <People fontSize="small" /> },
    { name: 'Robots', path: '/robots', icon: <MemoryIcon fontSize="small" /> },
    { name: 'Affiliate', path: '/affiliate', icon: <GroupAddIcon fontSize="small" /> },
  ];

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/');
    }
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backgroundColor: 'background.paper',
        color: 'text.primary',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Mobile menu button */}
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo */}
          <Box
            component={RouterLink}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit',
              mr: 4
            }}
          >
            <Avatar
              src="/logo.jpeg"
              alt="Hills Capital Logo"
              sx={{
                width: 40,
                height: 40,
                mr: 1,
                bgcolor: 'transparent',
                borderRadius: 0
              }}
            />
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                fontWeight: 700,
                display: { xs: 'none', sm: 'block' },
              }}
            >
              HILLS CAPITAL
            </Typography>
          </Box>

          {/* Navigation Links */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, ml: 4 }}>
            {pages.map((page) => (
              <Button
                key={page.path}
                component={RouterLink}
                to={page.path}
                sx={{
                  my: 1,
                  mx: 1,
                  color: 'text.primary',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                  '&.active': {
                    color: 'primary.main',
                    '& .MuiSvgIcon-root': {
                      color: 'primary.main',
                    },
                  },
                }}
                startIcon={page.icon}
              >
                {page.name}
              </Button>
            ))}
          </Box>

          {/* Right side actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {!isAuthenticated ? (
              <>
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="outlined"
                  sx={{
                    color: 'primary.main',
                    borderColor: 'divider',
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  Login
                </Button>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="contained"
                  color="primary"
                  sx={{
                    boxShadow: 'none',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
                    },
                  }}
                >
                  Sign Up
                </Button>
              </>
            ) : (
              <>
                <Button
                  component={RouterLink}
                  to="/dashboard"
                  variant="outlined"
                  sx={{
                    color: 'primary.main',
                    borderColor: 'divider',
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  Dashboard
                </Button>

                {/* User menu */}
                <Tooltip title="Account settings">
                  <IconButton
                    onClick={handleProfileMenuOpen}
                    size="small"
                    sx={{ ml: 1 }}
                    aria-controls={isMenuOpen ? 'account-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={isMenuOpen ? 'true' : undefined}
                  >
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        fontSize: '1rem',
                      }}
                    >
                      {user?.firstName ? user.firstName.charAt(0).toUpperCase() : <AccountCircle />}
                    </Avatar>
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 280,
            backgroundColor: theme.palette.background.paper,
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', my: 2 }}>
          <Avatar
            src="/logo.png"
            alt="Hills Capital Logo"
            sx={{
              width: 48,
              height: 48,
              bgcolor: 'primary.main',
              color: 'primary.contrastText'
            }}
          />
        </Box>
        <Divider />
        <List>
          {pages.map((page) => (
            <ListItem key={page.path} disablePadding>
              <ListItemButton
                component={RouterLink}
                to={page.path}
                onClick={handleDrawerToggle}
                sx={{
                  '&.active': {
                    color: 'primary.main',
                    '& .MuiListItemIcon-root': {
                      color: 'primary.main',
                    },
                  },
                }}
              >
                <MuiListItemIcon>
                  {page.icon}
                </MuiListItemIcon>
                <ListItemText primary={page.name} />
              </ListItemButton>
            </ListItem>
          ))}

          <Divider sx={{ my: 1 }} />

          {/* Quick Links Section */}
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="overline" color="text.secondary">
              Quick Links
            </Typography>
          </Box>

          <ListItem disablePadding>
            <ListItemButton
              component={RouterLink}
              to="/privacy-policy"
              onClick={handleDrawerToggle}
            >
              <MuiListItemIcon>
                <Policy fontSize="small" />
              </MuiListItemIcon>
              <ListItemText primary="Privacy Policy" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              component={RouterLink}
              to="/terms"
              onClick={handleDrawerToggle}
            >
              <MuiListItemIcon>
                <Description fontSize="small" />
              </MuiListItemIcon>
              <ListItemText primary="Terms & Conditions" />
            </ListItemButton>
          </ListItem>

          <Divider sx={{ my: 1 }} />

          {!isAuthenticated ? (
            <>
              <ListItem disablePadding>
                <ListItemButton
                  component={RouterLink}
                  to="/login"
                  onClick={handleDrawerToggle}
                >
                  <MuiListItemIcon>
                    <Login />
                  </MuiListItemIcon>
                  <ListItemText primary="Login" />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton
                  component={RouterLink}
                  to="/register"
                  onClick={handleDrawerToggle}
                  sx={{
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                    mt: 1,
                    borderRadius: 1,
                    mx: 1
                  }}
                >
                  <MuiListItemIcon sx={{ color: 'inherit' }}>
                    <AccountCircle />
                  </MuiListItemIcon>
                  <ListItemText primary="Create Account" />
                </ListItemButton>
              </ListItem>
            </>
          ) : (
            <>
              <ListItem disablePadding>
                <ListItemButton
                  component={RouterLink}
                  to="/dashboard"
                  onClick={handleDrawerToggle}
                >
                  <MuiListItemIcon>
                    <Dashboard />
                  </MuiListItemIcon>
                  <ListItemText primary="Dashboard" />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => {
                    handleDrawerToggle();
                    handleLogout();
                  }}
                  sx={{
                    backgroundColor: 'error.main',
                    color: 'error.contrastText',
                    '&:hover': {
                      backgroundColor: 'error.dark',
                    },
                    mt: 1,
                    borderRadius: 1,
                    mx: 1
                  }}
                >
                  <MuiListItemIcon sx={{ color: 'inherit' }}>
                    <Logout />
                  </MuiListItemIcon>
                  <ListItemText primary="Logout" />
                </ListItemButton>
              </ListItem>
            </>
          )}
        </List>
      </Drawer>

      {/* User menu dropdown */}
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={isMenuOpen}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => navigate('/dashboard')}>
          <ListItemIcon>
            <Dashboard fontSize="small" />
          </ListItemIcon>
          Dashboard
        </MenuItem>
        <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={() => { handleMenuClose(); navigate('/settings'); }}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </AppBar>
  );
};

export default Navbar;
