import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  InputAdornment,
  Snackbar,
  CircularProgress,
  Stack
} from '@mui/material';
import {
  AttachMoney,
  ShowChart,
  TrendingUp,
  People,
  BarChart,
  Security,
  ContentCopy,
  Notifications,
  School,
  SmartToy,
  Payment
} from '@mui/icons-material';
import { formatCurrency } from '../../../utils/formatters';

const OverviewTab = ({ onRefresh, dashboardStats, currentSubscription }) => {
  const navigate = useNavigate();

  // Deposit form state
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [depositForm, setDepositForm] = useState({
    amount: '',
    paymentMethod: '',
    walletAddress: ''
  });
  const [depositSubmitting, setDepositSubmitting] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [paymentDetails, setPaymentDetails] = useState(null);

  const features = [
    {
      id: 'trading-bots',
      title: 'Trading Robots',
      icon: <SmartToy sx={{ fontSize: 40, color: 'primary.main' }} />,
      description: 'Automate your trading strategies with our advanced trading bots',
      stats: 'Available',
      color: 'primary.main'
    },
    {
      id: 'forex-education',
      title: 'Forex Education',
      icon: <School sx={{ fontSize: 40, color: 'success.main' }} />,
      description: 'Learn forex trading from basic to advanced strategies',
      stats: '15+ Courses',
      color: 'success.main'
    },
    {
      id: 'crypto-education',
      title: 'Crypto Education',
      icon: <TrendingUp sx={{ fontSize: 40, color: 'warning.main' }} />,
      description: 'Master cryptocurrency trading and blockchain technology',
      stats: '10+ Courses',
      color: 'warning.main'
    },
    {
      id: 'signal-room',
      title: 'Signal Room',
      icon: <Notifications sx={{ fontSize: 40, color: 'error.main' }} />,
      description: 'Get real-time trading signals from our expert analysts',
      stats: 'Live Updates',
      color: 'error.main'
    },
    {
      id: 'copy-trading',
      title: 'Copy Trading',
      icon: <ContentCopy sx={{ fontSize: 40, color: 'info.main' }} />,
      description: 'Copy trades from top performing traders automatically',
      stats: '50+ Traders',
      color: 'info.main'
    },

    {
      id: 'affiliate',
      title: 'Affiliate Program',
      icon: <People sx={{ fontSize: 40, color: 'success.dark' }} />,
      description: 'Earn commissions by referring new users',
      stats: 'Join Program',
      color: 'success.dark'
    },
    {
      id: 'account',
      title: 'Account Settings',
      icon: <Security sx={{ fontSize: 40, color: 'text.secondary' }} />,
      description: 'Manage your account and security settings',
      stats: 'Profile | Security',
      color: 'text.secondary'
    }
  ];

  const handleFeatureClick = (featureId) => {
    console.log(`Navigating to ${featureId}`);

    // Navigate to appropriate routes based on feature ID
    switch (featureId) {
      case 'trading-bots':
        navigate('/robots');
        break;
      case 'forex-education':
        navigate('/forex-education');
        break;
      case 'crypto-education':
        navigate('/crypto-education');
        break;
      case 'signal-room':
        navigate('/signals');
        break;
      case 'copy-trading':
        navigate('/copy-trading');
        break;
      case 'investment':
        navigate('/investments');
        break;
      case 'affiliate':
        navigate('/affiliate');
        break;
      case 'account':
        // For account settings, scroll to top (could be expanded to profile page)
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      default:
        console.warn(`No navigation defined for feature: ${featureId}`);
    }
  };

  // Deposit form handlers
  const handleDepositClick = () => {
    setDepositDialogOpen(true);
  };

  const handleDepositClose = () => {
    setDepositDialogOpen(false);
    setDepositForm({ amount: '', paymentMethod: '', walletAddress: '' });
    setPaymentDetails(null);
  };

  const handleNotificationClose = () => {
    setNotification({ ...notification, open: false });
  };

  const handleDepositInputChange = (field, value) => {
    setDepositForm(prev => ({ ...prev, [field]: value }));
  };

  const handleDepositSubmit = async () => {
    if (!depositForm.amount || !depositForm.paymentMethod) {
      setNotification({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error'
      });
      return;
    }

    // Define minimum amounts for crypto payments
    const cryptoMinimums = {
      'bitcoin': 50,   // $50 minimum for Bitcoin
      'ethereum': 30,  // $30 minimum for Ethereum
      'usdttrc20': 20  // $20 minimum for USDT (TRC20)
    };

    // Validate minimum amount based on payment method
    const amount = parseFloat(depositForm.amount);
    const minAmount = cryptoMinimums[depositForm.paymentMethod] || 20;

    if (amount < minAmount) {
      setNotification({
        open: true,
        message: `Minimum deposit amount for ${depositForm.paymentMethod === 'bitcoin' ? 'Bitcoin' : depositForm.paymentMethod === 'ethereum' ? 'Ethereum' : depositForm.paymentMethod === 'usdt' ? 'USDT' : 'this payment method'} is $${minAmount}`,
        severity: 'error'
      });
      return;
    }

    try {
      setDepositSubmitting(true);
      console.log('Processing deposit:', depositForm);

      // Payment method mapping
      const paymentMethodMap = {
        'bitcoin': { currency: 'btc', name: 'Bitcoin' },
        'ethereum': { currency: 'eth', name: 'Ethereum' },
        'usdttrc20': { currency: 'usdttrc20', name: 'USDT (TRC20)' },
        'usdtbsc': { currency: 'usdtbsc', name: 'USDT (BSC)' }
      };

      // Check if it's a crypto payment method
      if (paymentMethodMap[depositForm.paymentMethod]) {
        // Create NOWPayments crypto payment
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/payments/deposit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            amount: parseFloat(depositForm.amount),
            pay_currency: paymentMethodMap[depositForm.paymentMethod].currency,
            description: `Account Deposit - $${depositForm.amount}`
          })
        });

        const data = await response.json();

        if (data.success) {
          // Store payment details for display
          setPaymentDetails({
            ...data.data,
            currencyName: paymentMethodMap[depositForm.paymentMethod].name
          });

          setNotification({
            open: true,
            message: 'Crypto payment created successfully! Redirecting to payment details...',
            severity: 'success'
          });

          // Redirect to payment status page after a short delay
          setTimeout(() => {
            navigate(`/payment-status/${data.data.payment_id}`);
          }, 2000);

        } else {
          throw new Error(data.message || 'Failed to create payment');
        }
      } else {
        // Handle non-crypto payments (bank transfer, paypal)
        setNotification({
          open: true,
          message: `Deposit request submitted successfully! Please contact support for ${depositForm.paymentMethod} payment instructions.`,
          severity: 'info'
        });
      }

      handleDepositClose();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error processing deposit:', error);
      setNotification({
        open: true,
        message: `Failed to process deposit: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setDepositSubmitting(false);
    }
  };

  return (
    <Box>
      {/* Quick Actions */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Quick Actions</Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={4} md={2}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<AttachMoney />}
              onClick={handleDepositClick}
              sx={{ py: 1.5, textTransform: 'none' }}
            >
              Deposit
            </Button>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<ShowChart />}
              onClick={() => navigate('/markets')}
              sx={{ py: 1.5, textTransform: 'none' }}
            >
              Trade
            </Button>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<People />}
              onClick={() => navigate('/copy-trading')}
              sx={{ py: 1.5, textTransform: 'none' }}
            >
              Copy Trade
            </Button>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<BarChart />}
              onClick={() => navigate('/signals')}
              sx={{ py: 1.5, textTransform: 'none' }}
            >
              Signals
            </Button>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Payment />}
              onClick={() => navigate('/payment-history')}
              sx={{ py: 1.5, textTransform: 'none' }}
            >
              Payments
            </Button>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Security />}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              sx={{ py: 1.5, textTransform: 'none' }}
            >
              Security
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Subscription Status */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Subscription Status</Typography>
        <Card elevation={2} sx={{ p: 3, borderLeft: '4px solid', borderColor: currentSubscription?.status === 'active' ? 'success.main' : currentSubscription?.status === 'pending' ? 'warning.main' : 'grey.400' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mr: 2 }}>
                  Current Plan: {currentSubscription?.name || 'Free'}
                </Typography>
                <Chip
                  label={currentSubscription?.status === 'active' ? 'Active' : currentSubscription?.status === 'pending' ? 'Pending' : 'Inactive'}
                  color={currentSubscription?.status === 'active' ? 'success' : currentSubscription?.status === 'pending' ? 'warning' : 'default'}
                  size="small"
                />
              </Box>
              {currentSubscription && currentSubscription.status === 'pending' && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  Your subscription is pending activation. Payment processing may take a few minutes.
                </Alert>
              )}
              {currentSubscription && currentSubscription.price > 0 && (
                <Typography variant="body2" color="text.secondary">
                  ${currentSubscription.price}/{currentSubscription.interval}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => navigate('/dashboard?tab=7')} // Navigate to subscription tab
                  sx={{ textTransform: 'none' }}
                >
                  {currentSubscription?.status === 'pending' ? 'View Subscription' : 'Upgrade Plan'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Card>
      </Box>

      {/* Features Grid */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Trading Tools & Education</Typography>
        <Grid container spacing={3}>
          {features.map((feature) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={feature.id}>
              <Card
                elevation={2}
                onClick={() => handleFeatureClick(feature.id)}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                  },
                  borderLeft: `4px solid ${feature.color}`
                }}
              >
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {feature.icon}
                    <Typography variant="h6" sx={{ ml: 2, fontWeight: 600 }}>
                      {feature.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                    {feature.description}
                  </Typography>
                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mt: 'auto',
                    pt: 1,
                    borderTop: '1px solid',
                    borderColor: 'divider'
                  }}>
                    <Typography variant="caption" sx={{ color: feature.color, fontWeight: 600 }}>
                      {feature.stats}
                    </Typography>
                    <Typography variant="caption" color="primary" sx={{ fontWeight: 600 }}>
                      View →
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Deposit Dialog */}
      <Dialog
        open={depositDialogOpen}
        onClose={handleDepositClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            Make a Deposit
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              Enter your deposit amount and select a payment method. For crypto payments, you'll get a secure payment address and QR code.
            </Alert>

            <TextField
              fullWidth
              label="Deposit Amount"
              type="number"
              value={depositForm.amount}
              onChange={(e) => handleDepositInputChange('amount', e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              sx={{ mb: 3 }}
              required
              helperText={`Minimum deposit: $${depositForm.paymentMethod ? (depositForm.paymentMethod === 'bitcoin' ? '50' : depositForm.paymentMethod === 'ethereum' ? '30' : (depositForm.paymentMethod === 'usdttrc20' || depositForm.paymentMethod === 'usdtbsc') ? '20' : '20') : '20'}`}
            />

            <FormControl fullWidth sx={{ mb: 3 }} required>
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={depositForm.paymentMethod}
                label="Payment Method"
                onChange={(e) => handleDepositInputChange('paymentMethod', e.target.value)}
              >
                <MenuItem value="bitcoin">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography>Bitcoin (BTC)</Typography>
                    <Chip label="Min: $50" size="small" color="primary" variant="outlined" />
                  </Stack>
                </MenuItem>
                <MenuItem value="ethereum">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography>Ethereum (ETH)</Typography>
                    <Chip label="Min: $30" size="small" color="primary" variant="outlined" />
                  </Stack>
                </MenuItem>
                <MenuItem value="usdttrc20">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography>USDT (TRC20)</Typography>
                    <Chip label="Min: $20" size="small" color="primary" variant="outlined" />
                  </Stack>
                </MenuItem>
                <MenuItem value="usdtbsc">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography>USDT (BSC)</Typography>
                    <Chip label="Min: $20" size="small" color="primary" variant="outlined" />
                  </Stack>
                </MenuItem>
                <MenuItem value="bank-transfer">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography>Bank Transfer</Typography>
                    <Chip label="Min: $20" size="small" color="secondary" variant="outlined" />
                  </Stack>
                </MenuItem>
                <MenuItem value="paypal">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography>PayPal</Typography>
                    <Chip label="Min: $20" size="small" color="info" variant="outlined" />
                  </Stack>
                </MenuItem>
              </Select>
            </FormControl>

            {(depositForm.paymentMethod === 'bitcoin' ||
              depositForm.paymentMethod === 'ethereum' ||
              depositForm.paymentMethod === 'usdttrc20' ||
              depositForm.paymentMethod === 'usdtbsc') && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    ✅ <strong>Secure Crypto Payment</strong><br />
                    • Instant payment address generation<br />
                    • QR code for easy mobile payments<br />
                    • Real-time payment tracking<br />
                    • Automatic account crediting
                  </Typography>
                </Alert>
              )}

            {(depositForm.paymentMethod === 'bank-transfer' ||
              depositForm.paymentMethod === 'paypal') && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    ⚠️ <strong>Manual Processing Required</strong><br />
                    Please contact support for payment instructions. Processing may take 1-3 business days.
                  </Typography>
                </Alert>
              )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={handleDepositClose}
            disabled={depositSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleDepositSubmit}
            disabled={depositSubmitting || !depositForm.amount || !depositForm.paymentMethod}
            startIcon={depositSubmitting ? <CircularProgress size={20} color="inherit" /> : <AttachMoney />}
            size="large"
          >
            {depositSubmitting ? 'Creating Payment...' : 'Submit Deposit Request'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleNotificationClose}
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>

    </Box>
  );
};

export default OverviewTab;
