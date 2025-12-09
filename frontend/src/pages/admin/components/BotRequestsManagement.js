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
} from '@mui/material';
import {
  Visibility,
  CheckCircle,
  Cancel,
  PlayArrow,
  Stop,
  Edit,
  Delete,
} from '@mui/icons-material';
import { botApi } from '../../../services/adminApi';

const BotRequestsManagement = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [statusUpdateOpen, setStatusUpdateOpen] = useState(false);
  const [statusData, setStatusData] = useState({
    status: '',
    rejectionReason: ''
  });

  const statusColors = {
    pending: 'warning',
    approved: 'info',
    active: 'success',
    rejected: 'error',
    completed: 'default'
  };

  const botTypes = [
    'Scalping Bot',
    'Swing Bot', 
    'DCA Bot',
    'Grid Bot',
    'Arbitrage Bot'
  ];

  const riskLevels = ['Low', 'Medium', 'High'];

  useEffect(() => {
    fetchRequests();
  }, [tabValue]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await botApi.getRequests(tabValue);
      setRequests(response.data.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch bot requests');
      console.error('Error fetching bot requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      await botApi.updateStatus(selectedRequest._id, statusData);
      setStatusUpdateOpen(false);
      setStatusData({ status: '', rejectionReason: '' });
      fetchRequests();
      setSelectedRequest(null);
    } catch (err) {
      setError('Failed to update request status');
      console.error('Error updating status:', err);
    }
  };

  const openStatusDialog = (request, status) => {
    setSelectedRequest(request);
    setStatusData({ status, rejectionReason: '' });
    setStatusUpdateOpen(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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
        Trading Bot Requests Management
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
              <TableCell>Bot Type</TableCell>
              <TableCell>Capital</TableCell>
              <TableCell>Trading Pair</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Risk Level</TableCell>
              <TableCell>Expected ROI</TableCell>
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
                <TableCell>{request.botType}</TableCell>
                <TableCell>{formatCurrency(request.capital)}</TableCell>
                <TableCell>{request.tradingPair}</TableCell>
                <TableCell>{request.duration} days</TableCell>
                <TableCell>
                  <Chip 
                    label={request.riskLevel} 
                    size="small"
                    color={request.riskLevel === 'Low' ? 'success' : 
                           request.riskLevel === 'Medium' ? 'warning' : 'error'}
                  />
                </TableCell>
                <TableCell>{request.expectedROI}%</TableCell>
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
                        color="success"
                        onClick={() => openStatusDialog(request, 'approved')}
                      >
                        <CheckCircle />
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
                      color="primary"
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
        <DialogTitle>Bot Request Details</DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>User Information</Typography>
                    <Typography><strong>Name:</strong> {selectedRequest.userId?.firstName} {selectedRequest.userId?.lastName}</Typography>
                    <Typography><strong>Email:</strong> {selectedRequest.userId?.email}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Bot Configuration</Typography>
                    <Typography><strong>Type:</strong> {selectedRequest.botType}</Typography>
                    <Typography><strong>Trading Pair:</strong> {selectedRequest.tradingPair}</Typography>
                    <Typography><strong>Capital:</strong> {formatCurrency(selectedRequest.capital)}</Typography>
                    <Typography><strong>Duration:</strong> {selectedRequest.duration} days</Typography>
                    <Typography><strong>Risk Level:</strong> {selectedRequest.riskLevel}</Typography>
                    <Typography><strong>Expected ROI:</strong> {selectedRequest.expectedROI}%</Typography>
                  </CardContent>
                </Card>
              </Grid>
              {selectedRequest.settings && (
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Bot Settings</Typography>
                      {selectedRequest.settings.stopLoss && (
                        <Typography><strong>Stop Loss:</strong> {selectedRequest.settings.stopLoss}%</Typography>
                      )}
                      {selectedRequest.settings.takeProfit && (
                        <Typography><strong>Take Profit:</strong> {selectedRequest.settings.takeProfit}%</Typography>
                      )}
                      {selectedRequest.settings.maxTrades && (
                        <Typography><strong>Max Trades:</strong> {selectedRequest.settings.maxTrades}</Typography>
                      )}
                      {selectedRequest.settings.tradeAmount && (
                        <Typography><strong>Trade Amount:</strong> {formatCurrency(selectedRequest.settings.tradeAmount)}</Typography>
                      )}
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
                    {selectedRequest.activatedAt && (
                      <Typography><strong>Activated:</strong> {new Date(selectedRequest.activatedAt).toLocaleString()}</Typography>
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
    </Box>
  );
};

export default BotRequestsManagement;
