import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  AppBar,
  Toolbar,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  Paper,
  Chip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People,
  TrendingUp,
  SmartToy,
  ContentCopy,
  Notifications,
  School,
  Share,
  Subscriptions,
  ExitToApp,
  Settings,
  AccountCircle
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Import admin components
import AdminHome from './components/AdminHome';
import UserManagement from './components/UserManagement';

import TradingBotRequests from './components/TradingBotRequests';
import CopyTradingRequests from './components/CopyTradingRequests';
import SignalsManagement from './components/SignalsManagement';
import EducationManagement from './components/EducationManagement';
import AffiliateManagement from './components/AffiliateManagement';
import SubscriptionManagement from './components/SubscriptionManagement';

const AdminDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [adminUser, setAdminUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for admin authentication
    const token = localStorage.getItem('token');
    const adminUserData = localStorage.getItem('adminUser');

    if (!token || !adminUserData) {
      navigate('/admin/login');
      return;
    }

    try {
      const user = JSON.parse(adminUserData);
      if (user.role !== 'admin') {
        navigate('/admin/login');
        return;
      }
      setAdminUser(user);
    } catch (error) {
      console.error('Error parsing admin user data:', error);
      navigate('/admin/login');
      return;
    }

    // Fetch notifications
    fetchNotifications();
  }, [navigate]);

  const fetchNotifications = async () => {
    try {
      // Fetch real notifications from API
      // TODO: Implement real notification API call
      setNotifications([]);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    // Clear admin auth data
    localStorage.removeItem('token');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const tabs = [
    { label: 'Dashboard', icon: <DashboardIcon />, component: AdminHome },
    { label: 'Users', icon: <People />, component: UserManagement },

    { label: 'Bot Requests', icon: <SmartToy />, component: TradingBotRequests },
    { label: 'Copy Trading', icon: <ContentCopy />, component: CopyTradingRequests },
    { label: 'Signals', icon: <Notifications />, component: SignalsManagement },
    { label: 'Education', icon: <School />, component: EducationManagement },
    { label: 'Affiliates', icon: <Share />, component: AffiliateManagement },
    { label: 'Subscriptions', icon: <Subscriptions />, component: SubscriptionManagement }
  ];

  const CurrentComponent = tabs[tabValue]?.component || AdminHome;

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Admin Header */}
      <AppBar position="static" sx={{ bgcolor: 'primary.main' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Hills Capital Trade - Admin Dashboard
          </Typography>

          <IconButton color="inherit" sx={{ mr: 2 }}>
            <Badge badgeContent={notifications.length} color="error">
              <Notifications />
            </Badge>
          </IconButton>

          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenuOpen}
            color="inherit"
          >
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              {adminUser?.name?.charAt(0) || 'A'}
            </Avatar>
          </IconButton>

          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleMenuClose}>
              <AccountCircle sx={{ mr: 1 }} />
              Profile
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <Settings sx={{ mr: 1 }} />
              Settings
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ExitToApp sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Navigation Tabs */}
      <Paper sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="admin dashboard tabs"
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              icon={tab.icon}
              label={tab.label}
              iconPosition="start"
              sx={{ minHeight: 64 }}
            />
          ))}
        </Tabs>
      </Paper>

      {/* Main Content */}
      <Box sx={{ p: 3 }}>
        <CurrentComponent />
      </Box>


    </Box>
  );
};

export default AdminDashboard;
