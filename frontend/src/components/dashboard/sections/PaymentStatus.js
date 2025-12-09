import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ContentCopy,
  Refresh,
  CheckCircle,
  Schedule,
  Error,
  ArrowBack
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../../services/api';

const PaymentStatus = () => {
  const params = useParams();
  const { paymentId, id } = params;
  const actualPaymentId = paymentId || id;
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Debug logging
  console.log('PaymentStatus params:', params);
  console.log('Actual payment ID:', actualPaymentId);

  const fetchPaymentStatus = async (showRefreshLoader = false) => {
    if (!actualPaymentId) {
      console.error('No payment ID provided');
      toast.error('Invalid payment ID');
      setLoading(false);
      return;
    }

    try {
      if (showRefreshLoader) setRefreshing(true);
      else setLoading(true);

      console.log('Fetching payment status for ID:', actualPaymentId);
      const response = await api.get(`/api/payments/${actualPaymentId}/status`);
      
      if (response.data.success) {
        setPayment(response.data.data);
      } else {
        toast.error('Failed to fetch payment status');
      }
    } catch (error) {
      console.error('Error fetching payment status:', error);
      toast.error('Failed to fetch payment status');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (actualPaymentId) {
      fetchPaymentStatus();
      
      // Auto-refresh every 30 seconds for pending payments
      const interval = setInterval(() => {
        if (payment && ['waiting', 'confirming'].includes(payment?.payment_status || payment?.status)) {
          fetchPaymentStatus(true);
        }
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [actualPaymentId, payment?.payment_status]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'finished': return 'success';
      case 'partially_paid': return 'warning';
      case 'waiting': return 'info';
      case 'confirming': return 'warning';
      case 'failed': return 'error';
      case 'refunded': return 'default';
      case 'expired': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'finished': return <CheckCircle />;
      case 'waiting': return <Schedule />;
      case 'confirming': return <Schedule />;
      case 'failed': return <Error />;
      case 'expired': return <Error />;
      default: return <Schedule />;
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case 'finished': return 'Payment completed successfully!';
      case 'partially_paid': return 'Partial payment received. Please send the remaining amount.';
      case 'waiting': return 'Waiting for payment. Please send the exact amount to the address below.';
      case 'confirming': return 'Payment received and confirming on blockchain.';
      case 'failed': return 'Payment failed. Please try again or contact support.';
      case 'refunded': return 'Payment has been refunded.';
      case 'expired': return 'Payment expired. Please create a new payment.';
      default: return 'Processing payment...';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!payment) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="h6" color="error">Payment not found</Typography>
        <Button onClick={() => navigate('/dashboard')} sx={{ mt: 2 }}>
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  return (
    <Box maxWidth="md" mx="auto" p={3}>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/dashboard')} sx={{ mr: 1 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" fontWeight="bold">
          Payment Status
        </Typography>
        <Box flexGrow={1} />
        <Button
          variant="outlined"
          startIcon={refreshing ? <CircularProgress size={16} /> : <Refresh />}
          onClick={() => fetchPaymentStatus(true)}
          disabled={refreshing}
        >
          Refresh
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Grid container spacing={3}>
            {/* Status Section */}
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" mb={2}>
                <Chip
                  icon={getStatusIcon(payment?.payment_status || payment?.status)}
                  label={(payment?.payment_status || payment?.status || 'loading').replace('_', ' ').toUpperCase()}
                  color={getStatusColor(payment?.payment_status || payment?.status)}
                  sx={{ mr: 2 }}
                />
                {refreshing && <CircularProgress size={20} />}
              </Box>
              <Alert severity={getStatusColor(payment?.payment_status || payment?.status) === 'error' ? 'error' : 'info'}>
                {getStatusMessage(payment?.payment_status || payment?.status)}
              </Alert>
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            {/* Payment Details */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Payment Details</Typography>
              
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">Order ID</Typography>
                <Box display="flex" alignItems="center">
                  <Typography variant="body1" sx={{ mr: 1 }}>{payment?.order_id || 'N/A'}</Typography>
                  <Tooltip title="Copy Order ID">
                    <IconButton size="small" onClick={() => copyToClipboard(payment?.order_id || '')} disabled={!payment?.order_id}>
                      <ContentCopy fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">Amount (USD)</Typography>
                <Typography variant="h6">${payment?.price_amount || payment?.amount || 'N/A'}</Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">Payment Currency</Typography>
                <Typography variant="body1">{payment?.pay_currency?.toUpperCase() || 'N/A'}</Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">Amount to Pay</Typography>
                <Typography variant="h6">{payment?.pay_amount || 'N/A'} {payment?.pay_currency?.toUpperCase() || ''}</Typography>
              </Box>
            </Grid>

            {/* Payment Address */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Payment Address</Typography>
              
              {payment?.pay_address && (
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Send exactly {payment?.pay_amount} {payment?.pay_currency?.toUpperCase()} to:
                  </Typography>
                  <Box 
                    sx={{ 
                      p: 2, 
                      bgcolor: 'grey.100', 
                      borderRadius: 1, 
                      wordBreak: 'break-all',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      {payment?.pay_address}
                    </Typography>
                    <Tooltip title="Copy Address">
                      <IconButton size="small" onClick={() => copyToClipboard(payment?.pay_address || '')}>
                        <ContentCopy fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              )}

              {payment?.created_at && (
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">Created</Typography>
                  <Typography variant="body1">
                    {new Date(payment?.created_at).toLocaleString()}
                  </Typography>
                </Box>
              )}

              {payment?.updated_at && payment?.updated_at !== payment?.created_at && (
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">Last Updated</Typography>
                  <Typography variant="body1">
                    {new Date(payment?.updated_at).toLocaleString()}
                  </Typography>
                </Box>
              )}
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12}>
              <Divider sx={{ mb: 2 }} />
              <Box display="flex" gap={2} flexWrap="wrap">
                <Button
                  variant="contained"
                  onClick={() => navigate('/dashboard')}
                >
                  Back to Dashboard
                </Button>
                
                {(payment?.payment_status === 'expired' || payment?.status === 'expired') && (
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => {
                      // Navigate back to create new payment
                      if (payment.investment_id) {
                        navigate('/investments');
                      } else {
                        navigate('/dashboard');
                      }
                    }}
                  >
                    Create New Payment
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PaymentStatus;
