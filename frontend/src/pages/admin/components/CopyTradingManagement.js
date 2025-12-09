import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  IconButton,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  Visibility,
  CheckCircle,
  Cancel,
  PlayArrow,
  Stop,
  Assignment,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import { copyTradingApi } from '../../../services/adminApi';

const CopyTradingManagement = () => {
  const [requests, setRequests] = useState([]);
  const [traders, setTraders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [statusUpdateOpen, setStatusUpdateOpen] = useState(false);
  const [traderAssignOpen, setTraderAssignOpen] = useState(false);
  const [statusData, setStatusData] = useState({
    status: '',
    rejectionReason: '',
    assignedTraderId: ''
  });

  const statusColors = {
    pending: 'warning',
    approved: 'info',
    active: 'success',
    rejected: 'error',
    completed: 'default'
  };

  const accountTypes = ['Basic', 'Premium', 'VIP'];
  const riskLevels = ['Conservative', 'Moderate', 'Aggressive'];

  useEffect(() => {
    fetchRequests();
    fetchTraders();
  }, [tabValue]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await copyTradingApi.getRequests(tabValue);
      setRequests(response.data.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch copy trading requests');
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTraders = async () => {
    try {
      const response = await copyTradingApi.getTraders();
      setTraders(response.data.data);
    } catch (err) {
      console.error('Error fetching traders:', err);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      await copyTradingApi.updateStatus(selectedRequest._id, statusData);
      setStatusUpdateOpen(false);
      setTraderAssignOpen(false);
      setStatusData({ status: '', rejectionReason: '', assignedTraderId: '' });
      fetchRequests();
      setSelectedRequest(null);
    } catch (err) {
      setError('Failed to update request status');
      console.error('Error updating status:', err);
    }
  };

  const openStatusDialog = (request, status) => {
    setSelectedRequest(request);
    setStatusData({ status, rejectionReason: '', assignedTraderId: '' });
    setStatusUpdateOpen(true);
  };

  const openTraderAssignDialog = (request) => {
    setSelectedRequest(request);
    setStatusData({ 
      status: 'approved', 
      rejectionReason: '', 
      assignedTraderId: request.assignedTraderId?._id || '' 
    });
    setTraderAssignOpen(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getPerformanceColor = (value) => {
    if (value > 0) return 'success';
    if (value < 0) return 'error';
    return 'default';
  };

  const filteredRequests = requests.filter(request => {
    if (tabValue === 'all') return true;
    return request.status === tabValue;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Copy Trading Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="All Requests" value="all" />
          <Tab label="Pending" value="pending" />
          <Tab label="Approved" value="approved" />
          <Tab label="Active" value="active" />
          <Tab label="Rejected" value="rejected" />
          <Tab label="Completed" value="completed" />
        </Tabs>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Account Type</TableCell>
              <TableCell>Capital</TableCell>
              <TableCell>Assigned Trader</TableCell>
              <TableCell>Risk Level</TableCell>
              <TableCell>Copy Ratio</TableCell>
              <TableCell>Performance</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRequests.map((request) => (
              <TableRow key={request._id}>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {request.userId?.firstName} {request.userId?.lastName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {request.userId?.email}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={request.accountType} 
                    size="small"
                    color={request.accountType === 'VIP' ? 'primary' : 
                           request.accountType === 'Premium' ? 'secondary' : 'default'}
                  />
                </TableCell>
                <TableCell>{formatCurrency(request.capital)}</TableCell>
                <TableCell>
                  {request.assignedTraderId ? (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar 
                        src={request.assignedTraderId.avatar} 
                        sx={{ width: 24, height: 24 }}
                      >
                        {request.assignedTraderId.firstName?.[0]}
                      </Avatar>
                      <Typography variant="body2">
                        {request.assignedTraderId.firstName} {request.assignedTraderId.lastName}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Not assigned
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={request.riskLevel} 
                    size="small"
                    color={request.riskLevel === 'Conservative' ? 'success' : 
                           request.riskLevel === 'Moderate' ? 'warning' : 'error'}
                  />
                </TableCell>
                <TableCell>{request.copyRatio}%</TableCell>
                <TableCell>
                  {request.performanceStats ? (
                    <Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        {request.performanceStats.totalReturn >= 0 ? (
                          <TrendingUp color="success" fontSize="small" />
                        ) : (
                          <TrendingDown color="error" fontSize="small" />
                        )}
                        <Typography 
                          variant="body2" 
                          color={getPerformanceColor(request.performanceStats.totalReturn)}
                        >
                          {request.performanceStats.totalReturn?.toFixed(2)}%
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {request.performanceStats.totalTrades} trades
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No data
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={request.status} 
                    color={statusColors[request.status]}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(request.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <IconButton 
                    size="small" 
                    onClick={() => {
                      setSelectedRequest(request);
                      setDetailsOpen(true);
                    }}
                  >
                    <Visibility />
                  </IconButton>
                  {request.status === 'pending' && (
                    <>
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => openTraderAssignDialog(request)}
                        title="Assign Trader & Approve"
                      >
                        <Assignment />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => openStatusDialog(request, 'rejected')}
                      >
                        <Cancel />
                      </IconButton>
                    </>
                  )}
                  {request.status === 'approved' && (
                    <IconButton 
                      size="small" 
                      color="success"
                      onClick={() => openStatusDialog(request, 'active')}
                    >
                      <PlayArrow />
                    </IconButton>
                  )}
                  {request.status === 'active' && (
                    <IconButton 
                      size="small" 
                      color="warning"
                      onClick={() => openStatusDialog(request, 'completed')}
                    >
                      <Stop />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Request Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Copy Trading Request Details</DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>User Information</Typography>
                    <Typography><strong>Name:</strong> {selectedRequest.userId?.firstName} {selectedRequest.userId?.lastName}</Typography>
                    <Typography><strong>Email:</strong> {selectedRequest.userId?.email}</Typography>
                    <Typography><strong>Account Type:</strong> {selectedRequest.accountType}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Trading Configuration</Typography>
                    <Typography><strong>Capital:</strong> {formatCurrency(selectedRequest.capital)}</Typography>
                    <Typography><strong>Risk Level:</strong> {selectedRequest.riskLevel}</Typography>
                    <Typography><strong>Copy Ratio:</strong> {selectedRequest.copyRatio}%</Typography>
                    {selectedRequest.preferredTraderId && (
                      <Typography><strong>Preferred Trader:</strong> {selectedRequest.preferredTraderId.firstName} {selectedRequest.preferredTraderId.lastName}</Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              {selectedRequest.assignedTraderId && (
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Assigned Trader</Typography>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar 
                          src={selectedRequest.assignedTraderId.avatar} 
                          sx={{ width: 48, height: 48 }}
                        >
                          {selectedRequest.assignedTraderId.firstName?.[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight="bold">
                            {selectedRequest.assignedTraderId.firstName} {selectedRequest.assignedTraderId.lastName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {selectedRequest.assignedTraderId.email}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}
              {selectedRequest.performanceStats && (
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Performance Statistics</Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6} md={3}>
                          <Typography variant="body2" color="text.secondary">Total Return</Typography>
                          <Typography 
                            variant="h6" 
                            color={getPerformanceColor(selectedRequest.performanceStats.totalReturn)}
                          >
                            {selectedRequest.performanceStats.totalReturn?.toFixed(2)}%
                          </Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Typography variant="body2" color="text.secondary">Total Trades</Typography>
                          <Typography variant="h6">
                            {selectedRequest.performanceStats.totalTrades}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Typography variant="body2" color="text.secondary">Win Rate</Typography>
                          <Typography variant="h6">
                            {selectedRequest.performanceStats.winRate?.toFixed(1)}%
                          </Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Typography variant="body2" color="text.secondary">Current Value</Typography>
                          <Typography variant="h6">
                            {formatCurrency(selectedRequest.performanceStats.currentValue)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              )}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Status Information</Typography>
                    <Typography><strong>Current Status:</strong> 
                      <Chip 
                        label={selectedRequest.status} 
                        color={statusColors[selectedRequest.status]}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                    <Typography><strong>Created:</strong> {new Date(selectedRequest.createdAt).toLocaleString()}</Typography>
                    {selectedRequest.approvedAt && (
                      <Typography><strong>Approved:</strong> {new Date(selectedRequest.approvedAt).toLocaleString()}</Typography>
                    )}
                    {selectedRequest.rejectionReason && (
                      <Typography><strong>Rejection Reason:</strong> {selectedRequest.rejectionReason}</Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={statusUpdateOpen} onClose={() => setStatusUpdateOpen(false)}>
        <DialogTitle>Update Request Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select
              value={statusData.status}
              onChange={(e) => setStatusData({...statusData, status: e.target.value})}
              label="Status"
            >
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>
          {statusData.status === 'rejected' && (
            <TextField
              fullWidth
              margin="normal"
              label="Rejection Reason"
              multiline
              rows={3}
              value={statusData.rejectionReason}
              onChange={(e) => setStatusData({...statusData, rejectionReason: e.target.value})}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusUpdateOpen(false)}>Cancel</Button>
          <Button onClick={handleStatusUpdate} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>

      {/* Trader Assignment Dialog */}
      <Dialog open={traderAssignOpen} onClose={() => setTraderAssignOpen(false)}>
        <DialogTitle>Assign Trader & Approve Request</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Assign Trader</InputLabel>
            <Select
              value={statusData.assignedTraderId}
              onChange={(e) => setStatusData({...statusData, assignedTraderId: e.target.value})}
              label="Assign Trader"
            >
              {traders.map((trader) => (
                <MenuItem key={trader._id} value={trader._id}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar src={trader.avatar} sx={{ width: 24, height: 24 }}>
                      {trader.firstName?.[0]}
                    </Avatar>
                    {trader.firstName} {trader.lastName} - {trader.winRate}% win rate
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTraderAssignOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleStatusUpdate} 
            variant="contained"
            disabled={!statusData.assignedTraderId}
          >
            Assign & Approve
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CopyTradingManagement;
