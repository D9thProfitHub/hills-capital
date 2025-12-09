import React from 'react';
import { Container, Typography, Box, Grid, Card, CardContent, Button, Divider, Chip } from '@mui/material';
import { Settings as SettingsIcon, Equalizer as StatsIcon, PlayArrow as StartIcon, Stop as StopIcon } from '@mui/icons-material';

const RobotsAutoPilot = () => {
  const robots = [
    {
      id: 1,
      name: 'Gold Miner Pro',
      status: 'active',
      profit: '+15.3%',
      risk: 'Medium',
      pairs: 'XAU/USD, XAG/USD',
      description: 'Specialized in precious metals trading with advanced trend analysis.',
    },
    {
      id: 2,
      name: 'Crypto Surfer',
      status: 'inactive',
      profit: '+28.7%',
      risk: 'High',
      pairs: 'BTC/USD, ETH/USD, XRP/USD',
      description: 'Designed for cryptocurrency markets with volatility-based strategies.',
    },
    {
      id: 3,
      name: 'Forex Master',
      status: 'inactive',
      profit: '+9.8%',
      risk: 'Low',
      pairs: 'EUR/USD, GBP/USD, USD/JPY',
      description: 'Conservative trading strategy for major forex pairs.',
    },
  ];

  const toggleRobot = (id) => {
    // Toggle robot status logic here
    console.log(`Toggling robot ${id}`);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#ddbd22' }}>
          Trading Robots & Auto Pilot
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Automated trading solutions to maximize your profits 24/7
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {robots.map((robot) => (
          <Grid item xs={12} md={6} lg={4} key={robot.id}>
            <Card sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              backgroundColor: '#0a0606',
              border: '1px solid #333',
              '&:hover': {
                borderColor: '#ddbd22',
              },
            }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ color: '#ddbd22' }}>
                    {robot.name}
                  </Typography>
                  <Chip 
                    label={robot.status === 'active' ? 'Active' : 'Inactive'}
                    color={robot.status === 'active' ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {robot.description}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2, borderColor: '#333' }} />

                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Profit (30d):</Typography>
                    <Typography variant="body1" sx={{ color: robot.profit.startsWith('+') ? '#4caf50' : '#f44336' }}>
                      {robot.profit}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Risk Level:</Typography>
                    <Box>
                      <Chip 
                        label={robot.risk}
                        size="small"
                        sx={{
                          bgcolor: robot.risk === 'High' ? 'error.dark' : 
                                  robot.risk === 'Medium' ? 'warning.dark' : 'success.dark',
                          color: 'white',
                          fontSize: '0.7rem',
                          height: 20,
                        }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Trading Pairs:</Typography>
                    <Typography variant="body2">{robot.pairs}</Typography>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 'auto', pt: 2, display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    startIcon={robot.status === 'active' ? <StopIcon /> : <StartIcon />}
                    fullWidth
                    onClick={() => toggleRobot(robot.id)}
                    sx={{
                      backgroundColor: robot.status === 'active' ? '#f44336' : '#4caf50',
                      '&:hover': {
                        backgroundColor: robot.status === 'active' ? '#d32f2f' : '#388e3c',
                      },
                    }}
                  >
                    {robot.status === 'active' ? 'Stop' : 'Start'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<SettingsIcon />}
                    sx={{
                      borderColor: '#ddbd22',
                      color: '#ddbd22',
                      '&:hover': {
                        borderColor: '#c9a91d',
                        backgroundColor: 'rgba(221, 189, 34, 0.1)',
                      },
                    }}
                  >
                    Settings
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ mt: 4, backgroundColor: '#0a0606' }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: '#ddbd22', mb: 2 }}>
            Performance Analytics
          </Typography>
          <Box sx={{ 
            height: 200, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            border: '1px dashed #333',
            borderRadius: 1,
          }}>
            <Typography color="text.secondary">Performance charts will be displayed here</Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default RobotsAutoPilot;
