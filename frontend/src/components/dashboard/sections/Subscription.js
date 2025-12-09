import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CardActions,
  Chip,
  LinearProgress,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  CheckCircle,
  Close,
  ArrowForward,
  Payment,
  CreditCard,
  AccountBalanceWallet,
  CurrencyBitcoin,
  AccountBalance,
  Receipt,
  Security,
  HelpOutline,
  InfoOutlined
} from '@mui/icons-material';


import api from '../../../services/api';
import websocketService from '../../../services/websocketService';

const Subscription = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [subscriptions, setSubscriptions] = useState([]);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [openUpgradeDialog, setOpenUpgradeDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
    saveCard: true
  });
  // Fetch subscriptions and plans from backend
  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/users/subscriptions');
        
        if (response.data.success) {
          const data = response.data.data;
          
          // Set available plans
          setAvailablePlans(data.plans || []);
          
          // Set billing history/subscriptions
          setSubscriptions(data.billingHistory || []);
          
          // Set current plan
          setCurrentPlan(data.currentPlan || null);
          
          setError(null);
        } else {
          throw new Error(response.data.message || 'Failed to fetch subscription data');
        }
      } catch (err) {
        console.error('Error fetching subscriptions:', err);
        setError('Failed to load subscription data. Please try again.');
        
        // Provide fallback data
        setAvailablePlans([
          {
            id: 1,
            name: 'Basic Plan',
            price: 29.99,
            billing_cycle: 'monthly',
            features: ['Basic Trading Signals', 'Email Support', 'Mobile App Access'],
            description: 'Perfect for beginners'
          },
          {
            id: 2,
            name: 'Premium Plan',
            price: 79.99,
            billing_cycle: 'monthly',
            features: ['Advanced Trading Signals', 'Priority Support', 'Copy Trading', 'Educational Content'],
            description: 'For active traders'
          },
          {
            id: 3,
            name: 'VIP Plan',
            price: 199.99,
            billing_cycle: 'monthly',
            features: ['All Premium Features', 'Personal Account Manager', '1-on-1 Trading Sessions', 'Priority Support'],
            description: 'For professionals'
          }
        ]);
        setSubscriptions([]);
        setCurrentPlan(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionData();
  }, []);

  // Listen for real-time updates
  useEffect(() => {
    try {
      // Connect to websocket service
      websocketService.connect();
      
      // Listen for subscription updates
      const handleSubscriptionUpdate = (data) => {
        setSubscriptions(data || []);
      };
      
      websocketService.on('subscriptionsUpdated', handleSubscriptionUpdate);
      
      return () => {
        try {
          websocketService.off('subscriptionsUpdated', handleSubscriptionUpdate);
        } catch (error) {
          console.warn('Error cleaning up WebSocket subscription:', error);
        }
      };
    } catch (error) {
      console.warn('WebSocket connection failed:', error);
      // Continue without WebSocket - component should still work
    }
  }, []);

  if (loading) return <LinearProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  // Derive billing history from subscriptions
  const subscriptionsArray = Array.isArray(subscriptions) ? subscriptions : [];
  const billingHistory = subscriptionsArray.map((s, idx) => ({
    id: s._id || s.id || idx,
    date: s.startDate || s.createdAt || new Date().toISOString(),
    plan: s.plan || s.name || 'Basic Plan',
    amount: s.amount || s.price || 0,
    status: s.status || 'active',
    invoice: s._id || s.id ? `INV-${s._id || s.id}` : `INV-${idx + 1000}`
  }));
  
  // Get current plan info
  const currentPlanName = currentPlan?.name || 'Free';
  const currentPlanStatus = currentPlan?.status || 'active';
  const subscriptionEndDate = currentPlan?.end_date ? new Date(currentPlan.end_date) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  // Helper function to parse features from JSON string
  const parseFeatures = (features) => {
    if (Array.isArray(features)) return features;
    if (typeof features === 'string') {
      try {
        return JSON.parse(features);
      } catch {
        return [features];
      }
    }
    return [];
  };
  
  // Helper function to get plan description
  const getPlanDescription = (planName) => {
    const name = planName?.toLowerCase() || '';
    if (name.includes('basic')) return 'Perfect for beginners';
    if (name.includes('premium') || name.includes('pro')) return 'For active traders';
    if (name.includes('vip') || name.includes('enterprise')) return 'For professionals';
    return 'Great choice for traders';
  };

  // Handle subscription upgrade
  const handleUpgradeClick = (planId) => {
    const plan = availablePlans.find(p => p.id === planId);
    if (plan) {
      setSelectedPlan(plan);
      setOpenUpgradeDialog(true);
    }
  };

  // Handle subscription purchase
  const handleSubscriptionPurchase = async () => {
    if (!selectedPlan) return;

    try {
      // Check if it's a crypto payment method
      const cryptoMethods = ['bitcoin', 'ethereum', 'usdttrc20', 'usdtbsc'];
      
      if (cryptoMethods.includes(paymentMethod)) {
        // Map frontend payment method to NOWPayments currency code
        const currencyMap = {
          'bitcoin': 'btc',
          'ethereum': 'eth',
          'usdttrc20': 'usdttrc20',
          'usdtbsc': 'usdtbsc'
        };
        
        // Create NOWPayments crypto payment for subscription
        const response = await api.post('/api/payments/subscription', {
          amount: selectedPlan.price,
          planId: selectedPlan.id,
          pay_currency: currencyMap[paymentMethod]
        });
        
        if (response.data.success) {
          const paymentData = response.data.data;
          
          // Show payment details to user
          const paymentInfo = `Subscription Payment Created Successfully!

Plan: ${selectedPlan.name}
Amount: $${selectedPlan.price}

Crypto Payment Details:
Amount to Pay: ${paymentData.pay_amount} ${paymentData.pay_currency}
Payment Address: ${paymentData.pay_address}

Please send exactly ${paymentData.pay_amount} ${paymentData.pay_currency} to the address above.

Payment will expire in 30 minutes.
Order ID: ${paymentData.order_id}

Your subscription will be activated once payment is confirmed.`;
          
          alert(paymentInfo);
          setSuccess('Subscription payment created! Please complete the crypto payment.');
          setOpenUpgradeDialog(false);
        } else {
          throw new Error(response.data.message || 'Failed to create subscription payment');
        }
      } else {
        // Handle non-crypto payments (create subscription with pending status)
        const response = await api.post('/api/subscriptions', {
          planId: selectedPlan.id,
          paymentMethod: paymentMethod,
          paymentDetails: paymentDetails
        });
        
        if (response.data.success) {
          setSuccess('Subscription created! Please contact support for payment instructions.');
          setOpenUpgradeDialog(false);
        }
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      setError(error.response?.data?.message || 'Failed to create subscription');
    }
  };

  // Helper functions for selected plan data
  const getSelectedPlanData = () => {
    return availablePlans.find(plan => plan.id === selectedPlan);
  };
  
  const getSelectedPlanName = () => {
    const plan = getSelectedPlanData();
    return plan?.name || 'Unknown Plan';
  };
  
  const getSelectedPlanPrice = () => {
    const plan = getSelectedPlanData();
    return plan?.price ? parseFloat(plan.price).toFixed(2) : '0.00';
  };
  
  const getSelectedPlanBillingCycle = () => {
    const plan = getSelectedPlanData();
    return plan?.billing_cycle === 'yearly' ? 'year' : 'month';
  };

  // Handle dialog close
  const handleCloseUpgradeDialog = () => {
    setOpenUpgradeDialog(false);
    setSelectedPlan(null);
    setPaymentMethod('card');
  };

  // Handle payment details change
  const handlePaymentDetailsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPaymentDetails(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle subscription submit
  const handleSubscriptionSubmit = (e) => {
    e.preventDefault();
    handleSubscriptionPurchase();
  };

  // Handle payment method change
  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  // Payment methods array
  const paymentMethods = [
    {
      id: 'bitcoin',
      name: 'Bitcoin (BTC)',
      icon: <CurrencyBitcoin />,
      minAmount: 50
    },
    {
      id: 'ethereum',
      name: 'Ethereum (ETH)',
      icon: <AccountBalanceWallet />,
      minAmount: 30
    },
    {
      id: 'usdttrc20',
      name: 'USDT (TRC20)',
      icon: <AccountBalanceWallet />,
      minAmount: 20
    },
    {
      id: 'usdtbsc',
      name: 'USDT (BSC)',
      icon: <AccountBalanceWallet />,
      minAmount: 20
    },
    {
      id: 'card',
      name: 'Credit Card',
      icon: <CreditCard />,
      minAmount: 20
    },
    {
      id: 'bank',
      name: 'Bank Transfer',
      icon: <AccountBalance />,
      minAmount: 20
    }
  ];
  
  const getStatusChip = (status) => {
    switch(status) {
      case 'paid':
        return <Chip label="Paid" color="success" size="small" variant="outlined" />;
      case 'pending':
        return <Chip label="Pending" color="warning" size="small" variant="outlined" />;
      case 'refunded':
        return <Chip label="Refunded" color="default" size="small" variant="outlined" />;
      case 'failed':
        return <Chip label="Failed" color="error" size="small" variant="outlined" />;
      default:
        return <Chip label={status} size="small" variant="outlined" />;
    }
  };
  
  // subscriptionEndDate is already calculated above from currentSubscription
  
  return (
    <Box>
      <Typography variant="h5" gutterBottom>Subscription & Billing</Typography>
      
      {/* Success Alert */}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box>
                  <Typography variant="h6" component="div">
                    Current Plan: <strong>{currentPlanName}</strong>
                    <Chip 
                      label={currentPlanStatus || 'Active'} 
                      color={currentPlanStatus === 'pending' ? 'warning' : 'success'} 
                      size="small" 
                      sx={{ ml: 1 }} 
                    />
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {!currentPlan || currentPlanName === 'Free'
                      ? 'You are currently on the free plan with limited features.' 
                      : subscriptionEndDate 
                        ? `Your subscription will renew on ${subscriptionEndDate.toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}` 
                        : 'Subscription details loading...'
                    }
                  </Typography>
                </Box>
                {currentPlan && currentPlanName !== 'Free' && (
                  <Button 
                    variant="outlined" 
                    color="error"
                    size="small"
                  >
                    Cancel Subscription
                  </Button>
                )}
              </Box>
              
              {currentPlan && currentPlanName !== 'Free' && (
                <Box mt={2}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">
                      Next billing date: {subscriptionEndDate.toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      ${currentPlan.price ? parseFloat(currentPlan.price).toFixed(2) : '0.00'} / {currentPlan.billing_cycle === 'yearly' ? 'year' : 'month'}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={75} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      mb: 1
                    }} 
                  />
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">
                      {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {subscriptionEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Typography>
                  </Box>
                </Box>
              )}
            </CardContent>
            
            {(!currentPlan || currentPlanName === 'Free') && availablePlans.length > 0 && (
              <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 0 }}>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => handleUpgradeClick(availablePlans[0]?.id)}
                  endIcon={<ArrowForward />}
                >
                  Upgrade Plan
                </Button>
              </CardActions>
            )}
          </Card>
          
          <Typography variant="h6" gutterBottom>Available Plans</Typography>
          <Grid container spacing={3}>
            {availablePlans.map((plan, index) => (
              <Grid item xs={12} sm={6} md={4} key={plan.id}>
                <Card 
                  variant={currentPlan?.id === plan.id ? 'elevation' : 'outlined'}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    border: currentPlan?.id === plan.id ? `2px solid ${theme.palette.primary.main}` : 'none',
                    position: 'relative',
                    overflow: 'visible',
                    ...(index === 1 && {
                      border: `2px solid ${theme.palette.primary.main}`,
                      boxShadow: theme.shadows[5],
                      transform: 'scale(1.02)',
                      zIndex: 1
                    })
                  }}
                >
                  {index === 1 && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -10,
                        right: 20,
                        backgroundColor: theme.palette.primary.main,
                        color: theme.palette.primary.contrastText,
                        px: 2,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        boxShadow: theme.shadows[2]
                      }}
                    >
                      Most Popular
                    </Box>
                  )}
                  
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <div>
                        <Typography variant="h6" component="div">
                          {plan.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {plan.description || getPlanDescription(plan.name)}
                        </Typography>
                      </div>
                      <Typography variant="h5" component="div">
                        {plan.price === 0 ? 'Free' : `$${plan.price}`}
                        {plan.price > 0 && (
                          <Typography component="span" variant="body2" color="text.secondary">
                            /{plan.billing_cycle === 'yearly' ? 'year' : 'month'}
                          </Typography>
                        )}
                      </Typography>
                    </Box>
                    
                    <List dense disablePadding>
                      {parseFeatures(plan.features).map((feature, featureIndex) => (
                        <ListItem key={featureIndex} disableGutters sx={{ py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <CheckCircle color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={feature} />
                        </ListItem>
                      ))}
                      
                      {plan.limitations && plan.limitations.map((limitation, index) => (
                        <ListItem key={`limitation-${index}`} disableGutters sx={{ py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <Close color="disabled" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={limitation} 
                            primaryTypographyProps={{ 
                              color: 'text.disabled',
                              sx: { textDecoration: 'line-through' }
                            }} 
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                  
                  <Box sx={{ p: 2, pt: 0, mt: 'auto' }}>
                    <Button
                      fullWidth
                      variant={currentPlan?.id === plan.id ? 'outlined' : 'contained'}
                      color={index === 1 ? 'primary' : 'inherit'}
                      disabled={currentPlan?.id === plan.id}
                      onClick={() => handleUpgradeClick(plan.id)}
                      startIcon={currentPlan?.id === plan.id ? <CheckCircle /> : null}
                    >
                      {currentPlan?.id === plan.id ? 'Current Plan' : 
                       plan.price === 0 ? 'Select Free Plan' : 'Upgrade Now'}
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>Billing History</Typography>
            <Card variant="outlined">
              <List disablePadding>
                {billingHistory.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <ListItem 
                      secondaryAction={
                        <Box textAlign="right">
                          <Typography variant="subtitle2">
                            ${typeof item.amount === 'number' ? item.amount.toFixed(2) : parseFloat(item.amount || 0).toFixed(2)}
                          </Typography>
                          {getStatusChip(item.status)}
                        </Box>
                      }
                    >
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center">
                            <Receipt sx={{ mr: 1, color: 'text.secondary' }} />
                            {item.plan} Plan
                            <Typography variant="body2" color="text.secondary" component="span" sx={{ ml: 1 }}>
                              ({item.invoice})
                            </Typography>
                          </Box>
                        }
                        secondary={item.date ? new Date(item.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'Date unavailable'}
                      />
                    </ListItem>
                    {index < billingHistory.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </Card>
            <Box textAlign="center" mt={2}>
              <Button>View Full Billing History</Button>
            </Box>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Plan Comparison</Typography>
              <List dense disablePadding>
                {[
                  'Trading Signals',
                  'Real-time Data',
                  'Technical Indicators',
                  'Copy Trading',
                  'Premium Support',
                  'Advanced Analytics',
                  '1-on-1 Sessions'
                ].map((feature) => (
                  <ListItem key={feature} disableGutters sx={{ py: 0.5 }}>
                    <ListItemText primary={feature} />
                    <Box display="flex" width={200} justifyContent="space-between">
                      <Box textAlign="center" width="25%">
                        {['Trading Signals', 'Real-time Data', 'Technical Indicators'].includes(feature) ? (
                          <CheckCircle color="primary" fontSize="small" />
                        ) : (
                          <Close color="disabled" fontSize="small" />
                        )}
                      </Box>
                      <Box textAlign="center" width="25%">
                        {['Trading Signals', 'Real-time Data', 'Technical Indicators', 'Copy Trading', 'Premium Support'].includes(feature) ? (
                          <CheckCircle color="primary" fontSize="small" />
                        ) : (
                          <Close color="disabled" fontSize="small" />
                        )}
                      </Box>
                      <Box textAlign="center" width="25%">
                        <CheckCircle color="primary" fontSize="small" />
                      </Box>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
          
          <Card variant="outlined">
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Security color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Security & Privacy</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Your payment information is encrypted and secure. We use industry-standard SSL encryption to protect your data.
              </Typography>
              <Box display="flex" alignItems="center" color="text.secondary">
                <InfoOutlined fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="caption">
                  Read our <button type="button" style={{ color: 'inherit', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}>Privacy Policy</button> and <button type="button" style={{ color: 'inherit', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}>Terms of Service</button>
                </Typography>
              </Box>
            </CardContent>
          </Card>
          
          <Box mt={3} textAlign="center">
            <Button 
              variant="outlined" 
              startIcon={<HelpOutline />}
              fullWidth
            >
              Need Help? Contact Support
            </Button>
          </Box>
        </Grid>
      </Grid>
      
      {/* Upgrade Dialog */}
      <Dialog 
        open={openUpgradeDialog} 
        onClose={handleCloseUpgradeDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <span>Upgrade to {getSelectedPlanName()} Plan</span>
            <IconButton 
              edge="end" 
              onClick={handleCloseUpgradeDialog}
              size="small"
            >
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <form onSubmit={handleSubscriptionSubmit}>
          <DialogContent dividers>
            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}
            
            {selectedPlan && (
              <Box mb={3}>
                <Box 
                  p={2} 
                  bgcolor="primary.light" 
                  color="primary.contrastText"
                  borderRadius={1}
                  mb={2}
                >
                  <Typography variant="h6" gutterBottom>
                    {getSelectedPlanName()} Plan - 
                    ${getSelectedPlanPrice()} per {getSelectedPlanBillingCycle()}
                  </Typography>
                  <Typography variant="body2">
                    Billed {getSelectedPlanBillingCycle() === 'year' ? 'yearly' : 'monthly'}. Cancel anytime.
                  </Typography>
                </Box>
                
                <Typography variant="subtitle2" gutterBottom>
                  Payment Method
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1} mb={3}>
                  {paymentMethods.map((method) => (
                    <Button
                      key={method.id}
                      variant={paymentMethod === method.id ? 'contained' : 'outlined'}
                      onClick={() => handlePaymentMethodChange(method.id)}
                      startIcon={method.icon}
                      size={isMobile ? 'small' : 'medium'}
                      sx={{
                        flex: isMobile ? '1 1 calc(50% - 8px)' : '1 1 auto',
                        textTransform: 'none',
                        ...(paymentMethod === method.id && {
                          borderColor: 'primary.main',
                          backgroundColor: 'primary.light',
                          color: 'primary.contrastText',
                          '&:hover': {
                            backgroundColor: 'primary.main',
                          },
                        }),
                      }}
                    >
                      {method.name}
                    </Button>
                  ))}
                </Box>
                
                {paymentMethod === 'card' && (
                  <Box>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Card Number"
                          name="cardNumber"
                          value={paymentDetails.cardNumber}
                          onChange={handlePaymentDetailsChange}
                          placeholder="1234 5678 9012 3456"
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Expiry Date"
                          name="expiryDate"
                          value={paymentDetails.expiryDate}
                          onChange={handlePaymentDetailsChange}
                          placeholder="MM/YY"
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="CVV"
                          name="cvv"
                          value={paymentDetails.cvv}
                          onChange={handlePaymentDetailsChange}
                          placeholder="123"
                          type="password"
                          required
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Name on Card"
                          name="nameOnCard"
                          value={paymentDetails.nameOnCard}
                          onChange={handlePaymentDetailsChange}
                          required
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={paymentDetails.saveCard}
                              onChange={handlePaymentDetailsChange}
                              name="saveCard"
                              color="primary"
                            />
                          }
                          label="Save card for future payments"
                        />
                      </Grid>
                    </Grid>
                  </Box>
                )}
                
                {paymentMethod === 'crypto' && (
                  <Box textAlign="center" py={3}>
                    <CurrencyBitcoin sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
                    <Typography variant="body1" paragraph>
                      Pay with CurrencyBitcoin, Ethereum, or other cryptocurrencies
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      You'll be redirected to our secure payment processor to complete your transaction.
                    </Typography>
                  </Box>
                )}
                
                {paymentMethod === 'paypal' && (
                  <Box textAlign="center" py={3}>
                    <Payment sx={{ fontSize: 48, color: 'info.main', mb: 2 }} />
                    <Typography variant="body1" paragraph>
                      You'll be redirected to PayPal to complete your purchase
                    </Typography>
                  </Box>
                )}
                
                {paymentMethod === 'bank' && (
                  <Box py={2}>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Please make a bank transfer to the following account:
                    </Typography>
                    <Box bgcolor="grey.100" p={2} borderRadius={1} mb={2}>
                      <Typography variant="body2" fontFamily="monospace">
                        Bank Name: Hills Capital Bank<br />
                        Account Name: Hills Capital Trade Inc.<br />
                        Account Number: 1234567890<br />
                        SWIFT/BIC: HCBKUS33<br />
                        Reference: SUB-{Math.random().toString(36).substr(2, 8).toUpperCase()}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Please include the reference number in your transfer. Your subscription will be activated once payment is received.
                    </Typography>
                  </Box>
                )}
                
                <Box mt={3} p={2} bgcolor="grey.50" borderRadius={1}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography>Plan:</Typography>
                    <Typography fontWeight="medium">
                      {selectedPlan ? `${getSelectedPlanName()} ($${getSelectedPlanPrice()}/${getSelectedPlanBillingCycle()})` : 'No plan selected'}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography>Billing Cycle:</Typography>
                    <Typography>{getSelectedPlanBillingCycle() === 'year' ? 'Yearly' : 'Monthly'}</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="subtitle1">Total Due Today:</Typography>
                    <Typography variant="h6" color="primary">
                      ${selectedPlan ? getSelectedPlanPrice() : '0.00'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
            
            <Box mt={2}>
              <FormControlLabel
                control={<Checkbox defaultChecked required />}
                label={
                  <Typography variant="body2">
                    I agree to the <button type="button" style={{ color: theme.palette.primary.main, background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}>Terms of Service</button> and <button type="button" style={{ color: theme.palette.primary.main, background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}>Privacy Policy</button>
                  </Typography>
                }
              />
            </Box>
          </DialogContent>
          
          <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
            <Button onClick={handleCloseUpgradeDialog} color="inherit">
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              size="large"
              disabled={loading}
              endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ArrowForward />}
            >
              {loading ? 'Processing...' : 'Complete Subscription'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Subscription;
