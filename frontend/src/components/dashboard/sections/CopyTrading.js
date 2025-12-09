import React, { useState, useEffect } from 'react';
import { 
  Alert,
  Snackbar,
  Avatar,
  Box, 
  Button, 
  Card, 
  CardContent, 
  Checkbox,
  Chip, 
  CircularProgress, 
  Divider, 
  FormControl, 
  FormControlLabel, 
  FormHelperText, 
  FormLabel, 
  Grid, 
  IconButton, 
  InputAdornment, 
  InputLabel, 
  MenuItem, 
  Paper, 
  Radio, 
  RadioGroup, 
  Select, 
  Tab, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Tabs, 
  TextField, 
  Tooltip, 
  Typography
} from '@mui/material';
import { 
  Person as PersonIcon,
  AttachMoney as AttachMoneyIcon,
  ShowChart as ShowChartIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon, 
  Cancel as CancelIcon, 
  Visibility as VisibilityIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  Add as AddIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import api from '../../../services/api';
import copyTradingApi from '../../../services/copyTradingApi';

const CopyTrading = () => {
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    accountType: 'MT4',
    broker: '',
    server: '',
    login: '',
    password: '',
    capital: '500', // Default to minimum required amount
    riskLevel: 'medium',
    maxDrawdown: '20',
    acceptTerms: false
  });

  // Real-time data from API
  const [myCopies, setMyCopies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ success: false, message: '' });
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' // 'success', 'error', 'info', 'warning'
  });

  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification({ ...notification, open: false });
  };

  // Fetch copy trading data from API
  useEffect(() => {
    fetchCopyTradingData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const fetchCopyTradingData = async () => {
    try {
      setLoading(true);
      console.log('Fetching copy trading data...');
      const response = await api.get('/api/users/copy-trading/requests');
      
      console.log('Full API Response:', {
        status: response.status,
        data: response.data,
        rawData: JSON.parse(JSON.stringify(response.data)) // Deep clone for logging
      });

      if (response.data && response.data.success) {
        const copiesData = Array.isArray(response.data.data) 
          ? response.data.data 
          : [];

        // Transform the data to match the expected format with proper null checks
        const formattedData = copiesData.map(item => {
          try {
            // Safely format dates
            const createdAt = item.createdAt ? new Date(item.createdAt) : new Date();
            const updatedAt = item.updatedAt ? new Date(item.updatedAt) : createdAt;
            
            // Safely get trader info
            const traderName = item.traderName || item.trader?.name || 'Unassigned';
            const traderId = item.traderId || null;
            
            // Safely format amount with fallback
            const amount = parseFloat(item.copyAmount || item.capital || 0);
            
            // Safely format status
            const status = (item.status || 'pending').toString().toLowerCase();
            const isAssigned = !!traderId;
            
            // Create a safe copy of the item without overriding our formatted fields
            const { trader, ...restItem } = item;
            
            return {
              id: item.id || `temp-${Math.random().toString(36).substr(2, 9)}`,
              traderId,
              traderName,
              traderAvatar: item.traderAvatar || item.trader?.avatar || 
                `https://ui-avatars.com/api/?name=${encodeURIComponent(traderName)}&background=random`,
              copyAmount: isNaN(amount) ? 0 : amount,
              platform: item.platform || item.broker || 'N/A',
              accountType: item.accountType || 'Standard',
              riskLevel: item.riskLevel ? String(item.riskLevel).toLowerCase() : 'medium',
              status: isAssigned ? status : 'pending_assignment',
              isAssigned,
              createdAt: createdAt.toISOString(),
              updatedAt: updatedAt.toISOString(),
              // Spread the rest of the item's properties last to allow overrides
              ...restItem
            };
          } catch (error) {
            console.error('Error formatting copy trade item:', error, item);
            // Return a minimal valid object with error info
            return {
              id: item.id || `error-${Math.random().toString(36).substr(2, 9)}`,
              traderName: 'Error loading',
              status: 'error',
              isAssigned: false,
              copyAmount: 0,
              platform: 'N/A',
              accountType: 'Standard',
              riskLevel: 'medium',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              ...item
            };
          }
        });

        // Sort by creation date (newest first)
        const sortedData = [...formattedData].sort((a, b) => {
          try {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA;
          } catch (error) {
            console.error('Error sorting copy trades:', error);
            return 0;
          }
        });

        console.log('Formatted and sorted copy trades:', sortedData);
        setMyCopies(sortedData);
        setError(null);
      } else {
        const errorMsg = response.data?.message || 'Failed to load copy trading data. Please try again.';
        setError(errorMsg);
        setMyCopies([]);
      }
    } catch (err) {
      console.error('Error fetching copy trading data:', {
        message: err.message,
        response: err.response?.data,
        stack: err.stack
      });
      
      setError(
        err.response?.data?.message || 
        'Failed to load copy trading data. Please try again later.'
      );
      setMyCopies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (copyId) => {
    // Find the copy trade by ID
    const copyTrade = myCopies.find(copy => copy.id === copyId);
    if (copyTrade) {
      // You can implement a modal or dialog to show more details
      console.log('Viewing details for copy trade:', copyTrade);
      // For now, just show an alert with the details
      alert(`Copy Trade Details:\nID: ${copyTrade.id}\nTrader: ${copyTrade.traderName}\nAmount: $${copyTrade.copyAmount || 'N/A'}\nStatus: ${copyTrade.status}\nCreated: ${new Date(copyTrade.createdAt).toLocaleString()}`);
    }
  };

  const handleCancelCopy = async (copyId) => {
    if (!window.confirm('Are you sure you want to cancel this copy trade?')) {
      return;
    }

    try {
      setLoading(true);
      // Call your API to cancel the copy trade
      await copyTradingApi.cancelCopyTrade(copyId);
      
      // Refresh the copy trading data
      await fetchCopyTradingData();
      
      setSubmitStatus({ success: true, message: 'Copy trade has been cancelled successfully.' });
    } catch (err) {
      console.error('Error cancelling copy trade:', err);
      setSubmitStatus({ success: false, message: err.response?.data?.message || 'Failed to cancel copy trade. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ success: false, message: '' });

    try {
      // Prepare the request data with all required fields
      const requestData = {
        name: formData.name.trim() || 'Trader',
        accountType: formData.accountType,
        broker: formData.broker.trim(),
        server: formData.server.trim(),
        login: formData.login.toString().trim(),
        password: formData.password,
        capital: parseFloat(formData.capital) || 500,
        riskLevel: formData.riskLevel,
        maxDrawdown: parseFloat(formData.maxDrawdown) || 20,
        maxDailyLoss: 5,
        stopCopyOnDrawdown: true,
        followNewPositions: true,
        notes: 'New copy trading request'
      };

      const response = await copyTradingApi.createCopyTradingRequest(requestData);
      
      // Log the full response for debugging
      console.log('API Response:', response);
      
      if (response && (response.success || (response.data && response.data.success))) {
        const responseData = response.data || response;
        const successMessage = responseData.notification?.message || 
                             responseData.message || 
                             'Your copy trading request has been submitted successfully!';
        
        // Show success notification
        setNotification({
          open: true,
          message: successMessage,
          severity: 'success'
        });
        
        // Reset the form
        setFormData({
          name: '',
          accountType: 'MT4',
          broker: '',
          server: '',
          login: '',
          password: '',
          capital: '500',
          riskLevel: 'medium',
          maxDrawdown: '20',
          acceptTerms: false
        });
        
        // Refresh the copy trading data to show the new request
        await fetchCopyTradingData();
        
        // Update submit status
        setSubmitStatus({ 
          success: true, 
          message: successMessage
        });
      } else {
        const errorMessage = (response.data && response.data.message) || 
                           response.message || 
                           'Failed to submit copy trading request';
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error submitting copy trading request:', error);
      setNotification({
        open: true,
        message: error.response?.data?.message || error.message || 'Failed to submit copy trading request. Please try again.',
        severity: 'error'
      });
      setSubmitStatus({
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to submit copy trading request. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusChip = (status) => {
    const statusMap = {
      pending: { label: 'Pending', color: 'warning', icon: <PendingIcon /> },
      active: { label: 'Active', color: 'success', icon: <CheckCircleIcon /> },
      completed: { label: 'Completed', color: 'info', icon: <CheckCircleIcon /> },
      cancelled: { label: 'Cancelled', color: 'error', icon: <CancelIcon /> },
      rejected: { label: 'Rejected', color: 'error', icon: <CancelIcon /> },
      processing: { label: 'Processing', color: 'info', icon: <PendingIcon /> },
      connected: { label: 'Connected', color: 'success', icon: <CheckCircleIcon /> },
      disconnected: { label: 'Disconnected', color: 'error', icon: <CancelIcon /> }
    };

    const statusKey = status ? status.toLowerCase() : 'pending';
    const { label, color, icon } = statusMap[statusKey] || { 
      label: status || 'Unknown', 
      color: 'default', 
      icon: null 
    };
    
    return (
      <Chip
        icon={icon}
        label={label}
        color={color}
        size="small"
        variant="outlined"
        sx={{ textTransform: 'capitalize' }}
      />
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>

      <Typography variant="h5" gutterBottom>Copy Trading</Typography>
      
      <Tabs 
        value={tabValue} 
        onChange={handleTabChange} 
        variant="fullWidth"
        sx={{ 
          mb: 3,
          '& .MuiTabs-indicator': {
            height: 4,
            borderRadius: '4px 4px 0 0',
          },
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.9375rem',
            minHeight: 48,
            '&.Mui-selected': {
              color: 'primary.main',
            },
          },
        }}
      >
        <Tab 
          label={
            <Box display="flex" alignItems="center" gap={1}>
              <PersonIcon fontSize="small" />
              <span>My Copy Trades</span>
              {myCopies.length > 0 && (
                <Chip 
                  label={myCopies.length} 
                  size="small" 
                  sx={{ height: 20, minWidth: 20, borderRadius: 10 }}
                />
              )}
            </Box>
          } 
        />
        <Tab 
          label={
            <Box display="flex" alignItems="center" gap={1}>
              <AddIcon fontSize="small" />
              <span>New Copy Trade</span>
            </Box>
          } 
        />
      </Tabs>
      
      {tabValue === 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>My Copy Trades</Typography>
            
            {loading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Box p={3} textAlign="center">
                <Typography color="error">{error}</Typography>
                <Button 
                  variant="outlined" 
                  onClick={fetchCopyTradingData}
                  startIcon={<RefreshIcon />}
                  sx={{ mt: 2 }}
                >
                  Retry
                </Button>
              </Box>
            ) : myCopies.length > 0 ? (
              <TableContainer component={Paper} sx={{ maxHeight: '60vh', overflow: 'auto' }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Trader</TableCell>
                      <TableCell>Platform</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Risk Level</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {myCopies.length > 0 ? (
                      myCopies.map((copy) => (
                        <TableRow 
                          key={copy.id} 
                          hover 
                          sx={{ 
                            '&:nth-of-type(odd)': { 
                              backgroundColor: 'action.hover' 
                            },
                            '&:last-child td, &:last-child th': { 
                              border: 0 
                            }
                          }}
                        >
                          <TableCell>#{copy.id}</TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Avatar 
                                src={copy.traderAvatar} 
                                alt={copy.traderName}
                                sx={{ 
                                  width: 32, 
                                  height: 32,
                                  bgcolor: copy.isAssigned ? 'primary.main' : 'grey.400',
                                  fontSize: '0.8rem'
                                }}
                              >
                                {!copy.traderAvatar && (copy.isAssigned ? 'T' : '?')}
                              </Avatar>
                              <Box>
                                <Box display="flex" alignItems="center" flexWrap="wrap" gap={0.5}>
                                  <Typography variant="subtitle2" noWrap>
                                    {copy.traderName || 'New Request'}
                                  </Typography>
                                  {!copy.isAssigned && (
                                    <Chip 
                                      label="Pending" 
                                      size="small" 
                                      color="warning"
                                      sx={{ height: 20, fontSize: '0.6rem', fontWeight: 500 }}
                                    />
                                  )}
                                </Box>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                  {copy.traderId ? `ID: ${copy.traderId}` : 'Awaiting assignment'}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5 }}>
                                {copy.platform || 'N/A'}
                              </Typography>
                              {copy.accountType && (
                                <Chip 
                                  label={copy.accountType}
                                  size="small"
                                  variant="outlined"
                                  sx={{ 
                                    height: 20, 
                                    fontSize: '0.65rem',
                                    color: 'text.secondary'
                                  }}
                                />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight={600} color="primary">
                                {copy.copyAmount ? (
                                  `$${parseFloat(copy.copyAmount).toLocaleString(undefined, { 
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2 
                                  })}`
                                ) : 'N/A'}
                              </Typography>
                              {copy.riskLevel && (
                                <Chip 
                                  label={copy.riskLevel.charAt(0).toUpperCase() + copy.riskLevel.slice(1)} 
                                  size="small"
                                  sx={{
                                    mt: 0.5,
                                    height: 20,
                                    fontSize: '0.65rem',
                                    backgroundColor: 
                                      copy.riskLevel === 'high' ? 'error.light' :
                                      copy.riskLevel === 'low' ? 'success.light' : 'warning.light',
                                    color: 'white',
                                    fontWeight: 500
                                  }}
                                />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Chip 
                                label={copy.status === 'pending_assignment' ? 'Pending' : copy.status} 
                                size="small"
                                sx={{
                                  textTransform: 'capitalize',
                                  backgroundColor: 
                                    copy.status === 'active' ? 'success.main' :
                                    copy.status === 'rejected' ? 'error.main' :
                                    copy.status === 'completed' ? 'info.main' :
                                    copy.status === 'pending_assignment' ? 'warning.dark' :
                                    'grey.500',
                                  color: 'white',
                                  fontWeight: 500,
                                  minWidth: 80,
                                  height: 22,
                                  fontSize: '0.65rem',
                                  '& .MuiChip-label': {
                                    px: 1
                                  }
                                }}
                              />
                              {copy.updatedAt && (
                                <Tooltip 
                                  title={`Last updated: ${
                                    copy?.updatedAt 
                                      ? new Date(copy.updatedAt).toLocaleString(undefined, {
                                          year: 'numeric',
                                          month: 'short',
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit',
                                          hour12: true
                                        })
                                      : 'N/A'
                                  }`}
                                >
                                  <RefreshIcon fontSize="small" color="action" sx={{ fontSize: '0.9rem' }} />
                                </Tooltip>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={copy.status === 'pending_assignment' ? 'Pending Assignment' : copy.status} 
                              size="small"
                              sx={{
                                textTransform: 'capitalize',
                                backgroundColor: 
                                  copy.status === 'active' ? 'success.main' :
                                  copy.status === 'rejected' ? 'error.main' :
                                  copy.status === 'completed' ? 'info.main' :
                                  copy.status === 'pending_assignment' ? 'warning.dark' :
                                  'warning.main',
                                color: 'white',
                                fontWeight: 500,
                                minWidth: 80,
                                justifyContent: 'center',
                                fontSize: '0.7rem',
                                height: 24
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2">
                                {copy?.createdAt ? new Date(copy.createdAt).toLocaleDateString(undefined, {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                }) : 'N/A'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {copy?.createdAt ? new Date(copy.createdAt).toLocaleTimeString(undefined, { 
                                  hour: '2-digit', 
                                  minute: '2-digit',
                                  hour12: true
                                }) : ''}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box display="flex" gap={1}>
                              <Tooltip title="View Details">
                                <IconButton 
                                  size="small"
                                  color="primary"
                                  onClick={() => handleViewDetails(copy.id)}
                                  sx={{ '&:hover': { bgcolor: 'primary.light' } }}
                                >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              {['pending', 'active'].includes(copy.status) && (
                                <Tooltip title={copy.status === 'pending' ? 'Cancel Request' : 'Stop Copying'}>
                                  <IconButton 
                                    size="small"
                                    color="error"
                                    onClick={() => handleCancelCopy(copy.id)}
                                    sx={{ '&:hover': { bgcolor: 'error.light' } }}
                                  >
                                    <CancelIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                            <AccountBalanceWalletIcon color="disabled" fontSize="large" />
                            <Typography variant="body1" color="text.secondary">
                              No copy trading requests found
                            </Typography>
                            <Button
                              variant="outlined"
                              color="primary"
                              onClick={fetchCopyTradingData}
                              disabled={loading}
                              startIcon={<RefreshIcon />}
                              size="small"
                            >
                              Refresh
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <>
                {/* Pending Connection Request */}
                <Box 
                  sx={{ 
                    p: 3, 
                    bgcolor: 'action.hover', 
                    borderRadius: 1,
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 2
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Pending Connection Request
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Your trading account connection request is being processed. This usually takes 1-2 business days.
                    </Typography>
                  </Box>
                  <Button 
                    variant="outlined" 
                    color="primary"
                    onClick={() => setTabValue(1)}
                    startIcon={<RefreshIcon />}
                  >
                    Check Status
                  </Button>
                </Box>

                {/* No Active Trades Message */}
                <Box 
                  sx={{ 
                    p: 3, 
                    textAlign: 'center',
                    border: '1px dashed',
                    borderColor: 'divider',
                    borderRadius: 1
                  }}
                >
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    No active copy trades yet. Once your account is connected, you can start copying trades from our expert traders.
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => setTabValue(1)}
                    startIcon={<AccountBalanceWalletIcon />}
                  >
                    Connect Another Account
                  </Button>
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      )}
      
      {tabValue === 1 && (
        <Box sx={{ width: '100%' }}>
          <Typography variant="h5" gutterBottom>
            Connect Your Trading Account
          </Typography>
          <Typography color="text.secondary" paragraph>
            Link your MT4/MT5 account to start copy trading in minutes.
          </Typography>
          
          <Card elevation={3} sx={{ maxWidth: 800, mt: 3 }}>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500, color: 'text.primary' }}>
                      Account Information
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Your Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      margin="normal"
                      size="small"
                      variant="outlined"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal" size="small">
                      <InputLabel>Platform</InputLabel>
                      <Select
                        name="accountType"
                        value={formData.accountType}
                        onChange={handleChange}
                        required
                        label="Platform"
                      >
                        <MenuItem value="MT4">MetaTrader 4</MenuItem>
                        <MenuItem value="MT5">MetaTrader 5</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Broker Name"
                      name="broker"
                      value={formData.broker}
                      onChange={handleChange}
                      required
                      margin="normal"
                      size="small"
                      variant="outlined"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Server"
                      name="server"
                      value={formData.server}
                      onChange={handleChange}
                      required
                      margin="normal"
                      size="small"
                      variant="outlined"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Account Number"
                      name="login"
                      type="number"
                      value={formData.login}
                      onChange={handleChange}
                      required
                      margin="normal"
                      size="small"
                      variant="outlined"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Investment Amount ($)"
                      name="capital"
                      type="number"
                      value={formData.capital}
                      onChange={handleChange}
                      required
                      margin="normal"
                      size="small"
                      variant="outlined"
                      inputProps={{
                        min: 500,
                        step: 100
                      }}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                      helperText="Minimum investment: $500"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Password (Investor)"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      margin="normal"
                      size="small"
                      variant="outlined"
                      helperText="Use your investor password (read-only access)"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, fontWeight: 500, color: 'text.primary' }}>
                      Risk Management
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal" size="small">
                      <InputLabel>Risk Level</InputLabel>
                      <Select
                        name="riskLevel"
                        value={formData.riskLevel}
                        onChange={handleChange}
                        required
                        label="Risk Level"
                      >
                        <MenuItem value="low">Low (Conservative)</MenuItem>
                        <MenuItem value="medium">Medium (Balanced)</MenuItem>
                        <MenuItem value="high">High (Aggressive)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal" size="small">
                      <InputLabel>Max Drawdown Limit</InputLabel>
                      <Select
                        name="maxDrawdown"
                        value={formData.maxDrawdown}
                        onChange={handleChange}
                        required
                        label="Max Drawdown Limit"
                      >
                        <MenuItem value="10">10%</MenuItem>
                        <MenuItem value="15">15%</MenuItem>
                        <MenuItem value="20">20%</MenuItem>
                        <MenuItem value="25">25%</MenuItem>
                        <MenuItem value="30">30%</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.acceptTerms}
                          onChange={handleChange}
                          name="acceptTerms"
                          required
                          color="primary"
                        />
                      }
                      label={
                        <Typography variant="body2">
                          I agree to the <a href="/terms" target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2' }}>Terms of Service</a> and <a href="/risk-disclosure" target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2' }}>Risk Disclosure</a>
                        </Typography>
                      }
                      sx={{ mt: 2 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sx={{ mt: 3 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      size="large"
                      fullWidth
                      disabled={isSubmitting}
                      sx={{
                        py: 1.5,
                        textTransform: 'none',
                        fontWeight: 500,
                        fontSize: '1rem',
                        '&.Mui-disabled': {
                          backgroundColor: 'rgba(0, 0, 0, 0.12)'
                        }
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                          Submitting...
                        </>
                      ) : (
                        'Connect Account & Start Copy Trading'
                      )}
                    </Button>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box sx={{
                      mt: 2,
                      p: 2,
                      backgroundColor: '#f8f9fa',
                      borderLeft: '4px solid #3f51b5',
                      borderRadius: '0 4px 4px 0',
                      fontSize: '0.8rem',
                      color: '#666',
                      lineHeight: 1.5
                    }}>
                      <strong>Important:</strong> Your credentials are encrypted and stored securely. We never store your trading password in plain text. For security reasons, please use your investor password (read-only access) when connecting your trading account.
                    </Box>
                  </Grid>

                  {submitStatus.message && (
                    <Grid item xs={12}>
                      <Box 
                        sx={{
                          mt: 2,
                          p: 2,
                          backgroundColor: submitStatus.success ? '#e8f5e9' : '#ffebee',
                          color: submitStatus.success ? '#2e7d32' : '#c62828',
                          borderRadius: 1,
                          borderLeft: `4px solid ${submitStatus.success ? '#4caf50' : '#f44336'}`
                        }}
                      >
                        {submitStatus.message}
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default CopyTrading;
