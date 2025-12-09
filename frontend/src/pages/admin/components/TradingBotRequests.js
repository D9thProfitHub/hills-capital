import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { botApi } from '../../../services/adminApi';

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
  Avatar,
  Tabs,
  Tab,
  Badge
} from '@mui/material';
import {
  Visibility,
  CheckCircle,
  Cancel,
  SmartToy,
  Person,
  AttachMoney,
  Schedule,
  TrendingUp
} from '@mui/icons-material';

const TradingBotRequests = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchBotRequests();
    
    // Set up polling for real-time updates
    const interval = setInterval(() => {
      fetchBotRequests();
    }, 30000); // Poll every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, statusFilter]);

  const fetchBotRequests = async () => {
    try {
      const response = await botApi.getRequests(statusFilter);
      const fetched = response.data?.data || [];
      setRequests(fetched);
    } catch (error) {
      console.error('Error fetching bot requests:', error);
      toast.error(error.message || 'Failed to fetch requests');
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

  const handleApproveRequest = async (requestId) => {
    try {
      setRequests(requests.map(request => 
        request.id === requestId 
          ? { 
              ...request, 
              status: 'approved', 
              approvedDate: new Date().toISOString().split('T')[0] 
            }
          : request
      ));
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleRejectRequest = async (requestId, reason) => {
    try {
      setRequests(requests.map(request => 
        request.id === requestId 
          ? { 
              ...request, 
              status: 'rejected', 
              rejectedDate: new Date().toISOString().split('T')[0],
              rejectionReason: reason
            }
          : request
      ));
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  const handleActivateBot = async (requestId) => {
    try {
      setRequests(requests.map(request => 
        request.id === requestId 
          ? { 
              ...request, 
              status: 'active', 
              startDate: new Date().toISOString().split('T')[0] 
            }
          : request
      ));
    } catch (error) {
      console.error('Error activating bot:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'info';
      case 'active': return 'success';
      case 'rejected': return 'error';
      case 'completed': return 'default';
      default: return 'default';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk.toLowerCase()) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      default: return 'default';
    }
  };

  const getRequestCounts = () => {
    return {
      all: requests.length,
      pending: requests.filter(r => r.status === 'pending').length,
      approved: requests.filter(r => r.status === 'approved').length,
      active: requests.filter(r => r.status === 'active').length,
      rejected: requests.filter(r => r.status === 'rejected').length
    };
  };

  const counts = getRequestCounts();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Trading Bot Requests
      </Typography>

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
                  <TableCell>Bot Type</TableCell>
                  <TableCell>Capital</TableCell>
                  <TableCell>Trading Pair</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Risk Level</TableCell>
                  <TableCell>Expected ROI</TableCell>
                  <TableCell>Status</TableCell>
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
                          {request.userName.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {request.userName}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {request.userEmail}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <SmartToy sx={{ mr: 1, color: 'primary.main' }} />
                        {request.botType}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        ${request.capital.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>{request.tradingPair}</TableCell>
                    <TableCell>{request.duration} days</TableCell>
                    <TableCell>
                      <Chip
                        label={request.riskLevel}
                        color={getRiskColor(request.riskLevel)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography color="success.main">
                        {request.expectedROI}%
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={request.status}
                        color={getStatusColor(request.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{request.requestDate}</TableCell>
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
                            onClick={() => handleApproveRequest(request.id)}
                          >
                            <CheckCircle />
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
                          onClick={() => handleActivateBot(request.id)}
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
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Trading Bot Request Details
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="User Name"
                  value={selectedRequest.userName}
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  value={selectedRequest.userEmail}
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Bot Type"
                  value={selectedRequest.botType}
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Capital"
                  value={`$${selectedRequest.capital.toLocaleString()}`}
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Trading Pair"
                  value={selectedRequest.tradingPair}
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Duration"
                  value={`${selectedRequest.duration} days`}
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Risk Level"
                  value={selectedRequest.riskLevel}
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Expected ROI"
                  value={`${selectedRequest.expectedROI}%`}
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Status"
                  value={selectedRequest.status}
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Request Date"
                  value={selectedRequest.requestDate}
                  disabled
                />
              </Grid>
              {selectedRequest.currentROI && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Current ROI"
                    value={`${selectedRequest.currentROI}%`}
                    disabled
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={3}
                  value={selectedRequest.notes}
                  disabled
                />
              </Grid>
              {selectedRequest.rejectionReason && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Rejection Reason"
                    multiline
                    rows={2}
                    value={selectedRequest.rejectionReason}
                    disabled
                  />
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
          {selectedRequest?.status === 'pending' && (
            <>
              <Button
                onClick={() => {
                  handleApproveRequest(selectedRequest.id);
                  handleCloseDialog();
                }}
                variant="contained"
                color="success"
              >
                Approve
              </Button>
              <Button
                onClick={() => {
                  handleRejectRequest(selectedRequest.id, 'Manual rejection');
                  handleCloseDialog();
                }}
                variant="contained"
                color="error"
              >
                Reject
              </Button>
            </>
          )}
          {selectedRequest?.status === 'approved' && (
            <Button
              onClick={() => {
                handleActivateBot(selectedRequest.id);
                handleCloseDialog();
              }}
              variant="contained"
              color="success"
            >
              Activate Bot
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TradingBotRequests;
