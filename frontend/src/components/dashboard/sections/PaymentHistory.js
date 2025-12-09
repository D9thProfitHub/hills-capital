import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Paper,
  Chip,
  Button,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  TablePagination
} from '@mui/material';
import {
  Visibility,
  ContentCopy,
  Refresh
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../../services/api';

const PaymentHistory = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/payments?offset=${page * rowsPerPage}&limit=${rowsPerPage}`);
      
      if (response.data.success) {
        // Payment data loaded successfully
        setPayments(response.data.data.payments);
        setTotalCount(response.data.data.total);
      } else {
        toast.error('Failed to fetch payment history');
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to fetch payment history');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

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

  const getPaymentType = (payment) => {
    // Check for related investment or subscription
    if (payment.relatedId || payment.related_id) {
      return payment.type === 'investment' ? 'Investment' : 
             payment.type === 'subscription' ? 'Subscription' : 'Deposit';
    }
    // Default to the payment type from the model
    return payment.type ? payment.type.charAt(0).toUpperCase() + payment.type.slice(1) : 'Deposit';
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading && payments.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          Payment History
        </Typography>
        <Button
          variant="outlined"
          startIcon={loading ? <CircularProgress size={16} /> : <Refresh />}
          onClick={fetchPayments}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {payments.length === 0 ? (
        <Card>
          <CardContent>
            <Alert severity="info">
              No payments found. Start by making a deposit or investment.
            </Alert>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent sx={{ p: 0 }}>
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow key="header">
                    <TableCell>Order ID</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Amount (USD)</TableCell>
                    <TableCell>Crypto Amount</TableCell>
                    <TableCell>Currency</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments.map((payment, index) => (
                    <TableRow key={payment.payment_id || payment.id || index} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Typography variant="body2" sx={{ mr: 1 }}>
                            {payment.order_id || payment.orderId}
                          </Typography>
                          <Tooltip title="Copy Order ID">
                            <IconButton 
                              size="small" 
                              onClick={() => copyToClipboard(payment.order_id || payment.orderId)}
                            >
                              <ContentCopy fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Chip 
                          label={getPaymentType(payment)} 
                          size="small"
                          color={payment.type === 'investment' ? 'secondary' : 
                                 payment.type === 'subscription' ? 'info' : 'primary'}
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          ${payment.amount || '0.00'}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2">
                          {payment.pay_amount || payment.payAmount || 'N/A'}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2" sx={{ textTransform: 'uppercase' }}>
                          {payment.pay_currency || payment.payCurrency || 'N/A'}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Chip
                          label={(payment.status || payment.payment_status || 'waiting').replace('_', ' ').toUpperCase()}
                          color={getStatusColor(payment.status || payment.payment_status)}
                          size="small"
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2">
                          {payment.created_at || payment.createdAt || payment.date ? 
                            new Date(payment.created_at || payment.createdAt || payment.date).toLocaleDateString() : 
                            'N/A'
                          }
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {payment.created_at || payment.createdAt || payment.date ? 
                            new Date(payment.created_at || payment.createdAt || payment.date).toLocaleTimeString() : 
                            'N/A'
                          }
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => {
                              const paymentId = payment.payment_id || payment.id || payment.nowPaymentId || payment.nowpayment_id;
                              if (paymentId) {
                                navigate(`/payment-status/${paymentId}`);
                              } else {
                                toast.error('Payment ID not found');
                              }
                            }}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              component="div"
              count={totalCount}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default PaymentHistory;
