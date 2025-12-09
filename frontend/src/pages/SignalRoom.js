import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  useMediaQuery,
  useTheme,
  Divider
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LockIcon from '@mui/icons-material/Lock';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CurrencyBitcoinIcon from '@mui/icons-material/CurrencyBitcoin';
import PaidIcon from '@mui/icons-material/Paid';
import { useNavigate } from 'react-router-dom';

// Mock user subscription data - in a real app, this would come from your auth context/API
const useUserSubscription = () => {
  // For demo purposes, you can change this to 'gold' or 'platinum' to test different access levels
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    // In a real app, you would fetch this from your auth context or API
    // For now, we'll simulate a loading state and then set to 'gold'
    let isMounted = true;
    const timer = setTimeout(() => {
      if (isMounted) {
        setSubscription('gold'); // Change to 'platinum' to test premium features
      }
    }, 500);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  return { subscription, isLoading: !subscription };
};

const SignalRoom = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { subscription, isLoading } = useUserSubscription();
  const [tabValue, setTabValue] = useState(0);
  const [selectedPair, setSelectedPair] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [openUpgradeDialog, setUpgradeDialog] = useState(false);

  // Signal categories
  const signalCategories = [
    {
      id: 'forex',
      label: 'Currency Pairs',
      icon: <CurrencyExchangeIcon />,
      access: ['gold', 'platinum'],
      signals: [
        { pair: 'EUR/USD', type: 'Forex', risk: 'Medium' },
        { pair: 'GBP/USD', type: 'Forex', risk: 'Medium' },
        { pair: 'USD/JPY', type: 'Forex', risk: 'Low' },
      ]
    },
    {
      id: 'synthetics',
      label: 'Synthetics',
      icon: <AccountBalanceWalletIcon />,
      access: ['platinum'], // Only for platinum members
      signals: [
        { pair: 'SYNTH-1', type: 'Synthetic', risk: 'High' },
        { pair: 'SYNTH-2', type: 'Synthetic', risk: 'Medium' },
      ]
    },
    {
      id: 'futures',
      label: 'Crypto Futures',
      icon: <PaidIcon />,
      access: ['gold', 'platinum'],
      signals: [
        { pair: 'BTC/USDT', type: 'Futures', risk: 'High' },
        { pair: 'ETH/USDT', type: 'Futures', risk: 'High' },
      ]
    },
    {
      id: 'spot',
      label: 'Crypto Spot',
      icon: <CurrencyBitcoinIcon />,
      access: ['gold', 'platinum'],
      signals: [
        { pair: 'BTC/USD', type: 'Spot', risk: 'Medium' },
        { pair: 'ETH/USD', type: 'Spot', risk: 'Medium' },
        { pair: 'XRP/USD', type: 'Spot', risk: 'High' },
      ]
    },
  ];

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setSelectedPair('');
  };

  const handlePairSelect = (pair) => {
    setSelectedPair(pair);
  };

  const handleSubscribe = () => {
    if (!subscription) {
      setSnackbarMessage('Please log in to access signal rooms');
      setOpenSnackbar(true);
      return;
    }

    const currentCategory = signalCategories[tabValue];
    if (!currentCategory.access.includes(subscription)) {
      setUpgradeDialog(true);
      return;
    }

    // In a real app, you would connect to the signal room service here
    console.log(`Subscribing to ${currentCategory.label} - ${selectedPair}`);
    setSnackbarMessage(`Successfully subscribed to ${selectedPair} signals!`);
    setOpenSnackbar(true);

    // In a real app, you would navigate to the signal room or update the UI accordingly
    // navigate(`/signal-room/${currentCategory.id}/${selectedPair}`);
  };

  const handleUpgrade = () => {
    setUpgradeDialog(false);
    // In a real app, you would navigate to the subscription/upgrade page
    navigate('/pricing');
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleCloseUpgradeDialog = () => {
    setUpgradeDialog(false);
  };

  const currentCategory = signalCategories[tabValue];
  const hasAccess = subscription && currentCategory.access.includes(subscription);
  const isLocked = subscription && !hasAccess;

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Typography>Loading your subscription information...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Signal Rooms
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {subscription
            ? `You have ${subscription === 'platinum' ? 'Platinum' : 'Gold'} subscription`
            : 'Sign in to access signal rooms'}
        </Typography>
      </Box>

      {/* Category Tabs */}
      <Paper sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="signal categories"
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: theme.palette.primary.main,
              height: 3,
            },
          }}
        >
          {signalCategories.map((category, index) => {
            const isLocked = subscription && !category.access.includes(subscription);
            return (
              <Tab
                key={category.id}
                icon={isLocked ? <LockIcon fontSize="small" /> : category.icon}
                iconPosition="start"
                label={category.label}
                sx={{
                  minHeight: 64,
                  opacity: isLocked ? 0.6 : 1,
                  '&.Mui-selected': {
                    color: theme.palette.primary.main,
                    '& .MuiSvgIcon-root': {
                      color: theme.palette.primary.main,
                    },
                  },
                }}
                disabled={isLocked}
              />
            );
          })}
        </Tabs>
      </Paper>

      {/* Signal Selection */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          {currentCategory.label} Signals
        </Typography>

        {isLocked ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <LockIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Upgrade to Platinum
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
              {currentCategory.label} signals are only available for Platinum members.
              Upgrade your subscription to access premium signals.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/pricing')}
            >
              Upgrade Now
            </Button>
          </Box>
        ) : (
          <>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="select-pair-label">Select {currentCategory.label}</InputLabel>
              <Select
                labelId="select-pair-label"
                value={selectedPair}
                label={`Select ${currentCategory.label}`}
                onChange={(e) => setSelectedPair(e.target.value)}
                fullWidth
              >
                <MenuItem value="">
                  <em>Select a pair</em>
                </MenuItem>
                {currentCategory.signals.map((signal) => (
                  <MenuItem key={signal.pair} value={signal.pair}>
                    {signal.pair} ({signal.type}, {signal.risk} Risk)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              onClick={handleSubscribe}
              disabled={!selectedPair}
              sx={{ py: 1.5 }}
            >
              Subscribe to {selectedPair || 'Pair'} Signals
            </Button>
          </>
        )}
      </Paper>

      {/* Signal Information */}
      <Paper sx={{ p: 3, borderRadius: 2, bgcolor: 'background.paper' }}>
        <Typography variant="h6" gutterBottom>
          How It Works
        </Typography>
        <Typography paragraph>
          When you subscribe to a signal room, you'll receive real-time trading signals directly to your phone.
          Our expert analysts monitor the markets 24/7 to provide you with the best trading opportunities.
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <CheckCircleOutlineIcon color="primary" sx={{ mr: 2, mt: 0.5 }} />
              <div>
                <Typography variant="subtitle1" gutterBottom>Real-time Alerts</Typography>
                <Typography variant="body2" color="text.secondary">
                  Get instant notifications for new trading signals
                </Typography>
              </div>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <CheckCircleOutlineIcon color="primary" sx={{ mr: 2, mt: 0.5 }} />
              <div>
                <Typography variant="subtitle1" gutterBottom>Expert Analysis</Typography>
                <Typography variant="body2" color="text.secondary">
                  Signals based on thorough technical and fundamental analysis
                </Typography>
              </div>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <CheckCircleOutlineIcon color="primary" sx={{ mr: 2, mt: 0.5 }} />
              <div>
                <Typography variant="subtitle1" gutterBottom>Risk Management</Typography>
                <Typography variant="body2" color="text.secondary">
                  Each signal includes entry, take profit, and stop loss levels
                </Typography>
              </div>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Upgrade Dialog */}
      <Dialog open={openUpgradeDialog} onClose={handleCloseUpgradeDialog}>
        <DialogTitle>Upgrade Required</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {currentCategory.label} signals are only available for {currentCategory.access.join(' or ')} subscribers.
            Upgrade your subscription to access all features.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUpgradeDialog}>Cancel</Button>
          <Button onClick={handleUpgrade} variant="contained" color="primary">
            Upgrade Now
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SignalRoom;
