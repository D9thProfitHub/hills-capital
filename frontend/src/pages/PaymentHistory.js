import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import PaymentHistoryComponent from '../components/dashboard/sections/PaymentHistory';

const PaymentHistoryPage = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
          Payment History
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View all your payment transactions and their status
        </Typography>
      </Box>
      
      <PaymentHistoryComponent />
    </Container>
  );
};

export default PaymentHistoryPage;
