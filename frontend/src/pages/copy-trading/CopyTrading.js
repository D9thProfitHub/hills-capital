import React, { useState } from 'react';
import { 
  Container, Typography, Box, Grid, Card, CardContent, Button, 
  Divider, Chip, Tabs, Tab, TextField, InputAdornment, Table, 
  TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from '@mui/material';
import { Search as SearchIcon, Star as StarIcon, StarBorder as StarBorderIcon } from '@mui/icons-material';

const CopyTrading = () => {
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const traders = [
    {
      id: 1,
      name: 'CryptoKing',
      profit: '+45.2%',
      followers: '2,345',
      winRate: '78%',
      risk: 'High',
      assets: 'BTC, ETH, XRP',
      isFavorite: true,
    },
    {
      id: 2,
      name: 'ForexMaster',
      profit: '+32.7%',
      followers: '1,876',
      winRate: '82%',
      risk: 'Medium',
      assets: 'EUR/USD, GBP/USD',
      isFavorite: false,
    },
    {
      id: 3,
      name: 'GoldTrader',
      profit: '+28.3%',
      followers: '1,234',
      winRate: '75%',
      risk: 'Low',
      assets: 'XAU/USD, XAG/USD',
      isFavorite: true,
    },
  ];

  const myCopies = [
    {
      id: 1,
      name: 'CryptoKing',
      amount: '$1,000',
      profit: '+$125.50',
      status: 'Active',
      started: '2 weeks ago',
    },
    {
      id: 3,
      name: 'GoldTrader',
      amount: '$500',
      profit: '+$45.20',
      status: 'Active',
      started: '1 week ago',
    },
  ];

  const toggleFavorite = (id) => {
    // Toggle favorite status logic here
    console.log(`Toggled favorite for trader ${id}`);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const filteredTraders = traders.filter(trader => 
    trader.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trader.assets.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#ddbd22' }}>
          Copy Trading
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Copy the trades of successful traders automatically
        </Typography>
      </Box>

      <Card sx={{ mb: 4, backgroundColor: '#0a0606' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          textColor="secondary"
          indicatorColor="secondary"
          sx={{ 
            '& .MuiTabs-indicator': {
              backgroundColor: '#ddbd22',
            },
            '& .Mui-selected': {
              color: '#ddbd22 !important',
            },
          }}
        >
          <Tab label="Discover Traders" />
          <Tab label="My Copies" />
          <Tab label="Performance" />
        </Tabs>
      </Card>

      {tabValue === 0 && (
        <>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <TextField
              placeholder="Search traders..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                style: { 
                  color: 'white',
                  backgroundColor: '#0a0606',
                },
                sx: {
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#444',
                    },
                    '&:hover fieldset': {
                      borderColor: '#ddbd22',
                    },
                  },
                },
              }}
              sx={{ width: 300 }}
            />
            <Box>
              <Button 
                variant="outlined" 
                sx={{ 
                  mr: 1, 
                  borderColor: '#444',
                  color: 'text.primary',
                  '&:hover': {
                    borderColor: '#ddbd22',
                  },
                }}
              >
                Filters
              </Button>
              <Button 
                variant="contained"
                sx={{
                  backgroundColor: '#ddbd22',
                  color: '#0a0606',
                  '&:hover': {
                    backgroundColor: '#c9a91d',
                  },
                }}
              >
                Copy New Trader
              </Button>
            </Box>
          </Box>

          <Grid container spacing={3}>
            {filteredTraders.map((trader) => (
              <Grid item xs={12} md={6} lg={4} key={trader.id}>
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
                        {trader.name}
                      </Typography>
                      <IconButton 
                        size="small" 
                        onClick={() => toggleFavorite(trader.id)}
                        sx={{ color: trader.isFavorite ? '#ffc107' : 'text.secondary' }}
                      >
                        {trader.isFavorite ? <StarIcon /> : <StarBorderIcon />}
                      </IconButton>
                    </Box>
                    
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Profit (30d):</Typography>
                        <Typography variant="body1" sx={{ color: trader.profit.startsWith('+') ? '#4caf50' : '#f44336' }}>
                          {trader.profit}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Win Rate:</Typography>
                        <Typography variant="body1">{trader.winRate}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Risk:</Typography>
                        <Chip 
                          label={trader.risk}
                          size="small"
                          sx={{
                            bgcolor: trader.risk === 'High' ? 'error.dark' : 
                                    trader.risk === 'Medium' ? 'warning.dark' : 'success.dark',
                            color: 'white',
                            fontSize: '0.7rem',
                            height: 20,
                          }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Followers:</Typography>
                        <Typography variant="body1">{trader.followers}</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">Assets:</Typography>
                        <Typography variant="body2">{trader.assets}</Typography>
                      </Grid>
                    </Grid>

                    <Button
                      variant="contained"
                      fullWidth
                      sx={{
                        backgroundColor: '#ddbd22',
                        color: '#0a0606',
                        mt: 2,
                        '&:hover': {
                          backgroundColor: '#c9a91d',
                        },
                      }}
                    >
                      Copy This Trader
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {tabValue === 1 && (
        <Card sx={{ backgroundColor: '#0a0606' }}>
          <CardContent>
            <TableContainer component={Paper} sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
              <Table sx={{ minWidth: 650 }} aria-label="my copies table">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#ddbd22' }}>Trader</TableCell>
                    <TableCell align="right" sx={{ color: '#ddbd22' }}>Amount</TableCell>
                    <TableCell align="right" sx={{ color: '#ddbd22' }}>Profit/Loss</TableCell>
                    <TableCell align="right" sx={{ color: '#ddbd22' }}>Status</TableCell>
                    <TableCell align="right" sx={{ color: '#ddbd22' }}>Started</TableCell>
                    <TableCell align="right" sx={{ color: '#ddbd22' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {myCopies.map((copy) => (
                    <TableRow
                      key={copy.id}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th" scope="row" sx={{ color: 'text.primary' }}>
                        {copy.name}
                      </TableCell>
                      <TableCell align="right" sx={{ color: 'text.primary' }}>{copy.amount}</TableCell>
                      <TableCell 
                        align="right" 
                        sx={{ 
                          color: copy.profit.startsWith('+') ? '#4caf50' : '#f44336',
                          fontWeight: 'bold',
                        }}
                      >
                        {copy.profit}
                      </TableCell>
                      <TableCell align="right">
                        <Chip 
                          label={copy.status} 
                          size="small" 
                          sx={{ 
                            bgcolor: copy.status === 'Active' ? 'success.dark' : 'error.dark',
                            color: 'white',
                          }}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ color: 'text.secondary' }}>{copy.started}</TableCell>
                      <TableCell align="right">
                        <Button 
                          size="small" 
                          sx={{ 
                            color: '#f44336',
                            '&:hover': {
                              backgroundColor: 'rgba(244, 67, 54, 0.1)',
                            },
                          }}
                        >
                          Stop Copy
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {tabValue === 2 && (
        <Card sx={{ p: 3, backgroundColor: '#0a0606' }}>
          <Typography variant="h6" sx={{ color: '#ddbd22', mb: 3 }}>
            Copy Trading Performance
          </Typography>
          <Box sx={{ 
            height: 400, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            border: '1px dashed #333',
            borderRadius: 1,
            mb: 3,
          }}>
            <Typography color="text.secondary">Performance charts will be displayed here</Typography>
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card sx={{ backgroundColor: '#111', p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Total Profit</Typography>
                <Typography variant="h5" sx={{ color: '#4caf50' }}>+$170.70</Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ backgroundColor: '#111', p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Active Copies</Typography>
                <Typography variant="h5">2</Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ backgroundColor: '#111', p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Win Rate</Typography>
                <Typography variant="h5">76%</Typography>
              </Card>
            </Grid>
          </Grid>
        </Card>
      )}
    </Container>
  );
};

export default CopyTrading;
