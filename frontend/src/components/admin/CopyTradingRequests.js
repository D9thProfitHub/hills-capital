import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Grid
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  AssignmentInd as AssignmentIndIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import copyTradingApi from '../../services/copyTradingApi';
import { format } from 'date-fns';

// Status configuration
const statusColors = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
  processing: 'info',
  completed: 'primary',
  active: 'success',
  cancelled: 'default'
};

const statusIcons = {
  pending: <PendingIcon fontSize="small" />,
  approved: <CheckCircleIcon fontSize="small" />,
  rejected: <CancelIcon fontSize="small" />,
  processing: <CircularProgress size={16} />,
  completed: <CheckCircleIcon fontSize="small" />,
  active: <CheckCircleIcon fontSize="small" />,
  cancelled: <CloseIcon fontSize="small" />
};

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approve' },
  { value: 'rejected', label: 'Reject' },
  { value: 'processing', label: 'Mark as Processing' },
  { value: 'active', label: 'Mark as Active' },
  { value: 'completed', label: 'Mark as Completed' },
  { value: 'cancelled', label: 'Cancel Request' }
];

const CopyTradingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [traders, setTraders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedTrader, setSelectedTrader] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch copy trading requests
  const fetchRequests = async (status = '') => {
    try {
      setLoading(true);
      const response = await copyTradingApi.getAllCopyTradingRequests(status === 'all' ? '' : status);
      setRequests(response.data || []);
    } catch (error) {
      console.error('Error fetching copy trading requests:', error);
      showSnackbar('Failed to fetch copy trading requests', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch available traders
  const fetchTraders = async () => {
    try {
      const response = await copyTradingApi.getAvailableTraders();
      setTraders(response.data || []);
    } catch (error) {
      console.error('Error fetching traders:', error);
      showSnackbar('Failed to fetch available traders', 'error');
    }
  };

  useEffect(() => {
    fetchRequests(statusFilter === 'all' ? '' : statusFilter);
    fetchTraders();
  }, [statusFilter]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRequests(statusFilter === 'all' ? '' : statusFilter);
  };

  const handleMenuOpen = (event, request) => {
    setAnchorEl(event.currentTarget);
    setSelectedRequest(request);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRequest(null);
  };

  const handleStatusClick = (status) => {
    setSelectedStatus(status);
    setNotes('');
    setStatusDialogOpen(true);
    handleMenuClose();
  };

  const handleAssignClick = () => {
    setSelectedTrader(selectedRequest?.traderId || '');
    setAssignDialogOpen(true);
    handleMenuClose();
  };

  const handleStatusUpdate = async () => {
    if (!selectedRequest) return;
    
    try {
      await copyTradingApi.updateRequestStatus(selectedRequest.id, selectedStatus, notes);
      showSnackbar('Request status updated successfully', 'success');
      setStatusDialogOpen(false);
      fetchRequests(statusFilter === 'all' ? '' : statusFilter);
    } catch (error) {
      console.error('Error updating request status:', error);
      showSnackbar(error.message || 'Failed to update request status', 'error');
    }
  };

  const handleAssignTrader = async () => {
    if (!selectedRequest || !selectedTrader) return;
    
    try {
      await copyTradingApi.assignTrader(selectedRequest.id, selectedTrader);
      showSnackbar('Trader assigned successfully', 'success');
      setAssignDialogOpen(false);
      fetchRequests(statusFilter === 'all' ? '' : statusFilter);
    } catch (error) {
      console.error('Error assigning trader:', error);
      showSnackbar(error.message || 'Failed to assign trader', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const getFilteredRequests = () => {
    if (statusFilter === 'all') return requests;
    return requests.filter(req => req.status === statusFilter);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) 
        ? 'Invalid date' 
        : date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return 'N/A';
    }
  };

  const getStatusLabel = (status) => {
    if (!status) return '';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading && !refreshing) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Typography variant="h5" component="h2">
          Copy Trading Requests
        </Typography>
        
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="status-filter-label">Filter by Status</InputLabel>
            <Select
              labelId="status-filter-label"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Filter by Status"
            >
              <MenuItem value="all">All Requests</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="processing">Processing</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
          
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Account Details</TableCell>
              <TableCell>Risk Level</TableCell>
              <TableCell>Trader</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getFilteredRequests().length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography color="textSecondary">
                    No copy trading requests found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              getFilteredRequests().map((request) => (
                <TableRow key={request.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2">{request.user?.name || 'N/A'}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {request.user?.email || 'N/A'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        <strong>Platform:</strong> {request.accountType}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Broker:</strong> {request.broker}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Account:</strong> {request.login}
                      </Typography>
                      {request.server && (
                        <Typography variant="body2">
                          <strong>Server:</strong> {request.server}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" flexDirection="column" gap={0.5}>
                      <Chip 
                        size="small"
                        label={request.riskLevel}
                        color={request.riskLevel === 'high' ? 'error' : request.riskLevel === 'medium' ? 'warning' : 'success'}
                        variant="outlined"
                        style={{ textTransform: 'capitalize' }}
                      />
                      <Typography variant="caption" color="textSecondary">
                        Max DD: {request.maxDrawdown}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {request.trader ? (
                      <Chip 
                        label={request.trader.name}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        Not assigned
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Tooltip title={getStatusLabel(request.status)}>
                      <Chip
                        icon={statusIcons[request.status] || null}
                        label={getStatusLabel(request.status)}
                        color={statusColors[request.status] || 'default'}
                        size="small"
                        variant="outlined"
                      />
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    {request?.createdAt ? (
                      <Tooltip 
                        title={new Date(request.createdAt).toLocaleString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })}
                      >
                        <Typography variant="body2">
                          {format(new Date(request.createdAt), 'MMM d, yyyy')}
                        </Typography>
                      </Tooltip>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        N/A
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, request)}
                      disabled={request.status === 'completed' || request.status === 'cancelled'}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Status Update Dialog */}
      <Dialog 
        open={statusDialogOpen} 
        onClose={() => setStatusDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Request Status</DialogTitle>
        <DialogContent>
          <Box mb={3}>
            <Typography variant="subtitle1">
              Update status for request from <strong>{selectedRequest?.user?.name || 'N/A'}</strong>
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {selectedRequest?.accountType} Account - {selectedRequest?.broker}
            </Typography>
          </Box>
          
          <FormControl fullWidth margin="normal">
            <InputLabel>New Status</InputLabel>
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              label="New Status"
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            margin="normal"
            label="Notes"
            multiline
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about this status update..."
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleStatusUpdate}
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            disabled={!selectedStatus}
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Trader Dialog */}
      <Dialog 
        open={assignDialogOpen} 
        onClose={() => setAssignDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Assign Trader</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Assign a trader to handle this copy trading request:
          </Typography>
          
          <Typography variant="subtitle2" gutterBottom>
            Request from: <strong>{selectedRequest?.user?.name || 'N/A'}</strong>
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            {selectedRequest?.accountType} Account - {selectedRequest?.broker}
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Select Trader</InputLabel>
            <Select
              value={selectedTrader}
              onChange={(e) => setSelectedTrader(e.target.value)}
              label="Select Trader"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {traders.map((trader) => (
                <MenuItem key={trader.id} value={trader.id}>
                  {trader.name} ({trader.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {selectedTrader && selectedRequest?.traderId && selectedTrader !== selectedRequest.traderId && (
            <Alert severity="info" sx={{ mt: 2 }}>
              This will replace the currently assigned trader.
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAssignTrader}
            variant="contained"
            color="primary"
            startIcon={<AssignmentIndIcon />}
            disabled={!selectedTrader}
          >
            Assign Trader
          </Button>
        </DialogActions>
      </Dialog>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleAssignClick}>
          <AssignmentIndIcon sx={{ mr: 1, color: 'primary.main' }} />
          Assign Trader
        </MenuItem>
        
        <Divider />
        
        {statusOptions.map((option) => (
          <MenuItem 
            key={option.value}
            onClick={() => handleStatusClick(option.value)}
            disabled={selectedRequest?.status === option.value}
          >
            {option.value === 'approved' && <CheckCircleIcon color="success" sx={{ mr: 1 }} />}
            {option.value === 'rejected' && <CancelIcon color="error" sx={{ mr: 1 }} />}
            {option.value === 'processing' && <PendingIcon color="info" sx={{ mr: 1 }} />}
            {option.value === 'active' && <CheckCircleIcon color="success" sx={{ mr: 1 }} />}
            {option.value === 'completed' && <CheckCircleIcon color="primary" sx={{ mr: 1 }} />}
            {option.value === 'cancelled' && <CloseIcon color="action" sx={{ mr: 1 }} />}
            {option.label}
          </MenuItem>
        ))}
        
        <Divider />
        
        <MenuItem onClick={handleMenuClose}>
          <CloseIcon sx={{ mr: 1 }} />
          Close
        </MenuItem>
      </Menu>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CopyTradingRequests;
