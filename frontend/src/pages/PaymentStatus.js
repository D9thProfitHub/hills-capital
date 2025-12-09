import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import PaymentStatusComponent from '../components/dashboard/sections/PaymentStatus';

const PaymentStatusPage = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
          Payment Status
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track your payment progress and status
        </Typography>
      </Box>
      
      <PaymentStatusComponent />
    </Container>
  );
};

export default PaymentStatusPage;
