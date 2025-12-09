import React from 'react';
import { Container, Typography, Box, Grid, Card, CardContent, Button, TextField } from '@mui/material';
import { Share as ShareIcon, BarChart as StatsIcon, Payment as PaymentIcon } from '@mui/icons-material';

const AffiliateSystem = () => {
  const stats = [
    { title: 'Total Referrals', value: '0', icon: <ShareIcon fontSize="large" /> },
    { title: 'Active Referrals', value: '0', icon: <StatsIcon fontSize="large" /> },
    { title: 'Total Earnings', value: '$0.00', icon: <PaymentIcon fontSize="large" /> },
  ];

  const referralLink = 'https://hills-capital.com/ref/yourusername';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    // Add toast notification here
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#ddbd22' }}>
        Affiliate Program
      </Typography>
      
      <Typography variant="h6" color="text.secondary" paragraph>
        Earn commissions by referring new traders to HILLS-CAPITAL
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={{ height: '100%', backgroundColor: '#0a0606' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ color: '#ddbd22', mb: 1 }}>{stat.icon}</Box>
                <Typography variant="h5" component="div" sx={{ color: '#ddbd22' }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Referral Section */}
      <Card sx={{ mb: 4, backgroundColor: '#0a0606' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ color: '#ddbd22' }}>
            Your Referral Link
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              fullWidth
              variant="outlined"
              value={referralLink}
              InputProps={{
                readOnly: true,
                style: { color: 'white' }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#ddbd22',
                  },
                  '&:hover fieldset': {
                    borderColor: '#ddbd22',
                  },
                },
              }}
            />
            <Button
              variant="contained"
              onClick={copyToClipboard}
              sx={{
                backgroundColor: '#ddbd22',
                color: '#0a0606',
                '&:hover': {
                  backgroundColor: '#c9a91d',
                },
              }}
            >
              Copy
            </Button>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ color: '#ddbd22', mb: 2 }}>
                  How It Works
                </Typography>
                <Box component="ol" sx={{ pl: 2, color: 'text.secondary' }}>
                  <li>Sign up for our affiliate program</li>
                  <li>Get your unique referral link</li>
                  <li>Share with potential traders</li>
                  <li>Earn commissions when they sign up and trade</li>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="h6" sx={{ color: '#ddbd22', mb: 2 }}>
                  Commission Structure
                </Typography>
                <Box component="ul" sx={{ pl: 2, color: 'text.secondary' }}>
                  <li>20% commission on subscription fees</li>
                  <li>10% commission on trading profits</li>
                  <li>Monthly payouts via PayPal or bank transfer</li>
                  <li>Minimum payout: $50</li>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Marketing Materials */}
      <Card sx={{ backgroundColor: '#0a0606' }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: '#ddbd22', mb: 3 }}>
            Marketing Materials
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ color: '#ddbd22' }}>Banner 1 (728x90)</Typography>
                <Box sx={{ border: '1px solid #333', p: 2, textAlign: 'center', bgcolor: '#111' }}>
                  <Typography variant="caption" color="text.secondary">Banner Preview</Typography>
                </Box>
                <Button size="small" sx={{ mt: 1, color: '#ddbd22' }}>Copy HTML</Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ color: '#ddbd22' }}>Banner 2 (300x250)</Typography>
                <Box sx={{ border: '1px solid #333', p: 2, textAlign: 'center', bgcolor: '#111', width: 300, height: 250, mx: 'auto' }}>
                  <Typography variant="caption" color="text.secondary">Banner Preview</Typography>
                </Box>
                <Button size="small" sx={{ mt: 1, color: '#ddbd22' }}>Copy HTML</Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AffiliateSystem;
