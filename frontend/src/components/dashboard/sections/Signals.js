import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Tabs,
  Tab,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';

import {
  Notifications as NotificationsIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
  Telegram as TelegramIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { signalsApi } from '../../../services/adminApi';

const Signals = () => {
  const [actionLoading, setActionLoading] = useState(null);
  const [editSignal, setEditSignal] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Edit handler (scaffold)
  const handleEdit = (signal) => {
    setEditSignal(signal);
    setEditDialogOpen(true);
  };

  // Status change handler
  const handleStatusChange = async (id, newStatus) => {
    setActionLoading(id);
    try {
      await signalsApi.updateSignal(id, { status: newStatus });
      // Real-time update via Socket.IO
    } catch (e) {
      alert('Failed to update status');
    }
    setActionLoading(null);
  };

  // Delete handler
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this signal?')) return;
    setActionLoading(id);
    try {
      await signalsApi.deleteSignal(id);
    } catch (e) {
      alert('Failed to delete signal');
    }
    setActionLoading(null);
  };

  const [tabValue, setTabValue] = useState(0);
  const [subscriptionStatus, setSubscriptionStatus] = useState({
    isActive: false,
    plan: 'Free',
    expiresAt: null,
    signalsReceived: 0,
    maxSignals: 10
  });
  
  const [signals, setSignals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  
  // Fetch subscription status from backend
  const fetchSubscriptionStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/subscriptions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data && data.data.length > 0) {
          const activeSubscription = data.data.find(sub => sub.status === 'active');
          if (activeSubscription) {
            setSubscriptionStatus({
              isActive: true,
              plan: activeSubscription.plan?.name || 'Premium',
              expiresAt: activeSubscription.endDate,
              signalsReceived: 0,
              maxSignals: activeSubscription.plan?.maxSignals || 100
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching subscription status:', error);
    }
  };

  // Fetch subscription plans from backend
  const fetchSubscriptionPlans = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/subscription-plans`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setSubscriptionPlans(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      // Fallback to default plans if API fails
      setSubscriptionPlans([
        {
          id: 1,
          name: 'Free',
          price: 0,
          billingCycle: 'month',
          features: ['Up to 3 signals per week', 'Basic signal information', 'Email notifications'],
          maxSignals: 3
        },
        {
          id: 2,
          name: 'Pro',
          price: 49.99,
          billingCycle: 'month',
          features: ['Up to 10 signals per week', 'Detailed analysis', 'Real-time notifications'],
          maxSignals: 10
        },
        {
          id: 3,
          name: 'VIP',
          price: 99.99,
          billingCycle: 'month',
          features: ['Unlimited signals', 'Detailed analysis + charts', '24/7 support'],
          maxSignals: 999
        }
      ]);
    }
  };

  // Fetch signals from backend and listen for real-time updates
  useEffect(() => {
    const fetchSignals = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No authentication token found');
          setSignals([]);
          return;
        }
        
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/signals`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Signals API response:', data);
        
        if (data.success) {
          setSignals(Array.isArray(data.data) ? data.data : []);
        } else {
          console.error('API returned error:', data.message);
          setSignals([]);
        }
      } catch (error) {
        console.error('Error fetching signals:', error);
        setSignals([]); // Set empty array on error
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch signals, subscription status, and plans
    fetchSignals();
    fetchSubscriptionStatus();
    fetchSubscriptionPlans();

    // Socket.IO for real-time updates
    try {
      const socket = window.io ? window.io('https://api.hillscapitaltrade.com') : undefined;
      if (socket) {
        socket.on('signalsUpdated', (data) => {
          console.log('Real-time signals update:', data);
          setSignals(Array.isArray(data) ? data : []);
        });
        return () => { 
          if (socket) {
            socket.disconnect();
          }
        };
      }
    } catch (socketError) {
      console.error('Socket.IO error:', socketError);
    }
  }, []);

  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleSubscribe = async (plan) => {
    try {
      setIsLoading(true);
      
      // Show payment method selection dialog
      const paymentMethod = window.prompt(
        `Subscribe to ${plan.name} for $${plan.price}/${plan.billingCycle}\n\nChoose payment method:\n1. Credit Card\n2. PayPal\n3. Bank Transfer\n\nEnter 1, 2, or 3:`
      );
      
      if (!paymentMethod || !['1', '2', '3'].includes(paymentMethod)) {
        setIsLoading(false);
        return;
      }
      
      const paymentMethods = {
        '1': 'credit_card',
        '2': 'paypal', 
        '3': 'bank_transfer'
      };
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/subscriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          planId: plan.id,
          paymentMethod: paymentMethods[paymentMethod],
          amount: plan.price,
          currency: 'USD'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update subscription status
        setSubscriptionStatus({
          isActive: true,
          plan: plan.name,
          expiresAt: data.data.endDate,
          signalsReceived: 0,
          maxSignals: plan.maxSignals
        });
        
        alert(`Successfully subscribed to ${plan.name} plan!`);
      } else {
        throw new Error(data.message || 'Subscription failed');
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      alert('Failed to subscribe. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        setSignals([]);
        return;
      }
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/signals`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Refresh signals API response:', data);
      
      if (data.success) {
        setSignals(Array.isArray(data.data) ? data.data : []);
      } else {
        console.error('API returned error:', data.message);
        setSignals([]);
      }
      
      // Also refresh subscription status
      await fetchSubscriptionStatus();
    } catch (error) {
      console.error('Error refreshing signals:', error);
      setSignals([]);
    } finally {
      setIsLoading(false);
    }
  };
  

  
  const getSignalStatusChip = (status, result) => {
    if (result === 'win') {
      return <Chip icon={<CheckCircleIcon />} label="Win" color="success" size="small" />;
    } else if (result === 'loss') {
      return <Chip icon={<CancelIcon />} label="Loss" color="error" size="small" />;
    } else if (status === 'active') {
      return <Chip icon={<PendingIcon />} label="Active" color="primary" size="small" />;
    } else {
      return <Chip label="Pending" size="small" />;
    }
  };
  
  const getSignalTypeChip = (type) => {
    return (
      <Chip 
        label={type} 
        color={type === 'BUY' ? 'success' : 'error'}
        variant="outlined"
        size="small"
      />
    );
  };

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Trading Signals</Typography>
        <Box>
          <Tooltip title="Refresh signals">
            <span>
              <IconButton onClick={handleRefresh} disabled={isLoading}>
                <RefreshIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Filter signals">
            <IconButton>
              <FilterListIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      <Tabs 
        value={tabValue} 
        onChange={handleTabChange} 
        sx={{ mb: 3 }}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label="My Signals" />
        <Tab label="Subscribe" />
        <Tab label="Notification Settings" />
      </Tabs>
      
      {tabValue === 0 && (
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">Recent Trading Signals</Typography>
              <Box>
                <Chip 
                  label={`${subscriptionStatus.signalsReceived}/${subscriptionStatus.maxSignals} signals this week`} 
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Box>
            
            {isLoading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <Typography>Loading signals...</Typography>
              </Box>
            ) : signals.length === 0 ? (
              <Box textAlign="center" py={4}>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  No signals available.
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<SendIcon />}
                  onClick={() => setTabValue(1)}
                >
                  Subscribe to Get Signals
                </Button>
              </Box>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Pair</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Entry</TableCell>
                      <TableCell>Targets</TableCell>
                      <TableCell>Stop Loss</TableCell>
                      <TableCell>Leverage</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {signals.map((signal) => (
                      <TableRow key={signal._id || signal.id} hover>
                        <TableCell>
                          <Typography fontWeight="bold">{signal.pair}</Typography>
                        </TableCell>
                        <TableCell>{getSignalTypeChip(signal.type)}</TableCell>
                        <TableCell>{signal.entry}</TableCell>
                        <TableCell>
                          {signal.targets && signal.targets.map((target, idx) => (
                            <Box key={idx} color={idx === 0 ? 'primary.main' : 'inherit'}>
                              {target} {idx < signal.targets.length - 1 ? '→' : ''}
                            </Box>
                          ))}
                        </TableCell>
                        <TableCell>{signal.stopLoss}</TableCell>
                        <TableCell>{signal.leverage}</TableCell>
                        <TableCell>
                          {signal.timestamp && !isNaN(new Date(signal.timestamp).getTime()) 
                            ? format(new Date(signal.timestamp), 'MMM d, yyyy HH:mm')
                            : signal.createdAt && !isNaN(new Date(signal.createdAt).getTime())
                            ? format(new Date(signal.createdAt), 'MMM d, yyyy HH:mm')
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {getSignalStatusChip(signal.status, signal.result)}
                        </TableCell>
                        <TableCell>
                          <Button size="small" variant="outlined" color="primary" sx={{ mr: 1 }} onClick={() => handleEdit(signal)} disabled={actionLoading === signal._id}>Edit</Button>
                          <FormControl size="small" sx={{ minWidth: 100, mr: 1 }}>
                            <Select
                              value={signal.status}
                              onChange={e => handleStatusChange(signal._id, e.target.value)}
                              disabled={actionLoading === signal._id}
                            >
                              <MenuItem value="active">Active</MenuItem>
                              <MenuItem value="pending">Pending</MenuItem>
                              <MenuItem value="closed">Closed</MenuItem>
                            </Select>
                          </FormControl>
                          <Button size="small" variant="outlined" color="error" onClick={() => handleDelete(signal._id)} disabled={actionLoading === signal._id}>Delete</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}
      
      {tabValue === 1 && (
        <Box>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Current Subscription</Typography>
              <Box 
                p={2} 
                bgcolor="action.hover" 
                borderRadius={1}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography variant="h6">
                    {subscriptionStatus.plan} Plan
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {subscriptionStatus.isActive && subscriptionStatus.expiresAt
                      ? `Expires on ${format(new Date(subscriptionStatus.expiresAt), 'MMM d, yyyy')}` 
                      : subscriptionStatus.isActive ? 'Active' : 'Not active'}
                  </Typography>
                </Box>
                <Chip 
                  label={subscriptionStatus.isActive ? 'Active' : 'Inactive'} 
                  color={subscriptionStatus.isActive ? 'success' : 'default'}
                  variant="outlined"
                />
              </Box>
            </CardContent>
          </Card>
          <Typography variant="h6" gutterBottom>Available Plans</Typography>
          <Grid container spacing={3}>
            {subscriptionPlans.map((plan) => (
              <Grid item xs={12} md={4} key={plan.id}>
                <Card 
                  variant={plan.popular ? 'outlined' : 'elevation'}
                  sx={{
                    height: '100%',
                    borderColor: plan.popular ? 'primary.main' : 'divider',
                    borderWidth: plan.popular ? 2 : 1,
                    position: 'relative',
                    '&:hover': {
                      boxShadow: 3,
                      transform: 'translateY(-4px)',
                      transition: 'all 0.3s ease',
                    },
                  }}
                >
                  {plan.popular && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        right: 20,
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        px: 2,
                        py: 0.5,
                        borderBottomLeftRadius: 4,
                        borderBottomRightRadius: 4,
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                      }}
                    >
                      MOST POPULAR
                    </Box>
                  )}
                  <CardContent sx={{ pt: plan.popular ? 4 : 2 }}>
                    <Typography variant="h5" gutterBottom>
                      {plan.name}
                    </Typography>
                    <Box mb={3}>
                      <Typography variant="h4" component="span">
                        ${plan.price}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" component="span">
                        /month
                      </Typography>
                    </Box>
                    
                    <List dense>
                      {plan.features.map((feature, idx) => (
                        <ListItem key={idx} disableGutters>
                          <ListItemAvatar sx={{ minWidth: 32 }}>
                            <CheckCircleIcon color="primary" fontSize="small" />
                          </ListItemAvatar>
                          <ListItemText primary={feature} />
                        </ListItem>
                      ))}
                    </List>
                    
                    <Box mt={3}>
                      <Button
                        fullWidth
                        variant={plan.popular ? 'contained' : 'outlined'}
                        color={plan.popular ? 'primary' : 'inherit'}
                        size="large"
                        onClick={() => handleSubscribe(plan)}
                        disabled={subscriptionStatus.plan === plan.name}
                      >
                        {subscriptionStatus.plan === plan.name 
                          ? 'Current Plan' 
                          : plan.price === 0 
                            ? 'Get Started' 
                            : 'Subscribe Now'}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
      
      {tabValue === 2 && (
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Notification Settings</Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Choose how you want to receive trading signals and updates.
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={2}>
                        <TelegramIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="subtitle1">Telegram Notifications</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Receive instant signals and updates directly to your Telegram.
                      </Typography>
                      <Button 
                        variant="outlined" 
                        startIcon={<TelegramIcon />}
                        href="https://t.me/yourchannel"
                        target="_blank"
                      >
                        Join Telegram Channel
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={2}>
                        <EmailIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="subtitle1">Email Notifications</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Get signals delivered to your email inbox.
                      </Typography>
                      <FormControl fullWidth>
                        <InputLabel>Email Frequency</InputLabel>
                        <Select
                          value="realtime"
                          label="Email Frequency"
                          size="small"
                        >
                          <MenuItem value="realtime">Real-time (immediate)</MenuItem>
                          <MenuItem value="daily">Daily Digest</MenuItem>
                          <MenuItem value="weekly">Weekly Summary</MenuItem>
                          <MenuItem value="none">Disabled</MenuItem>
                        </Select>
                      </FormControl>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        SMS Notifications
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Receive important alerts via SMS (standard messaging rates may apply).
                      </Typography>
                      <Box display="flex" alignItems="center" flexWrap="wrap" gap={2}>
                        <TextField
                          label="Phone Number"
                          placeholder="+1 (___) ___-____"
                          size="small"
                          sx={{ flex: 1, minWidth: 200 }}
                        />
                        <Button variant="contained">Save</Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      )}
      
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Signal</DialogTitle>
        <DialogContent>
          {editSignal && (
            <Box component="form" sx={{ mt: 2 }}>
              <TextField label="Pair" value={editSignal.pair || ''} onChange={e => setEditSignal({ ...editSignal, pair: e.target.value })} fullWidth margin="normal" />
              <FormControl fullWidth margin="normal">
                <InputLabel>Type</InputLabel>
                <Select value={editSignal.type || ''} onChange={e => setEditSignal({ ...editSignal, type: e.target.value })} label="Type">
                  <MenuItem value="BUY">BUY</MenuItem>
                  <MenuItem value="SELL">SELL</MenuItem>
                </Select>
              </FormControl>
              <TextField label="Entry" value={editSignal.entry || ''} onChange={e => setEditSignal({ ...editSignal, entry: e.target.value })} fullWidth margin="normal" />
              <TextField label="Targets (comma separated)" value={editSignal.targets ? editSignal.targets.join(',') : ''} onChange={e => setEditSignal({ ...editSignal, targets: e.target.value.split(',').map(t => t.trim()) })} fullWidth margin="normal" />
              <TextField label="Stop Loss" value={editSignal.stopLoss || ''} onChange={e => setEditSignal({ ...editSignal, stopLoss: e.target.value })} fullWidth margin="normal" />
              <TextField label="Leverage" value={editSignal.leverage || ''} onChange={e => setEditSignal({ ...editSignal, leverage: e.target.value })} fullWidth margin="normal" />
              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select value={editSignal.status || ''} onChange={e => setEditSignal({ ...editSignal, status: e.target.value })} label="Status">
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="closed">Closed</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal">
                <InputLabel>Result</InputLabel>
                <Select value={editSignal.result || ''} onChange={e => setEditSignal({ ...editSignal, result: e.target.value })} label="Result">
                  <MenuItem value="win">Win</MenuItem>
                  <MenuItem value="loss">Loss</MenuItem>
                  <MenuItem value="">None</MenuItem>
                </Select>
              </FormControl>
              <TextField label="Timestamp" type="datetime-local" value={editSignal.timestamp ? new Date(editSignal.timestamp).toISOString().slice(0,16) : ''} onChange={e => setEditSignal({ ...editSignal, timestamp: new Date(e.target.value).toISOString() })} fullWidth margin="normal" />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} color="secondary">Cancel</Button>
          <Button onClick={async () => {
            setActionLoading(editSignal._id);
            try {
              await signalsApi.updateSignal(editSignal._id, editSignal);
              setEditDialogOpen(false);
            } catch (e) {
              alert('Failed to update signal');
            }
            setActionLoading(null);
          }} color="primary" variant="contained" disabled={actionLoading === editSignal?._id}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Signals;
