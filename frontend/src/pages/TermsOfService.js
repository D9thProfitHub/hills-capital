import React from 'react';
import { Container, Typography, Box, Paper, Divider } from '@mui/material';
import { Link } from 'react-router-dom';

const TermsOfService = () => {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper elevation={3} sx={{ p: { xs: 3, md: 6 }, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 4, color: 'primary.main' }}>
          Terms and Conditions
        </Typography>
        
        <Typography variant="body1" paragraph>
          Last Updated: {new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mb: 2, mt: 4 }}>
            1. Subscription and Payment
          </Typography>
          <Typography variant="body1" paragraph>
            Subscription must be paid in full before your account is connected to Hills Capital AI, receive any trading tool, or use any of our paid services.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mb: 2 }}>
            2. Risk Acknowledgment
          </Typography>
          <Typography variant="body1" paragraph>
            Trading the global financial market is not suitable for all persons based on personalities and health status, as past results do not guarantee future performance and/or results.
          </Typography>
          <Typography variant="body1" paragraph>
            Note that trading the global financial market is risky as one can lose part or all capital, so proceed only if you are willing to take the risk.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mb: 2 }}>
            3. Limitation of Liability
          </Typography>
          <Typography variant="body1" paragraph>
            We do not and will not take responsibility for any loss when you use our trading tools as they are only tools to help in your analysis (indicators) and/or trade for you when they are Expert Advisors.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mb: 2 }}>
            4. Investment Purpose
          </Typography>
          <Typography variant="body1" paragraph>
            Investment is not the ultimate goal of Hills Capital; however, it is used as a measure to introduce more people to the company as our aim is to create an extra or alternative source of income to alleviate the sum of people's expenditure.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mb: 2 }}>
            5. Payment and Withdrawal
          </Typography>
          <Typography variant="body1" paragraph>
            Your method of funding becomes your default method of withdrawal. For example, if you fund via cryptocurrency, withdrawal must be done via the crypto link provided by you. If you fund via payment agent or fiat, you may only withdraw through payment agent or fiat.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mb: 2 }}>
            6. Third-Party Payments
          </Typography>
          <Typography variant="body1" paragraph>
            Hills Capital is not affiliated with any payment agents. Customers deal with payment agents at their sole risk. Customers are advised to make payments themselves directly to the account or cryptocurrency link provided.
          </Typography>
          <Typography variant="body1" paragraph>
            Hills Capital does not deal with third-party payments.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mb: 2 }}>
            7. Account Management
          </Typography>
          <Typography variant="body1" paragraph>
            You can open an account with our recommended broker using the link we will provide you, fund the account, and only give Hills Capital the login details to connect your account to our trading AI. By doing so, Hills Capital does not have direct access to your funds as only you can withdraw your funds.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Typography variant="body2" color="text.secondary">
          By using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use our services.
        </Typography>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Typography color="primary" sx={{ '&:hover': { textDecoration: 'underline' } }}>
              Back to Home
            </Typography>
          </Link>
        </Box>
      </Paper>
    </Container>
  );
};

export default TermsOfService;
