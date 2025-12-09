import React, { useState } from 'react';
import { 
  Container, Typography, Box, Grid, Card, CardContent, Button, 
  Divider, Chip, Tabs, Tab, TextField, InputAdornment, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Menu, MenuItem, Badge
} from '@mui/material';
import { 
  FilterList as FilterIcon, 
  NotificationsNone as NotificationsIcon,
  MoreVert as MoreIcon,
  CheckCircleOutline as CheckCircleIcon,
  ErrorOutline as ErrorIcon,
  AccessTime as PendingIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

const SignalRoom = () => {
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const open = Boolean(anchorEl);

  const signals = [
    {
      id: 1,
      pair: 'BTC/USD',
      type: 'BUY',
      entry: '42,356.20',
      takeProfit: '43,500.00',
      stopLoss: '41,800.00',
      status: 'active',
      time: '2 min ago',
      risk: 'Medium',
    },
    {
      id: 2,
      pair: 'EUR/USD',
      type: 'SELL',
      entry: '1.1850',
      takeProfit: '1.1800',
      stopLoss: '1.1900',
      status: 'hit_tp',
      time: '1 hour ago',
      risk: 'Low',
    },
    {
      id: 3,
      pair: 'XAU/USD',
      type: 'BUY',
      entry: '1,834.50',
      takeProfit: '1,850.00',
      stopLoss: '1,820.00',
      status: 'hit_sl',
      time: '5 hours ago',
      risk: 'High',
    },
  ];

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleFilterClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = (filter) => {
    setAnchorEl(null);
    if (filter) {
      setActiveFilter(filter);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <PendingIcon color="warning" fontSize="small" />;
      case 'hit_tp':
        return <CheckCircleIcon color="success" fontSize="small" />;
      case 'hit_sl':
        return <ErrorIcon color="error" fontSize="small" />;
      default:
        return null;
    }
  };

  const getRiskColor = (risk) => {
    switch (risk.toLowerCase()) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#ddbd22' }}>
            Signal Room
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Real-time trading signals from our expert analysts
          </Typography>
        </Box>
        <Box>
          <Button 
            variant="contained"
            startIcon={<RefreshIcon />}
            sx={{
              mr: 2,
              backgroundColor: '#0a0606',
              color: '#ddbd22',
              '&:hover': {
                backgroundColor: '#111',
              },
            }}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={handleFilterClick}
            sx={{
              borderColor: '#444',
              color: 'text.primary',
              '&:hover': {
                borderColor: '#ddbd22',
              },
            }}
          >
            {activeFilter}
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={() => handleFilterClose(null)}
            PaperProps={{
              style: {
                backgroundColor: '#1a1a1a',
                color: 'white',
              },
            }}
          >
            {['All', 'Active', 'Forex', 'Crypto', 'Commodities'].map((filter) => (
              <MenuItem 
                key={filter} 
                onClick={() => handleFilterClose(filter)}
                sx={{
                  '&:hover': {
                    backgroundColor: '#333',
                  },
                  backgroundColor: activeFilter === filter ? '#333' : 'transparent',
                }}
              >
                {filter}
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ backgroundColor: '#0a0606', mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ color: '#ddbd22' }}>
                  Live Signals
                </Typography>
                <Box>
                  <Chip 
                    label="Live" 
                    color="error" 
                    size="small" 
                    sx={{ 
                      mr: 1, 
                      '& .MuiChip-label': { 
                        animation: 'blink 1.5s infinite',
                        '@keyframes blink': {
                          '0%': { opacity: 1 },
                          '50%': { opacity: 0.3 },
                          '100%': { opacity: 1 },
                        },
                      },
                    }} 
                  />
                  <Typography variant="caption" color="text.secondary">
                    Updates every 30 seconds
                  </Typography>
                </Box>
              </Box>
              
              <TableContainer component={Paper} sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
                <Table sx={{ minWidth: 650 }} aria-label="signals table">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: '#ddbd22' }}>Pair</TableCell>
                      <TableCell align="center" sx={{ color: '#ddbd22' }}>Signal</TableCell>
                      <TableCell align="right" sx={{ color: '#ddbd22' }}>Entry</TableCell>
                      <TableCell align="right" sx={{ color: '#ddbd22' }}>Take Profit</TableCell>
                      <TableCell align="right" sx={{ color: '#ddbd22' }}>Stop Loss</TableCell>
                      <TableCell align="right" sx={{ color: '#ddbd22' }}>Status</TableCell>
                      <TableCell align="right" sx={{ color: '#ddbd22' }}>Time</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {signals.map((signal) => (
                      <TableRow
                        key={signal.id}
                        sx={{ 
                          '&:last-child td, &:last-child th': { border: 0 },
                          '&:hover': {
                            backgroundColor: 'rgba(221, 189, 34, 0.05)',
                          },
                        }}
                      >
                        <TableCell component="th" scope="row" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
                          {signal.pair}
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={signal.type}
                            size="small"
                            sx={{
                              bgcolor: signal.type === 'BUY' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
                              color: signal.type === 'BUY' ? '#4caf50' : '#f44336',
                              fontWeight: 'bold',
                              width: 60,
                            }}
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ color: 'text.primary' }}>{signal.entry}</TableCell>
                        <TableCell align="right" sx={{ color: '#4caf50' }}>{signal.takeProfit}</TableCell>
                        <TableCell align="right" sx={{ color: '#f44336' }}>{signal.stopLoss}</TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            {getStatusIcon(signal.status)}
                            <Chip 
                              label={signal.risk}
                              size="small"
                              sx={{
                                ml: 1,
                                bgcolor: `${getRiskColor(signal.risk)}.dark`,
                                color: 'white',
                                fontSize: '0.7rem',
                                height: 20,
                              }}
                            />
                          </Box>
                        </TableCell>
                        <TableCell align="right" sx={{ color: 'text.secondary' }}>{signal.time}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ backgroundColor: '#0a0606', mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ color: '#ddbd22' }}>
                  Signal Statistics
                </Typography>
                <IconButton size="small" sx={{ color: 'text.secondary' }}>
                  <MoreIcon />
                </IconButton>
              </Box>
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Card sx={{ backgroundColor: '#111', p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ color: '#4caf50' }}>78%</Typography>
                    <Typography variant="caption" color="text.secondary">Win Rate</Typography>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card sx={{ backgroundColor: '#111', p: 2, textAlign: 'center' }}>
                    <Typography variant="h4">3.2</Typography>
                    <Typography variant="caption" color="text.secondary">Avg. Risk/Reward</Typography>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card sx={{ backgroundColor: '#111', p: 2, textAlign: 'center' }}>
                    <Typography variant="h4">24</Typography>
                    <Typography variant="caption" color="text.secondary">Signals This Week</Typography>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card sx={{ backgroundColor: '#111', p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ color: '#4caf50' }}>+15.8%</Typography>
                    <Typography variant="caption" color="text.secondary">Avg. Monthly Return</Typography>
                  </Card>
                </Grid>
              </Grid>

              <Button
                variant="contained"
                fullWidth
                sx={{
                  backgroundColor: '#ddbd22',
                  color: '#0a0606',
                  '&:hover': {
                    backgroundColor: '#c9a91d',
                  },
                }}
              >
                Subscribe to Signals
              </Button>
            </CardContent>
          </Card>

          <Card sx={{ backgroundColor: '#0a0606' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ color: '#ddbd22' }}>
                  Recent Activity
                </Typography>
                <IconButton size="small" sx={{ color: 'text.secondary' }}>
                  <MoreIcon />
                </IconButton>
              </Box>
              
              <Box sx={{ maxHeight: 300, overflowY: 'auto', pr: 1 }}>
                {[
                  'New signal: BUY BTC/USD at 42,356.20',
                  'Take profit hit on EUR/USD SELL at 1.1800',
                  'New signal: BUY XAU/USD at 1,834.50',
                  'Stop loss hit on XAU/USD at 1,820.00',
                  'New signal: SELL EUR/USD at 1.1850',
                ].map((activity, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      mb: 2, 
                      pb: 2, 
                      borderBottom: index < 4 ? '1px solid #333' : 'none',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <Box sx={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: '50%', 
                        backgroundColor: index < 2 ? '#4caf50' : '#f44336',
                        mt: 1,
                        mr: 1.5,
                      }} />
                      <Box>
                        <Typography variant="body2" color="text.primary">
                          {activity}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {index === 0 ? '2 min ago' : 
                           index === 1 ? '1 hour ago' : 
                           index === 2 ? '5 hours ago' : '1 day ago'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SignalRoom;
