import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  IconButton,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  Fab,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  PlayArrow,
  Stop,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Cancel,
  Close,
  Send
} from '@mui/icons-material';
import { signalsApi } from '../../../services/adminApi';

const SignalsManagement = () => {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [selectedSignal, setSelectedSignal] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('view');
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [closeResult, setCloseResult] = useState('win');
  const [closePips, setClosePips] = useState(0);




  useEffect(() => {
    fetchSignals();
  }, [tabValue]);

  const fetchSignals = async () => {
    try {
      setLoading(true);
      // Map tabValue to status string
      const statuses = ['all', 'pending', 'active', 'closed'];
      const status = statuses[tabValue] || 'all';
      const response = await signalsApi.getSignals(status);
      setSignals(response.data.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch signals');
      console.error('Error fetching signals:', err);
    } finally {
      setLoading(false);
    }
  };





  // No need to filter since we're already fetching by status from backend
  const filteredSignals = signals;

  const handleOpenDialog = (type, signal = null) => {
    setDialogType(type);
    setSelectedSignal(signal || {
      title: '',
      description: '',
      pair: '',
      type: 'buy',
      entryPrice: 0,
      stopLoss: 0,
      takeProfit: 0
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedSignal(null);
  };

  const handleSaveSignal = async () => {
    try {
      setLoading(true);
      if (dialogType === 'add') {
        await signalsApi.createSignal(selectedSignal);
      } else if (dialogType === 'edit') {
        await signalsApi.updateSignal(selectedSignal.id, selectedSignal);
      }
      await fetchSignals();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving signal:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSignal = async (signalId) => {
    if (window.confirm('Are you sure you want to delete this signal?')) {
      try {
        setLoading(true);
        await signalsApi.deleteSignal(signalId);
        await fetchSignals();
      } catch (error) {
        console.error('Error deleting signal:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleActivateSignal = async (signalId) => {
    try {
      setLoading(true);
      await signalsApi.activateSignal(signalId);
      await fetchSignals();
    } catch (error) {
      console.error('Error activating signal:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCloseDialog = (signal) => {
    setSelectedSignal(signal);
    setCloseResult('win');
    setClosePips(0);
    setCloseDialogOpen(true);
  };

  const handleCloseSignalSubmit = async () => {
    try {
      setLoading(true);
      await signalsApi.closeSignal(selectedSignal._id, {
        result: closeResult,
        pips: closePips
      });
      await fetchSignals();
      setCloseDialogOpen(false);
    } catch (error) {
      console.error('Error closing signal:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Signals Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog('add')}
        >
          Create New Signal
        </Button>
      </Box>

      {/* Status Filter Tabs */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label={`All (${signals.length})`} />
            <Tab label={`Pending (${signals.filter(s => s.status === 'pending').length})`} />
            <Tab label={`Active (${signals.filter(s => s.status === 'active').length})`} />
            <Tab label={`Closed (${signals.filter(s => s.status === 'closed').length})`} />
          </Tabs>
        </CardContent>
      </Card>

      {/* Signals Table */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Signal</TableCell>
                  <TableCell>Pair</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Entry Price</TableCell>
                  <TableCell>Stop Loss</TableCell>
                  <TableCell>Take Profit</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Result</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSignals.map((signal) => (
                  <TableRow key={signal.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {signal.title}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {signal.description?.substring(0, 50)}...
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {signal.pair}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={signal.type === 'buy' ? <TrendingUp /> : <TrendingDown />}
                        label={signal.type?.toUpperCase()}
                        color={signal.type === 'buy' ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{signal.entryPrice}</TableCell>
                    <TableCell>{signal.stopLoss}</TableCell>
                    <TableCell>{signal.takeProfit}</TableCell>
                    <TableCell>
                      <Chip
                        label={signal.status}
                        color={signal.status === 'pending' ? 'warning' : signal.status === 'active' ? 'info' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {signal.result ? (
                        <Box>
                          <Chip
                            label={signal.result}
                            color={signal.result === 'win' ? 'success' : 'error'}
                            size="small"
                          />
                          {signal.pips && (
                            <Typography 
                              variant="caption" 
                              display="block"
                              color={signal.pips >= 0 ? 'success.main' : 'error.main'}
                            >
                              {signal.pips >= 0 ? '+' : ''}{signal.pips} pips
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          Pending
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(signal.createdAt).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {signal.createdBy?.name || 'Admin'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog('view', signal)}
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog('edit', signal)}
                      >
                        <Edit />
                      </IconButton>
                      {signal.status === 'pending' && (
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleActivateSignal(signal.id)}
                        >
                          <Send />
                        </IconButton>
                      )}
                      {signal.status === 'active' && (
                        <IconButton
                          size="small"
                          color="warning"
                          onClick={() => handleOpenCloseDialog(signal)}
                        >
                          <Close />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteSignal(signal.id)}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Create/Edit Signal Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogType === 'add' ? 'Create New Signal' : 
           dialogType === 'edit' ? 'Edit Signal' : 'Signal Details'}
        </DialogTitle>
        <DialogContent>
          {selectedSignal && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Signal Title"
                  value={selectedSignal.title || ''}
                  onChange={(e) => setSelectedSignal({...selectedSignal, title: e.target.value})}
                  disabled={dialogType === 'view'}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={selectedSignal.description || ''}
                  onChange={(e) => setSelectedSignal({...selectedSignal, description: e.target.value})}
                  disabled={dialogType === 'view'}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Trading Pair"
                  value={selectedSignal.pair || ''}
                  onChange={(e) => setSelectedSignal({...selectedSignal, pair: e.target.value})}
                  disabled={dialogType === 'view'}
                  placeholder="e.g., EUR/USD, BTC/USDT"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth disabled={dialogType === 'view'}>
                  <InputLabel>Signal Type</InputLabel>
                  <Select
                    value={selectedSignal.type || 'buy'}
                    onChange={(e) => setSelectedSignal({...selectedSignal, type: e.target.value})}
                  >
                    <MenuItem value="buy">Buy</MenuItem>
                    <MenuItem value="sell">Sell</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Entry Price"
                  type="number"
                  value={selectedSignal.entryPrice || ''}
                  onChange={(e) => setSelectedSignal({...selectedSignal, entryPrice: Number(e.target.value)})}
                  disabled={dialogType === 'view'}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Stop Loss"
                  type="number"
                  value={selectedSignal.stopLoss || ''}
                  onChange={(e) => setSelectedSignal({...selectedSignal, stopLoss: Number(e.target.value)})}
                  disabled={dialogType === 'view'}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Take Profit"
                  type="number"
                  value={selectedSignal.takeProfit || ''}
                  onChange={(e) => setSelectedSignal({...selectedSignal, takeProfit: Number(e.target.value)})}
                  disabled={dialogType === 'view'}
                />
              </Grid>
              {dialogType === 'view' && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Status"
                      value={selectedSignal.status || ''}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Created By"
                      value={selectedSignal.createdBy?.name || 'Admin'}
                      disabled
                    />
                  </Grid>
                  {selectedSignal.result && (
                    <>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Result"
                          value={selectedSignal.result}
                          disabled
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Pips"
                          value={selectedSignal.pips || ''}
                          disabled
                          InputProps={{
                            endAdornment: <InputAdornment position="end">pips</InputAdornment>,
                          }}
                        />
                      </Grid>
                    </>
                  )}
                </>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            {dialogType === 'view' ? 'Close' : 'Cancel'}
          </Button>
          {dialogType !== 'view' && (
            <Button onClick={handleSaveSignal} variant="contained">
              {dialogType === 'add' ? 'Create Signal' : 'Save Changes'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Close Signal Dialog */}
      <Dialog open={closeDialogOpen} onClose={() => setCloseDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Close Signal</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Result</InputLabel>
                <Select
                  value={closeResult}
                  onChange={(e) => setCloseResult(e.target.value)}
                >
                  <MenuItem value="win">Win</MenuItem>
                  <MenuItem value="loss">Loss</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Pips"
                type="number"
                value={closePips}
                onChange={(e) => setClosePips(Number(e.target.value))}
                InputProps={{
                  endAdornment: <InputAdornment position="end">pips</InputAdornment>,
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCloseDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCloseSignalSubmit} variant="contained">
            Close Signal
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SignalsManagement;
