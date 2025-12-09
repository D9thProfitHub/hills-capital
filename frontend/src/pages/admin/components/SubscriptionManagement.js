import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Badge,
  Avatar,
  Switch,
  FormControlLabel,
  LinearProgress,
  InputAdornment
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Subscriptions,
  AttachMoney,
  Schedule,
  Refresh,
  Cancel,
  CheckCircle
} from '@mui/icons-material';

const SubscriptionManagement = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState([]);
  const [plans, setPlans] = useState([]);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [plansDialogOpen, setPlansDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [dialogType, setDialogType] = useState('view'); // 'view', 'edit'
  const [statusFilter, setStatusFilter] = useState('all');
  const [tabValue, setTabValue] = useState(0);
  const [createPlanDialogOpen, setCreatePlanDialogOpen] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: '',
    description: '',
    price: '',
    billingCycle: 'monthly',
    features: [''],
    maxSignals: '',
    hasBotAccess: false,
    hasCopyTrading: false,
    supportLevel: 'basic',
    isActive: true
  });

  useEffect(() => {
    fetchSubscriptions();
    fetchSubscriptionPlans();
  }, []);

  useEffect(() => {
    filterSubscriptions();
  }, [subscriptions, statusFilter]);

  const fetchSubscriptions = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://api.hillscapitaltrade.com/api/admin/subscriptions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch subscriptions');
      const data = await res.json();
      setSubscriptions(data.subscriptions || []);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    }
  };

  const fetchSubscriptionPlans = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://api.hillscapitaltrade.com/api/admin/subscription-plans', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch subscription plans');
      const data = await res.json();
      setPlans(data.plans || []);
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      // Fallback to empty array on error
      setPlans([]);
    }
  };

  const filterSubscriptions = () => {
    if (statusFilter === 'all') {
      setFilteredSubscriptions(subscriptions);
    } else {
      setFilteredSubscriptions(subscriptions.filter(sub => sub.status === statusFilter));
    }
  };

  const handleViewSubscription = (subscription) => {
    setSelectedSubscription(subscription);
    setDialogType('view');
    setDialogOpen(true);
  };

  const handleEditSubscription = (subscription) => {
    setSelectedSubscription(subscription);
    setDialogType('edit');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedSubscription(null);
  };

  const handleSaveSubscription = async () => {
    try {
      setSubscriptions(subscriptions.map(sub => 
        sub.id === selectedSubscription.id ? selectedSubscription : sub
      ));
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving subscription:', error);
    }
  };

  const handleUpdateStatus = async (subscriptionId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://api.hillscapitaltrade.com/api/admin/subscriptions/${subscriptionId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!res.ok) throw new Error('Failed to update subscription status');
      
      // Update local state
      setSubscriptions(subscriptions.map(sub => 
        sub.id === subscriptionId 
          ? { ...sub, status: newStatus }
          : sub
      ));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleRenewSubscription = async (subscriptionId) => {
    try {
      const subscription = subscriptions.find(sub => sub.id === subscriptionId);
      const newEndDate = new Date();
      newEndDate.setMonth(newEndDate.getMonth() + 1);
      
      setSubscriptions(subscriptions.map(sub => 
        sub.id === subscriptionId 
          ? { 
              ...sub, 
              status: 'active',
              endDate: newEndDate.toISOString().split('T')[0],
              nextBilling: newEndDate.toISOString().split('T')[0]
            }
          : sub
      ));
    } catch (error) {
      console.error('Error renewing subscription:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'expired': return 'error';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };

  const handleCreatePlan = () => {
    setCreatePlanDialogOpen(true);
  };

  const handleCloseCreatePlan = () => {
    setCreatePlanDialogOpen(false);
    setSelectedPlan(null);
    setNewPlan({
      name: '',
      description: '',
      price: '',
      billingCycle: 'monthly',
      features: [''],
      maxSignals: '',
      hasBotAccess: false,
      hasCopyTrading: false,
      supportLevel: 'basic',
      isActive: true
    });
  };

  const handleSaveNewPlan = async () => {
    try {
      const token = localStorage.getItem('token');
      const planData = {
        ...newPlan,
        price: Number(newPlan.price),
        maxSignals: Number(newPlan.maxSignals),
        features: newPlan.features.filter(f => f.trim() !== '')
      };

      const url = selectedPlan 
        ? `https://api.hillscapitaltrade.com/api/admin/subscription-plans/${selectedPlan.id}`
        : 'https://api.hillscapitaltrade.com/api/admin/subscription-plans';
      
      const method = selectedPlan ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(planData)
      });

      if (!res.ok) throw new Error(`Failed to ${selectedPlan ? 'update' : 'create'} subscription plan`);
      
      // Refresh plans list
      await fetchSubscriptionPlans();
      handleCloseCreatePlan();
    } catch (error) {
      console.error(`Error ${selectedPlan ? 'updating' : 'creating'} plan:`, error);
    }
  };

  const handleNewPlanChange = (field, value) => {
    setNewPlan(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddFeature = () => {
    setNewPlan(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const handleRemoveFeature = (index) => {
    setNewPlan(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleFeatureChange = (index, value) => {
    setNewPlan(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => i === index ? value : feature)
    }));
  };

  const handleEditPlan = (plan) => {
    setSelectedPlan(plan);
    setNewPlan({
      name: plan.name,
      description: plan.description,
      price: plan.price.toString(),
      billingCycle: plan.billingCycle,
      features: plan.features || [''],
      maxSignals: plan.maxSignals?.toString() || '',
      hasBotAccess: plan.hasBotAccess || false,
      hasCopyTrading: plan.hasCopyTrading || false,
      supportLevel: plan.supportLevel || 'basic',
      isActive: plan.isActive || true
    });
    setCreatePlanDialogOpen(true);
  };

  const handleDeletePlan = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://api.hillscapitaltrade.com/api/admin/subscription-plans/${planId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to delete subscription plan');
      
      // Refresh plans list
      await fetchSubscriptionPlans();
    } catch (error) {
      console.error('Error deleting plan:', error);
    }
  };

  const handleTogglePlanStatus = async (planId, isActive) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://api.hillscapitaltrade.com/api/admin/subscription-plans/${planId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isActive })
      });

      if (!res.ok) throw new Error('Failed to update plan status');
      
      // Update local state
      setPlans(plans.map(plan => 
        plan.id === planId ? { ...plan, isActive } : plan
      ));
    } catch (error) {
      console.error('Error updating plan status:', error);
    }
  };

  const getDaysUntilExpiry = (endDate) => {
    const today = new Date();
    const expiry = new Date(endDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getSubscriptionCounts = () => {
    return {
      all: subscriptions.length,
      active: subscriptions.filter(s => s.status === 'active').length,
      pending: subscriptions.filter(s => s.status === 'pending').length,
      expired: subscriptions.filter(s => s.status === 'expired').length,
      cancelled: subscriptions.filter(s => s.status === 'cancelled').length
    };
  };

  const counts = getSubscriptionCounts();

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Subscription Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setPlansDialogOpen(true)}
        >
          Manage Plans
        </Button>
      </Box>

      {/* Status Filter Tabs */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => {
              setTabValue(newValue);
              const statuses = ['all', 'active', 'pending', 'expired', 'cancelled'];
              setStatusFilter(statuses[newValue]);
            }}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab 
              label={
                <Badge badgeContent={counts.all} color="primary">
                  All Subscriptions
                </Badge>
              } 
            />
            <Tab 
              label={
                <Badge badgeContent={counts.active} color="success">
                  Active
                </Badge>
              } 
            />
            <Tab 
              label={
                <Badge badgeContent={counts.pending} color="warning">
                  Pending
                </Badge>
              } 
            />
            <Tab 
              label={
                <Badge badgeContent={counts.expired} color="error">
                  Expired
                </Badge>
              } 
            />
            <Tab 
              label={
                <Badge badgeContent={counts.cancelled} color="default">
                  Cancelled
                </Badge>
              } 
            />
          </Tabs>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Plan</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Next Billing</TableCell>
                  <TableCell>Auto Renew</TableCell>
                  <TableCell>Total Paid</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSubscriptions.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {subscription.userName ? subscription.userName.charAt(0).toUpperCase() : 'U'}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {subscription.userName || 'Unknown User'}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {subscription.userEmail || 'No Email'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Subscriptions sx={{ mr: 1, color: 'primary.main' }} />
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {subscription.planName || 'Unknown Plan'}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {subscription.billingCycle || 'monthly'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        ${subscription.planPrice || 0}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={subscription.status}
                        color={getStatusColor(subscription.status)}
                        size="small"
                      />
                      {subscription.status === 'active' && subscription.endDate && (
                        <Typography variant="caption" display="block" color="textSecondary">
                          {getDaysUntilExpiry(subscription.endDate)} days left
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{subscription.startDate}</TableCell>
                    <TableCell>{subscription.endDate}</TableCell>
                    <TableCell>
                      {subscription.nextBilling ? (
                        <Typography variant="body2">
                          {subscription.nextBilling}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          N/A
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={subscription.autoRenew ? 'Yes' : 'No'}
                        color={subscription.autoRenew ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold" color="success.main">
                        ${Number(subscription.totalPaid || 0).toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleViewSubscription(subscription)}
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleEditSubscription(subscription)}
                      >
                        <Edit />
                      </IconButton>
                      {subscription.status === 'expired' && (
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleRenewSubscription(subscription.id)}
                        >
                          <Refresh />
                        </IconButton>
                      )}
                      {subscription.status === 'pending' && (
                        <>
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleUpdateStatus(subscription.id, 'active')}
                          >
                            <CheckCircle />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleUpdateStatus(subscription.id, 'cancelled')}
                          >
                            <Cancel />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Subscription Details Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogType === 'edit' ? 'Edit Subscription' : 'Subscription Details'}
        </DialogTitle>
        <DialogContent>
          {selectedSubscription && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="User Name"
                  value={selectedSubscription.userName}
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  value={selectedSubscription.userEmail}
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Plan Name"
                  value={selectedSubscription.planName}
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Plan Price"
                  value={`$${selectedSubscription.planPrice}`}
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth disabled={dialogType === 'view'}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={selectedSubscription.status}
                    onChange={(e) => setSelectedSubscription({...selectedSubscription, status: e.target.value})}
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="expired">Expired</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Billing Cycle"
                  value={selectedSubscription.billingCycle}
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={selectedSubscription.startDate}
                  onChange={(e) => setSelectedSubscription({...selectedSubscription, startDate: e.target.value})}
                  disabled={dialogType === 'view'}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  value={selectedSubscription.endDate}
                  onChange={(e) => setSelectedSubscription({...selectedSubscription, endDate: e.target.value})}
                  disabled={dialogType === 'view'}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Payment Method"
                  value={selectedSubscription.paymentMethod}
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Total Paid"
                  value={`$${selectedSubscription.totalPaid.toFixed(2)}`}
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={selectedSubscription.autoRenew}
                      onChange={(e) => setSelectedSubscription({...selectedSubscription, autoRenew: e.target.checked})}
                      disabled={dialogType === 'view'}
                    />
                  }
                  label="Auto Renew"
                />
              </Grid>
              {selectedSubscription.cancellationReason && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Cancellation Reason"
                    value={selectedSubscription.cancellationReason}
                    disabled
                    multiline
                    rows={2}
                  />
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            {dialogType === 'view' ? 'Close' : 'Cancel'}
          </Button>
          {dialogType === 'edit' && (
            <Button onClick={handleSaveSubscription} variant="contained">
              Save Changes
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Plans Management Dialog */}
      <Dialog open={plansDialogOpen} onClose={() => setPlansDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Subscription Plans</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {plans.map((plan) => (
              <Grid item xs={12} md={4} key={plan.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {plan.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" paragraph>
                      {plan.description}
                    </Typography>
                    <Typography variant="h4" color="primary" gutterBottom>
                      ${plan.price}
                      <Typography variant="caption" component="span">
                        /{plan.billingCycle}
                      </Typography>
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      {plan.subscribers} subscribers
                    </Typography>
                    <Box mt={2}>
                      <Typography variant="subtitle2" gutterBottom>
                        Features:
                      </Typography>
                      {plan.features.map((feature, index) => (
                        <Typography key={index} variant="body2" color="textSecondary">
                          • {feature}
                        </Typography>
                      ))}
                    </Box>
                    <Box mt={2} display="flex" gap={1} alignItems="center">
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={() => handleEditPlan(plan)}
                      >
                        Edit
                      </Button>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeletePlan(plan.id)}
                      >
                        <Delete />
                      </IconButton>
                      <Switch
                        checked={Boolean(plan.isActive)}
                        onChange={(e) => handleTogglePlanStatus(plan.id, e.target.checked)}
                        size="small"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPlansDialogOpen(false)}>Close</Button>
          <Button variant="contained" onClick={handleCreatePlan}>Add New Plan</Button>
        </DialogActions>
      </Dialog>

      {/* Create Plan Dialog */}
      <Dialog open={createPlanDialogOpen} onClose={handleCloseCreatePlan} maxWidth="md" fullWidth>
        <DialogTitle>{selectedPlan ? 'Edit Subscription Plan' : 'Create New Subscription Plan'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Plan Name"
                value={newPlan.name}
                onChange={(e) => handleNewPlanChange('name', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Price"
                type="number"
                value={newPlan.price}
                onChange={(e) => handleNewPlanChange('price', e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={newPlan.description}
                onChange={(e) => handleNewPlanChange('description', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Billing Cycle</InputLabel>
                <Select
                  value={newPlan.billingCycle}
                  onChange={(e) => handleNewPlanChange('billingCycle', e.target.value)}
                  label="Billing Cycle"
                >
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="yearly">Yearly</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Max Signals"
                type="number"
                value={newPlan.maxSignals}
                onChange={(e) => handleNewPlanChange('maxSignals', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Support Level</InputLabel>
                <Select
                  value={newPlan.supportLevel}
                  onChange={(e) => handleNewPlanChange('supportLevel', e.target.value)}
                  label="Support Level"
                >
                  <MenuItem value="basic">Basic</MenuItem>
                  <MenuItem value="priority">Priority</MenuItem>
                  <MenuItem value="premium">Premium</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={newPlan.hasBotAccess}
                      onChange={(e) => handleNewPlanChange('hasBotAccess', e.target.checked)}
                    />
                  }
                  label="Bot Access"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={newPlan.hasCopyTrading}
                      onChange={(e) => handleNewPlanChange('hasCopyTrading', e.target.checked)}
                    />
                  }
                  label="Copy Trading"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={newPlan.isActive}
                      onChange={(e) => handleNewPlanChange('isActive', e.target.checked)}
                    />
                  }
                  label="Active"
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Features
              </Typography>
              {newPlan.features.map((feature, index) => (
                <Box key={index} display="flex" alignItems="center" gap={1} mb={1}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Enter feature"
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveFeature(index)}
                    disabled={newPlan.features.length === 1}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              ))}
              <Button
                startIcon={<Add />}
                onClick={handleAddFeature}
                size="small"
                variant="outlined"
              >
                Add Feature
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreatePlan}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSaveNewPlan}
            disabled={!newPlan.name || !newPlan.price || !newPlan.description}
          >
            {selectedPlan ? 'Update Plan' : 'Create Plan'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubscriptionManagement;
