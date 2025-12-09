import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { copyTradingApi } from '../../../services/adminApi';
import { useWebSocket } from '../../../context/WebSocketContext';
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
  InputAdornment,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Tabs,
  Tab,
  Badge,
  LinearProgress,
  CircularProgress,
  Paper
} from '@mui/material';
import {
  Visibility,
  CheckCircle,
  Cancel,
  ContentCopy,
  Person,
  AttachMoney,
  TrendingUp,
  TrendingDown,
  Assignment,
  Refresh,
  Email,
  AccountBalanceWallet,
  BusinessCenter,
  Dns,
  Warning,
  Event,
  PersonAdd,
  PlayArrow,
  Pause,
  Search
} from '@mui/icons-material';

const CopyTradingRequests = () => {
  const [requests, setRequests] = useState(() => {
    try {
      const saved = localStorage.getItem('copyTradingRequests');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading requests from localStorage:', error);
      return [];
    }
  });
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [traders, setTraders] = useState(() => {
    try {
      const saved = localStorage.getItem('copyTradingTraders');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading traders from localStorage:', error);
      return [];
    }
  });
  const [traderSearch, setTraderSearch] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedTrader, setSelectedTrader] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending'); // Default to show pending requests
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { on } = useWebSocket();

  useEffect(() => {
    loadData();
    
    // Listen for new copy trading requests
    const unsub = on('newCopyRequest', (payload) => {
      toast.info('New copy-trading request received');
      setRequests(prev => [payload, ...prev]);
    });

    // Listen for updates to existing requests
    const unsubUpdate = on('copyTradingRequestUpdated', (payload) => {
      setRequests(prev => 
        prev.map(req => req.id === payload.id ? { ...req, ...payload } : req)
      );
    });

    return () => {
      unsub && unsub();
      unsubUpdate && unsubUpdate();
    };
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load data in parallel
      const [requestsResponse, tradersResponse] = await Promise.all([
        copyTradingApi.getRequests({ status: statusFilter }),
        copyTradingApi.getTraders()
      ]);
      
      // Handle nested response structure for requests
      const requestsData = Array.isArray(requestsResponse?.data) 
        ? requestsResponse.data 
        : Array.isArray(requestsResponse?.data?.data) 
          ? requestsResponse.data.data 
          : [];
      
      // Handle nested response structure for traders
      const tradersData = Array.isArray(tradersResponse?.data)
        ? tradersResponse.data
        : Array.isArray(tradersResponse?.data?.data)
          ? tradersResponse.data.data
          : [];
      
      setRequests(requestsData);
      setTraders(tradersData);
      
      // Save to localStorage
      try {
        localStorage.setItem('copyTradingRequests', JSON.stringify(requestsData));
        localStorage.setItem('copyTradingTraders', JSON.stringify(tradersData));
      } catch (storageError) {
        console.error('Error saving to localStorage:', storageError);
      }
      
      // Show success message if we have data
      if (requestsData.length > 0) {
        toast.success(`Loaded ${requestsData.length} requests and ${tradersData.length} traders`);
      } else {
        toast.info('No copy trading requests found');
      }
    } catch (err) {
      console.error('Error loading data:', err);
      const errorMessage = err.response?.data?.message || 'Failed to load data. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      toast.error('Failed to load copy trading data');
    } finally {
      setLoading(false);
    }
  };

  const fetchCopyTradingRequests = async (filters = {}) => {
    try {
      // Default to current status filter if not specified
      if (!filters.status) {
        filters.status = statusFilter;
      }
      
      const response = await copyTradingApi.getRequests(filters);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching copy trading requests:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch copy trading requests';
      toast.error(errorMessage);
      throw error;
    }
  };

  const fetchTraders = async () => {
    try {
      const response = await copyTradingApi.getTraders();
      const tradersData = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.data?.data)
          ? response.data.data
          : [];
      
      setTraders(tradersData);
      
      // Save to localStorage
      try {
        localStorage.setItem('copyTradingTraders', JSON.stringify(tradersData));
      } catch (storageError) {
        console.error('Error saving traders to localStorage:', storageError);
      }
      
      return tradersData;
    } catch (error) {
      console.error('Error fetching traders:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch traders');
      
      // Try to load from localStorage as fallback
      try {
        const savedTraders = localStorage.getItem('copyTradingTraders');
        if (savedTraders) {
          const parsedTraders = JSON.parse(savedTraders);
          if (Array.isArray(parsedTraders)) {
            setTraders(parsedTraders);
            return parsedTraders;
          }
        }
      } catch (e) {
        console.error('Error loading traders from localStorage:', e);
      }
      
      setTraders([]);
      return [];
    }
  };
  
  const handleRefresh = async () => {
    setLoading(true);
    try {
      await loadData();
      toast.success('Data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    if (statusFilter === 'all') {
      setFilteredRequests(requests);
    } else {
      setFilteredRequests(requests.filter(request => request.status === statusFilter));
    }
  };

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedRequest(null);
  };

  const handleOpenAssignDialog = (request) => {
    setSelectedRequest(request);
    setSelectedTrader(request.preferredTrader !== 'Any' ? request.preferredTrader : '');
    setAssignDialogOpen(true);
  };

  const handleCloseAssignDialog = () => {
    setAssignDialogOpen(false);
    setSelectedRequest(null);
    setSelectedTrader('');
  };

  const handleApproveRequest = async (requestId, traderId = null) => {
    try {
      const trader = traderId ? traders.find(t => t.id === parseInt(traderId)) : null;
      await handleStatusUpdate(requestId, 'approved', `Approved by admin and assigned to ${trader?.name || 'No trader assigned'}`);
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleRejectRequest = async (requestId, reason) => {
    try {
      await handleStatusUpdate(requestId, 'rejected', reason);
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  const handleStatusUpdate = async (requestId, status, note = '') => {
    try {
      setLoading(true);
      const updatedRequest = await copyTradingApi.updateRequest(requestId, { status, note });
      
      setRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, ...updatedRequest, status } 
            : req
        )
      );
      
      toast.success(`Request ${status} successfully`);
      return updatedRequest;
    } catch (error) {
      console.error('Error updating request status:', error);
      const errorMessage = error.response?.data?.message || `Failed to update request status to ${status}`;
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleActivateCopyTrading = async (requestId) => {
    try {
      await handleStatusUpdate(requestId, 'active', 'Copy trading activated by admin');
      
      // Update local state with start date
      setRequests(prev => 
        prev.map(request => 
          request.id === requestId 
            ? { 
                ...request, 
                status: 'active',
                startDate: new Date().toISOString().split('T')[0]
              }
            : request
        )
      );
      
      toast.success('Copy trading activated successfully');
    } catch (error) {
      console.error('Error activating copy trading:', error);
      const errorMessage = error.response?.data?.message || 'Failed to activate copy trading';
      toast.error(errorMessage);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'info';
      case 'active': return 'success';
      case 'rejected': return 'error';
      case 'paused': return 'default';
      default: return 'default';
    }
  };

  const getRiskColor = (risk) => {
    if (!risk) return 'default';
    const riskLower = String(risk).toLowerCase();
    switch (riskLower) {
      case 'low':
      case 'conservative':
        return 'success';
      case 'medium':
      case 'moderate':
        return 'warning';
      case 'high':
      case 'aggressive':
        return 'error';
      default: 
        return 'default';
    }
  };

  const getAccountTypeColor = (type) => {
    if (!type) return 'default';
    const typeLower = String(type).toLowerCase();
    switch (typeLower) {
      case 'basic': 
        return 'default';
      case 'standard': 
        return 'primary';
      case 'premium': 
        return 'secondary';
      case 'vip': 
        return 'error';
      case 'mt4':
      case 'mt5':
        return 'info';
      default: 
        return 'default';
    }
  };

  const getRequestCounts = () => {
    if (!Array.isArray(requests)) {
      console.error('Requests is not an array:', requests);
      return {
        pending: 0,
        approved: 0,
        active: 0,
        completed: 0,
        rejected: 0,
        total: 0
      };
    }
    
    return {
      pending: requests.filter(r => r?.status === 'pending').length,
      approved: requests.filter(r => r?.status === 'approved').length,
      active: requests.filter(r => r?.status === 'active').length,
      completed: requests.filter(r => r?.status === 'completed').length,
      rejected: requests.filter(r => r?.status === 'rejected').length,
      total: requests.length
    };
  };

  // Filter traders based on search
  const filteredTraders = React.useMemo(() => {
    if (!Array.isArray(traders) || traders.length === 0) return [];
    
    const searchTerm = (traderSearch || '').toLowerCase().trim();
    
    return traders.filter(trader => {
      if (!trader || trader.available === false) return false;
      
      // If no search term, return all available traders
      if (!searchTerm) return true;
      
      // Check if search term matches trader name or email
      return (
        (trader.name && trader.name.toLowerCase().includes(searchTerm)) ||
        (trader.email && trader.email.toLowerCase().includes(searchTerm))
      );
    });
  }, [traders, traderSearch]);

  const counts = getRequestCounts();

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Copy Trading Requests</Typography>
        <Button 
          variant="outlined" 
          startIcon={<Refresh />} 
          onClick={handleRefresh}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {/* Status Filter Tabs */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => {
              setTabValue(newValue);
              const statuses = ['all', 'pending', 'approved', 'active', 'rejected'];
              setStatusFilter(statuses[newValue]);
            }}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab 
              label={
                <Badge badgeContent={counts.all} color="primary">
                  All Requests
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
                <Badge badgeContent={counts.approved} color="info">
                  Approved
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
                <Badge badgeContent={counts.rejected} color="error">
                  Rejected
                </Badge>
              } 
            />
          </Tabs>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Account Type</TableCell>
                  <TableCell>Capital</TableCell>
                  <TableCell>Preferred Trader</TableCell>
                  <TableCell>Risk Level</TableCell>
                  <TableCell>Copy Ratio</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Performance</TableCell>
                  <TableCell>Request Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {request.userName?.charAt(0) || 'U'}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {request.userName || 'Unknown User'}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {request.userEmail || 'No email provided'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={request.accountType || 'Unknown'}
                        color={getAccountTypeColor(request.accountType)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {request?.capital ? `$${Number(request.capital).toLocaleString()}` : 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Person sx={{ mr: 1, color: 'primary.main' }} />
                        {request?.assignedTrader || request?.preferredTrader || 'Not assigned'}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={request?.riskLevel || 'Not specified'}
                        color={getRiskColor(request?.riskLevel || '')}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          {request?.copyRatio ? `${request.copyRatio}%` : 'N/A'}
                        </Typography>
                        {request?.copyRatio && (
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(100, Math.max(0, request.copyRatio))}
                            sx={{ width: 50, height: 6 }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={request.status || 'Unknown'}
                        color={getStatusColor(request.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {request.currentProfit !== undefined ? (
                        <Box>
                          <Typography 
                            variant="body2" 
                            color={request.currentProfit >= 0 ? 'success.main' : 'error.main'}
                            fontWeight="bold"
                          >
                            ${request.currentProfit.toFixed(2)}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            color={request.profitPercentage >= 0 ? 'success.main' : 'error.main'}
                          >
                            ({request.profitPercentage >= 0 ? '+' : ''}{request.profitPercentage}%)
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          N/A
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {request?.requestDate ? new Date(request.requestDate).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleViewRequest(request)}
                      >
                        <Visibility />
                      </IconButton>
                      {request.status === 'pending' && (
                        <>
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleOpenAssignDialog(request)}
                          >
                            <Assignment />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRejectRequest(request.id, 'Manual rejection')}
                          >
                            <Cancel />
                          </IconButton>
                        </>
                      )}
                      {request.status === 'approved' && (
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() => handleActivateCopyTrading(request.id)}
                        >
                          Activate
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Request Details Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: 3
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main', 
          color: 'primary.contrastText',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box>
            <Typography variant="h6">Copy Trading Request</Typography>
            <Typography variant="subtitle2">ID: {selectedRequest?.id || 'N/A'}</Typography>
          </Box>
          {selectedRequest && (
            <Chip 
              label={selectedRequest.status?.toUpperCase()} 
              color={getStatusColor(selectedRequest.status)} 
              size="small"
              sx={{ color: 'white', fontWeight: 'bold' }}
            />
          )}
        </DialogTitle>
        
        <DialogContent sx={{ mt: 2 }}>
          {selectedRequest ? (
            <Box>
              <Grid container spacing={3}>
                {/* User Information */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: 'grey.50', 
                    borderRadius: 1,
                    borderLeft: '4px solid',
                    borderColor: 'primary.main'
                  }}>
                    <Typography variant="subtitle1" color="primary" fontWeight="bold" gutterBottom>
                      USER INFORMATION
                    </Typography>
                    <Box sx={{ '& > *': { mb: 1 } }}>
                      <Box display="flex" alignItems="center">
                        <Person color="action" sx={{ mr: 1, width: 20 }} />
                        <Typography><strong>Name:</strong> {selectedRequest.userName || 'N/A'}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center">
                        <Email color="action" sx={{ mr: 1, width: 20 }} />
                        <Typography><strong>Email:</strong> {selectedRequest.userEmail || 'N/A'}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center">
                        <AccountBalanceWallet color="action" sx={{ mr: 1, width: 20 }} />
                        <Typography><strong>Account Type:</strong> {selectedRequest.accountType || 'N/A'}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center">
                        <BusinessCenter color="action" sx={{ mr: 1, width: 20 }} />
                        <Typography><strong>Broker:</strong> {selectedRequest.broker || 'N/A'}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center">
                        <Dns color="action" sx={{ mr: 1, width: 20 }} />
                        <Typography><strong>Server:</strong> {selectedRequest.server || 'N/A'}</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Grid>

                {/* Trading Details */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: 'grey.50', 
                    borderRadius: 1,
                    borderLeft: '4px solid',
                    borderColor: 'secondary.main',
                    height: '100%'
                  }}>
                    <Typography variant="subtitle1" color="secondary" fontWeight="bold" gutterBottom>
                      TRADING DETAILS
                    </Typography>
                    <Box sx={{ '& > *': { mb: 1 } }}>
                      <Box display="flex" alignItems="center">
                        <Warning color="warning" sx={{ mr: 1, width: 20 }} />
                        <Typography><strong>Risk Level:</strong> 
                          <Chip 
                            label={selectedRequest.riskLevel || 'N/A'} 
                            size="small" 
                            sx={{ ml: 1, bgcolor: getRiskColor(selectedRequest.riskLevel) }}
                          />
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center">
                        <TrendingDown color="error" sx={{ mr: 1, width: 20 }} />
                        <Typography><strong>Max Drawdown:</strong> {selectedRequest.maxDrawdown || 'N/A'}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center">
                        <Event color="action" sx={{ mr: 1, width: 20 }} />
                        <Typography><strong>Request Date:</strong> {selectedRequest.requestDate || 'N/A'}</Typography>
                      </Box>
                      {selectedRequest.assignedTrader && (
                        <Box display="flex" alignItems="center">
                          <PersonAdd color="action" sx={{ mr: 1, width: 20 }} />
                          <Typography><strong>Assigned Trader:</strong> {selectedRequest.assignedTrader}</Typography>
                        </Box>
                      )}
                      {selectedRequest.startDate && (
                        <Box display="flex" alignItems="center">
                          <PlayArrow color="success" sx={{ mr: 1, width: 20 }} />
                          <Typography><strong>Start Date:</strong> {selectedRequest.startDate}</Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Grid>

                {/* Notes & Actions */}
                <Grid item xs={12}>
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: 'grey.50', 
                    borderRadius: 1,
                    borderLeft: '4px solid',
                    borderColor: 'info.main',
                    mt: 2
                  }}>
                    <Typography variant="subtitle1" color="info" fontWeight="bold" gutterBottom>
                      NOTES & COMMENTS
                    </Typography>
                    <Box 
                      sx={{ 
                        p: 2, 
                        bgcolor: 'background.paper', 
                        borderRadius: 1,
                        minHeight: 100
                      }}
                    >
                      <Typography variant="body2" whiteSpace="pre-line">
                        {selectedRequest.notes || 'No notes or comments available.'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button 
            onClick={handleCloseDialog}
            variant="outlined"
            color="inherit"
          >
            Close
          </Button>
          
          {selectedRequest?.status === 'pending' && (
            <>
              <Button 
                color="primary" 
                variant="outlined"
                startIcon={<PersonAdd />}
                onClick={() => handleOpenAssignDialog(selectedRequest)}
                sx={{ mr: 1 }}
              >
                Assign Trader
              </Button>
              <Button 
                color="success" 
                variant="contained"
                startIcon={<CheckCircle />}
                onClick={() => handleApproveRequest(selectedRequest.id)}
                sx={{ mr: 1 }}
              >
                Approve
              </Button>
              <Button 
                color="error" 
                variant="outlined"
                startIcon={<Cancel />}
                onClick={() => handleRejectRequest(selectedRequest.id, 'Rejected by admin')}
              >
                Reject
              </Button>
            </>
          )}
          
          {selectedRequest?.status === 'approved' && (
            <Button 
              color="primary" 
              variant="contained"
              startIcon={<PlayArrow />}
              onClick={() => handleActivateCopyTrading(selectedRequest.id)}
            >
              Activate Copy Trading
            </Button>
          )}
          
          {selectedRequest?.status === 'active' && (
            <Button 
              color="warning" 
              variant="outlined"
              startIcon={<Pause />}
              onClick={() => handleStatusUpdate(selectedRequest.id, 'paused', 'Paused by admin')}
            >
              Pause Copy Trading
            </Button>
          )}
          
          {selectedRequest?.status === 'paused' && (
            <Button 
              color="primary" 
              variant="contained"
              startIcon={<PlayArrow />}
              onClick={() => handleStatusUpdate(selectedRequest.id, 'active', 'Resumed by admin')}
            >
              Resume Copy Trading
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Assign Trader Dialog */}
      <Dialog open={assignDialogOpen} onClose={handleCloseAssignDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Trader</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Search traders..."
              value={traderSearch}
              onChange={(e) => setTraderSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <InputLabel sx={{ mt: 2 }}>Select Trader</InputLabel>
            <Select
              value={selectedTrader}
              onChange={(e) => setSelectedTrader(e.target.value)}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 300,
                  },
                },
              }}
            >
              {filteredTraders.map((trader) => (
                <MenuItem key={trader.id} value={trader.id}>
                  <Box>
                    <Typography variant="subtitle2">
                      {trader.name} - {trader.expertise}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Win Rate: {trader.winRate}% | Avg Return: {trader.avgReturn}% | Followers: {trader.followers}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAssignDialog}>Cancel</Button>
          <Button
            onClick={() => handleApproveRequest(selectedRequest?.id, selectedTrader)}
            variant="contained"
            disabled={!selectedTrader}
          >
            Approve & Assign
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CopyTradingRequests;
