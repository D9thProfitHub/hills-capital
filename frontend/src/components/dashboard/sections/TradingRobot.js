import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import { SmartToy, Add, CheckCircle, Pending, Cancel } from '@mui/icons-material';
import { toast } from 'react-toastify';
import botRequestApi from '../../../services/botRequestApi';
import { useWebSocket } from '../../../context/WebSocketContext';

const TradingRobot = () => {
  const [formData, setFormData] = useState({
    botType: '',
    capital: '',
    tradingPair: '',
    riskLevel: 'medium',
    duration: '30',
    strategy: 'scalping'
  });

  // User's bot requests pulled from backend
  const [botRequests, setBotRequests] = useState([]);
  const { socket, emit } = useWebSocket();

  // Fetch existing requests on mount
  useEffect(() => {
    (async () => {
      try {
        const { data } = await botRequestApi.getMyRequests();
        setBotRequests(data?.data || []);
      } catch (err) {
        console.error('Failed to load bot requests:', err);
        toast.error(err.message || 'Failed to load bot requests');
      }
    })();
  }, []);

  const botTypes = [
    'Crypto Arbitrage',
    'Forex EA',
    'Grid Trading Bot',
    'DCA Bot',
    'Market Making Bot'
  ];

  const tradingPairs = [
    'BTC/USDT',
    'ETH/USDT',
    'EUR/USD',
    'GBP/USD',
    'XRP/USDT',
    'SOL/USDT'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Basic validation – ensure required fields are filled
      if (!formData.botType || !formData.capital || !formData.tradingPair) {
        toast.warning('Please complete required fields');
        return;
      }

      const { data } = await botRequestApi.createRequest(formData);
      const created = data?.data || {};
      // Prepend newly-created request to list
      setBotRequests(prev => [created, ...prev]);

      // Emit socket event for admin dashboard(s)
      emit('newBotRequest', created);

      // Reset form
      setFormData({
        botType: '',
        capital: '',
        tradingPair: '',
        riskLevel: 'medium',
        duration: '30',
        strategy: 'scalping'
      });

      toast.success('Trading robot request submitted');
    } catch (err) {
      console.error('Failed to submit bot request:', err);
      toast.error(err.message || 'Failed to submit request');
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'approved':
        return <Chip icon={<CheckCircle />} label="Approved" color="success" size="small" />;
      case 'pending':
        return <Chip icon={<Pending />} label="Pending" color="warning" size="small" />;
      case 'rejected':
        return <Chip icon={<Cancel />} label="Rejected" color="error" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Request Trading Robot</Typography>
      
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Bot Type</InputLabel>
                  <Select
                    name="botType"
                    value={formData.botType}
                    onChange={handleChange}
                    label="Bot Type"
                    required
                  >
                    {botTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Trading Pair</InputLabel>
                  <Select
                    name="tradingPair"
                    value={formData.tradingPair}
                    onChange={handleChange}
                    label="Trading Pair"
                    required
                  >
                    {tradingPairs.map((pair) => (
                      <MenuItem key={pair} value={pair}>
                        {pair}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Capital Amount ($)"
                  name="capital"
                  type="number"
                  value={formData.capital}
                  onChange={handleChange}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Risk Level</InputLabel>
                  <Select
                    name="riskLevel"
                    value={formData.riskLevel}
                    onChange={handleChange}
                    label="Risk Level"
                  >
                    <MenuItem value="low">Low Risk</MenuItem>
                    <MenuItem value="medium">Medium Risk</MenuItem>
                    <MenuItem value="high">High Risk</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Duration (Days)</InputLabel>
                  <Select
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    label="Duration (Days)"
                  >
                    <MenuItem value="7">7 Days</MenuItem>
                    <MenuItem value="30">30 Days</MenuItem>
                    <MenuItem value="60">60 Days</MenuItem>
                    <MenuItem value="90">90 Days</MenuItem>
                    <MenuItem value="180">180 Days</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Trading Strategy</InputLabel>
                  <Select
                    name="strategy"
                    value={formData.strategy}
                    onChange={handleChange}
                    label="Trading Strategy"
                  >
                    <MenuItem value="scalping">Scalping</MenuItem>
                    <MenuItem value="swing">Swing Trading</MenuItem>
                    <MenuItem value="trend">Trend Following</MenuItem>
                    <MenuItem value="mean-reversion">Mean Reversion</MenuItem>
                    <MenuItem value="arbitrage">Arbitrage</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<Add />}
                  fullWidth
                >
                  Submit Request
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>My Bot Requests</Typography>
          <Divider sx={{ mb: 2 }} />
          
          {botRequests.length === 0 ? (
            <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
              No bot requests found. Submit a request above to get started.
            </Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Bot Type</TableCell>
                    <TableCell>Pair</TableCell>
                    <TableCell>Capital</TableCell>
                    <TableCell>Risk</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {botRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>{request.botType}</TableCell>
                      <TableCell>{request.tradingPair}</TableCell>
                      <TableCell>${request.capital.toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip 
                          label={request.riskLevel} 
                          size="small"
                          color={
                            request.riskLevel === 'high' ? 'error' : 
                            request.riskLevel === 'medium' ? 'warning' : 'success'
                          }
                        />
                      </TableCell>
                      <TableCell>{new Date(request.date).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusChip(request.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default TradingRobot;
