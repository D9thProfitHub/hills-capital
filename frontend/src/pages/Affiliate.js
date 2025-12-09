import React from 'react';
import { Container, Typography, Box, Grid, Card, CardContent, CardMedia, Button } from '@mui/material';

const Affiliate = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Affiliate Program
      </Typography>

      <Typography variant="h6" color="text.secondary" paragraph>
        Earn commissions by referring new traders to HILLS-CAPITAL
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                How it Works
              </Typography>
              <Typography variant="body1" color="text.secondary">
                1. Sign up for our affiliate program<br />
                2. Get your unique referral link<br />
                3. Share with potential traders<br />
                4. Earn commissions when they sign up and trade
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Commission Structure
              </Typography>
              <Typography variant="body1" color="text.secondary">
                - 20% commission on subscription fees<br />
                - 10% commission on trading profits<br />
                - Monthly payouts via PayPal or bank transfer
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Button variant="contained" fullWidth>
                  Join Affiliate Program
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Affiliate;
