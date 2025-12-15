import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Typography,
  Box,
  Button,
  LinearProgress,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  ShowChart,
  SmartToy,
  ContentCopy,
  Notifications,
  School,
  People,
  CreditCard,
  AccountBalanceWallet,
  TrendingUp,
  CheckCircle,
  Payment
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../services/api';
import websocketService from '../services/websocketService';

// Import dashboard sections
import OverviewTab from '../components/dashboard/sections/OverviewTab';
import TradingRobot from '../components/dashboard/sections/TradingRobot';
import CopyTrading from '../components/dashboard/sections/CopyTrading';
import Signals from '../components/dashboard/sections/Signals';
import Education from '../components/dashboard/sections/Education';
import Affiliate from '../components/dashboard/sections/Affiliate';
import Subscription from '../components/dashboard/sections/Subscription';
import PaymentHistory from '../components/dashboard/sections/PaymentHistory';
import Scanners from '../components/dashboard/sections/Scanners';

// Tab panel component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `dashboard-tab-${index}`,
    'aria-controls': `dashboard-tabpanel-${index}`,
  };
}

// Helper: access rules per feature
const hasAccess = (level, feature) => {
  const rules = {
    signals: ['basic', 'intermediate', 'premium'],
    copyTrading: ['intermediate', 'advanced', 'premium'],
    robots: ['advanced', 'premium'],
  };
  return rules[feature]?.includes(level);
};

// Reusable locked message
const LockedPanel = ({ title, neededLevels }) => (
  <Box sx={{ maxWidth: 720 }}>
    <Alert severity="warning" sx={{ mb: 2 }}>
      {title} is locked.
    </Alert>
    <Typography variant="body1" sx={{ mb: 2 }}>
      You need a subscription to access this feature:
    </Typography>
    <ul style={{ marginTop: 0 }}>
      {neededLevels.map((lvl) => (
        <li key={lvl}>
          <strong>{lvl.charAt(0).toUpperCase() + lvl.slice(1)}</strong>
        </li>
      ))}
    </ul>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
      Upgrade your plan in the Subscription tab to unlock access.
    </Typography>
    <Button
      variant="contained"
      color="primary"
      href="#"
      onClick={(e) => {
        e.preventDefault();
        // Optionally: navigate to Subscription tab by setting activeTab programmatically
      }}
    >
      Go to Subscription
    </Button>
  </Box>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    balance: 0,
    activeInvestments: 0,
    subscriptionStatus: 'inactive',
    welcomeMessage: 'Welcome back!'
  });
  const [currentSubscription, setCurrentSubscription] = useState(null);

  // Subscription level from backend
  const subscriptionLevel = user?.subscription_level || 'free';

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Fetch dashboard stats from API
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/users/dashboard/stats');

      setDashboardStats({
        balance: response.data.stats?.balance || 0,
        activeInvestments: response.data.stats?.totalInvestments || 0,
        subscriptionStatus: response.data.subscriptionStatus || 'inactive',
        welcomeMessage: response.data.welcomeMessage || 'Welcome back!'
      });

      if (response.data.currentPlan) {
        setCurrentSubscription(response.data.currentPlan);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // WebSocket effect for real-time subscription updates
  useEffect(() => {
    try {
      websocketService.connect();

      const handleUserSubscriptionUpdate = (data) => {
        if (data.subscription) {
          setCurrentSubscription(data.subscription);
          setDashboardStats((prev) => ({
            ...prev,
            subscriptionStatus: data.subscription.status || 'inactive'
          }));
        }
      };

      const handleSubscriptionsUpdate = () => {
        fetchDashboardData();
      };

      websocketService.on('userSubscriptionUpdated', handleUserSubscriptionUpdate);
      websocketService.on('subscriptionsUpdated', handleSubscriptionsUpdate);

      return () => {
        websocketService.off('userSubscriptionUpdated', handleUserSubscriptionUpdate);
        websocketService.off('subscriptionsUpdated', handleSubscriptionsUpdate);
      };
    } catch (error) {
      console.warn('WebSocket connection failed:', error);
    }
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <Box sx={{ width: '100%', p: 4 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
            {dashboardStats.welcomeMessage}, {user?.firstName || user?.name || 'Trader'}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your trading activities and investments
          </Typography>
        </Box>
        <Box>
          <Button variant="outlined" onClick={fetchDashboardData}>
            Refresh Data
          </Button>
        </Box>
      </Box>

      {/* Dashboard Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccountBalanceWallet sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h6">Account Balance</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                ${dashboardStats.balance?.toLocaleString() || '0'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp sx={{ color: 'info.main', mr: 1 }} />
                <Typography variant="h6">Active Investments</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                {dashboardStats.activeInvestments || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckCircle sx={{ color: 'success.main', mr: 1 }} />
                <Typography variant="h6">Subscription Status</Typography>
              </Box>
              <Chip
                label={dashboardStats.subscriptionStatus === 'active' ? 'Active' : 'Inactive'}
                color={dashboardStats.subscriptionStatus === 'active' ? 'success' : 'default'}
                variant="filled"
                sx={{ fontSize: '1rem', fontWeight: 600 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="dashboard tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            {/* 0 */}
            <Tab label="Overview" icon={<DashboardIcon />} iconPosition="start" {...a11yProps(0)} />

            {/* Restricted tabs */}
            {/* 1 */}
            <Tab
              label="Trading Robots"
              icon={<SmartToy />}
              iconPosition="start"
              {...a11yProps(1)}
              disabled={!hasAccess(subscriptionLevel, 'robots')}
            />
            {/* 2 */}
            <Tab
              label="Copy Trading"
              icon={<ContentCopy />}
              iconPosition="start"
              {...a11yProps(2)}
              disabled={!hasAccess(subscriptionLevel, 'copyTrading')}
            />
            {/* 3 */}
            <Tab
              label="Signals"
              icon={<Notifications />}
              iconPosition="start"
              {...a11yProps(3)}
              disabled={!hasAccess(subscriptionLevel, 'signals')}
            />

            {/* Always accessible */}
            {/* 4 */}
            <Tab label="Education" icon={<School />} iconPosition="start" {...a11yProps(4)} />
            {/* 5 */}
            <Tab label="Affiliate" icon={<People />} iconPosition="start" {...a11yProps(5)} />
            {/* 6 */}
            <Tab label="Payments" icon={<Payment />} iconPosition="start" {...a11yProps(6)} />
            {/* 7 */}
            <Tab label="Subscription" icon={<CreditCard />} iconPosition="start" {...a11yProps(7)} />
            {/* 8 */}
            <Tab label="Scanners" icon={<ShowChart />} iconPosition="start" {...a11yProps(8)} />
          </Tabs>
        </Box>

        {/* Tab Panels - keep indices consistent with Tabs above */}
        <TabPanel value={activeTab} index={0}>
          <OverviewTab
            onRefresh={fetchDashboardData}
            dashboardStats={dashboardStats}
            currentSubscription={currentSubscription}
          />
        </TabPanel>

        {/* Trading Robots (restricted) */}
        <TabPanel value={activeTab} index={1}>
          {hasAccess(subscriptionLevel, 'robots') ? (
            <TradingRobot onRefresh={fetchDashboardData} />
          ) : (
            <LockedPanel title="Trading Robots" neededLevels={['advanced', 'premium']} />
          )}
        </TabPanel>

        {/* Copy Trading (restricted) */}
        <TabPanel value={activeTab} index={2}>
          {hasAccess(subscriptionLevel, 'copyTrading') ? (
            <CopyTrading onRefresh={fetchDashboardData} />
          ) : (
            <LockedPanel title="Copy Trading" neededLevels={['intermediate', 'advanced', 'premium']} />
          )}
        </TabPanel>

        {/* Signals (restricted) */}
        <TabPanel value={activeTab} index={3}>
          {hasAccess(subscriptionLevel, 'signals') ? (
            <Signals onRefresh={fetchDashboardData} />
          ) : (
            <LockedPanel title="Signals" neededLevels={['basic', 'intermediate', 'premium']} />
          )}
        </TabPanel>

        {/* Education */}
        <TabPanel value={activeTab} index={4}>
          <Education onRefresh={fetchDashboardData} />
        </TabPanel>

        {/* Affiliate */}
        <TabPanel value={activeTab} index={5}>
          <Affiliate onRefresh={fetchDashboardData} />
        </TabPanel>

        {/* Payments */}
        <TabPanel value={activeTab} index={6}>
          <PaymentHistory />
        </TabPanel>

        {/* Subscription */}
        <TabPanel value={activeTab} index={7}>
          <Subscription onSubscribeSuccess={fetchDashboardData} />
        </TabPanel>

        {/* Scanners */}
        <TabPanel value={activeTab} index={8}>
          <Scanners />
        </TabPanel>
      </Box>
    </Container>
  );
};

export default Dashboard;