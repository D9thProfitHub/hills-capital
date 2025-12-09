import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormControlLabel, 
  Checkbox, 
  CircularProgress,
  Divider,
  Card,
  CardContent,
  CardActions,
  Chip,
  Tabs,
  Tab
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  AccountBalanceWallet as AccountBalanceWalletIcon,
  Security as SecurityIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import copyTradingApi from '../../services/copyTradingApi';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[3],
  marginBottom: theme.spacing(4),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  fontWeight: 600,
  color: theme.palette.primary.main,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const CopyTrading = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [traders, setTraders] = useState([]);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    accountType: 'MT4',
    broker: '',
    server: '',
    login: '',
    password: '',
    riskLevel: 'medium',
    maxDrawdown: '20',
    acceptTerms: false
  });

  // Fetch user's copy trading requests
  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const response = await copyTradingApi.getMyCopyTradingRequests();
      setRequests(response.data || []);
    } catch (error) {
      console.error('Error fetching copy trading requests:', error);
      enqueueSnackbar(error.message || 'Failed to fetch copy trading requests', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch available traders (for admin)
  const fetchTraders = async () => {
    try {
      const response = await copyTradingApi.getAvailableTraders();
      setTraders(response.data || []);
    } catch (error) {
      console.error('Error fetching traders:', error);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchTraders();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.acceptTerms) {
      enqueueSnackbar('You must accept the terms and conditions', { variant: 'warning' });
      return;
    }

    try {
      setIsLoading(true);
      // Remove acceptTerms from the data being sent to the API
      const { acceptTerms, ...requestData } = formData;
      await copyTradingApi.createCopyTradingRequest(requestData);
      
      enqueueSnackbar('Copy trading request submitted successfully!', { variant: 'success' });
      setFormData({
        name: '',
        accountType: 'MT4',
        broker: '',
        server: '',
        login: '',
        password: '',
        riskLevel: 'medium',
        maxDrawdown: '20',
        acceptTerms: false
      });
      
      // Refresh requests
      await fetchRequests();
      setActiveTab(1); // Switch to requests tab
    } catch (error) {
      console.error('Error submitting copy trading request:', error);
      enqueueSnackbar(
        error.message || 'Failed to submit copy trading request. Please try again.', 
        { variant: 'error' }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusChip = (status) => {
    const statusMap = {
      pending: { label: 'Pending', color: 'warning' },
      approved: { label: 'Approved', color: 'success' },
      rejected: { label: 'Rejected', color: 'error' },
      processing: { label: 'Processing', color: 'info' },
      completed: { label: 'Completed', color: 'primary' }
    };

    const statusInfo = statusMap[status] || { label: status, color: 'default' };
    
    return (
      <Chip 
        label={statusInfo.label} 
        color={statusInfo.color} 
        size="small" 
        variant="outlined"
      />
    );
  };

  const renderRequestForm = () => (
    <StyledPaper>
      <SectionTitle variant="h5">
        <AccountBalanceWalletIcon />
        Copy Trading Account Setup
      </SectionTitle>
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Your Full Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Account Type</InputLabel>
              <Select
                name="accountType"
                value={formData.accountType}
                onChange={handleInputChange}
                label="Account Type"
              >
                <MenuItem value="MT4">MetaTrader 4 (MT4)</MenuItem>
                <MenuItem value="MT5">MetaTrader 5 (MT5)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Broker Name"
              name="broker"
              value={formData.broker}
              onChange={handleInputChange}
              required
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Server"
              name="server"
              value={formData.server}
              onChange={handleInputChange}
              required
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Account Number/Login"
              name="login"
              type="number"
              value={formData.login}
              onChange={handleInputChange}
              required
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Investor Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              margin="normal"
              helperText="This is a read-only password used for copying trades"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Risk Level</InputLabel>
              <Select
                name="riskLevel"
                value={formData.riskLevel}
                onChange={handleInputChange}
                label="Risk Level"
              >
                <MenuItem value="low">Low Risk</MenuItem>
                <MenuItem value="medium">Medium Risk</MenuItem>
                <MenuItem value="high">High Risk</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Max Drawdown Limit</InputLabel>
              <Select
                name="maxDrawdown"
                value={formData.maxDrawdown}
                onChange={handleInputChange}
                label="Max Drawdown Limit"
              >
                {[10, 15, 20, 25, 30].map(percent => (
                  <MenuItem key={percent} value={percent.toString()}>
                    {percent}% - {percent < 15 ? 'Conservative' : percent < 25 ? 'Moderate' : 'Aggressive'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.acceptTerms}
                  onChange={handleInputChange}
                  name="acceptTerms"
                  color="primary"
                />
              }
              label={
                <Typography variant="body2">
                  I agree to the Terms of Service and acknowledge the risks involved in copy trading.
                </Typography>
              }
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end" mt={2}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} /> : <LockIcon />}
              >
                {isLoading ? 'Submitting...' : 'Connect Account'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </StyledPaper>
  );

  const renderRequestsList = () => (
    <StyledPaper>
      <SectionTitle variant="h5">
        <AccountBalanceWalletIcon />
        My Copy Trading Requests
      </SectionTitle>
      
      {isLoading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : requests.length === 0 ? (
        <Box textAlign="center" p={4}>
          <InfoIcon color="action" style={{ fontSize: 48, marginBottom: 16 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No Copy Trading Requests Found
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            You haven't submitted any copy trading requests yet. Click the "New Request" tab to get started.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {requests.map((request) => (
            <Grid item xs={12} key={request.id}>
              <Card variant="outlined">
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" component="div">
                      {request.accountType} Account - {request.broker}
                    </Typography>
                    {getStatusChip(request.status)}
                  </Box>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="textSecondary">
                        Account Number
                      </Typography>
                      <Typography variant="body1">
                        {request.login}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="textSecondary">
                        Risk Level
                      </Typography>
                      <Typography variant="body1" textTransform="capitalize">
                        {request.riskLevel}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="textSecondary">
                        Max Drawdown
                      </Typography>
                      <Typography variant="body1">
                        {request.maxDrawdown}%
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="textSecondary">
                        Submitted On
                      </Typography>
                      <Typography variant="body1">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </Typography>
                    </Grid>
                    
                    {request.assignedTrader && (
                      <Grid item xs={12} md={4}>
                        <Typography variant="body2" color="textSecondary">
                          Assigned Trader
                        </Typography>
                        <Typography variant="body1">
                          {request.assignedTrader.name}
                        </Typography>
                      </Grid>
                    )}
                    
                    {request.notes && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="textSecondary">
                          Notes
                        </Typography>
                        <Typography variant="body2" style={{ whiteSpace: 'pre-line' }}>
                          {request.notes}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
                
                {request.status === 'pending' && (
                  <CardActions>
                    <Button 
                      size="small" 
                      color="error"
                      disabled={isLoading}
                    >
                      Cancel Request
                    </Button>
                  </CardActions>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </StyledPaper>
  );

  return (
    <Container maxWidth="lg">
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Copy Trading
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Connect your trading account to automatically copy trades from our expert traders.
        </Typography>
      </Box>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          aria-label="copy trading tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="New Request" />
          <Tab label={`My Requests (${requests.length})`} />
        </Tabs>
      </Box>
      
      {activeTab === 0 ? renderRequestForm() : renderRequestsList()}
      
      <Box mt={4} mb={6}>
        <SectionTitle variant="h6">
          <SecurityIcon />
          Security Information
        </SectionTitle>
        <Typography variant="body2" color="textSecondary" paragraph>
          Your trading account credentials are encrypted and stored securely. We only use read-only access 
          to copy trades and cannot withdraw funds from your account.
        </Typography>
        
        <Box display="flex" alignItems="center" color="warning.main" mb={1}>
          <WarningIcon fontSize="small" style={{ marginRight: 8 }} />
          <Typography variant="body2" color="inherit">
            Never share your master password or trading PIN with anyone.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default CopyTrading;
