import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Badge,
  Avatar,
  Switch,
  FormControlLabel,
  LinearProgress,
  InputAdornment
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Share,
  AttachMoney,
  People,
  TrendingUp,
  Link,
  ContentCopy
} from '@mui/icons-material';

const AffiliateManagement = () => {
  const [affiliates, setAffiliates] = useState([]);
  const [payoutRequests, setPayoutRequests] = useState([]);
  const [filteredAffiliates, setFilteredAffiliates] = useState([]);
  const [commissionSettings, setCommissionSettings] = useState({
    defaultCommissionRate: 0,
    tierRates: {
      Bronze: 0,
      Silver: 0,
      Gold: 0,
      Platinum: 0
    },
    minimumPayout: 0,
    cookieDuration: 0,
    payoutSchedule: 'monthly'
  });
  const [selectedAffiliate, setSelectedAffiliate] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('view'); // 'view', 'edit'
  const [statusFilter, setStatusFilter] = useState('all');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchAffiliates();
    fetchCommissionSettings();
    fetchPayoutRequests();
  }, []);

  useEffect(() => {
    filterAffiliates();
  }, [affiliates, statusFilter]);

  const fetchAffiliates = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://api.hillscapitaltrade.com/api/admin/affiliates', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch affiliates');
      const data = await res.json();
      setAffiliates(data.data || []);
    } catch (error) {
      console.error('Error fetching affiliates:', error);
    }
  };

  const fetchPayoutRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://api.hillscapitaltrade.com/api/admin/affiliate-payouts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch payout requests');
      const data = await res.json();
      setPayoutRequests(data.data || []);
    } catch (error) {
      console.error('Error fetching payout requests:', error);
    }
  };

  const handlePayoutAction = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://api.hillscapitaltrade.com/api/admin/affiliate-payouts/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Failed to update payout status');
      // update local state
      setPayoutRequests(prev => prev.map(req => req.id === id ? { ...req, status } : req));
    } catch (error) {
      console.error('Error updating payout status:', error);
    }
  };

  const fetchCommissionSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://api.hillscapitaltrade.com/api/admin/affiliate-settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch commission settings');
      const data = await res.json();
      setCommissionSettings(data.data || {});
    } catch (error) {
      console.error('Error fetching commission settings:', error);
    }
  };

  const saveCommissionSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://api.hillscapitaltrade.com/api/admin/affiliate-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(commissionSettings)
      });
      if (!res.ok) throw new Error('Failed to save commission settings');
      const data = await res.json();
      setCommissionSettings(data.data || commissionSettings);
      setSettingsDialogOpen(false);
      console.log('Commission settings saved successfully');
    } catch (error) {
      console.error('Error saving commission settings:', error);
    }
  };

  const filterAffiliates = () => {
    if (statusFilter === 'all') {
      setFilteredAffiliates(affiliates);
    } else {
      setFilteredAffiliates(affiliates.filter(affiliate => affiliate.status === statusFilter));
    }
  };

  const handleViewAffiliate = (affiliate) => {
    setSelectedAffiliate(affiliate);
    setDialogType('view');
    setDialogOpen(true);
  };

  const handleEditAffiliate = (affiliate) => {
    setSelectedAffiliate(affiliate);
    setDialogType('edit');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedAffiliate(null);
  };

  const handleSaveAffiliate = async () => {
    try {
      setAffiliates(affiliates.map(affiliate => 
        affiliate.id === selectedAffiliate.id ? selectedAffiliate : affiliate
      ));
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving affiliate:', error);
    }
  };

  const handleUpdateStatus = async (affiliateId, newStatus) => {
    try {
      setAffiliates(affiliates.map(affiliate => 
        affiliate.id === affiliateId 
          ? { ...affiliate, status: newStatus }
          : affiliate
      ));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handlePayCommissions = async (affiliateId) => {
    try {
      setAffiliates(affiliates.map(affiliate => 
        affiliate.id === affiliateId 
          ? { 
              ...affiliate, 
              paidCommissions: affiliate.paidCommissions + affiliate.pendingCommissions,
              pendingCommissions: 0
            }
          : affiliate
      ));
    } catch (error) {
      console.error('Error paying commissions:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'suspended': return 'error';
      case 'inactive': return 'default';
      default: return 'default';
    }
  };

  const getTierColor = (tier) => {
    switch (tier.toLowerCase()) {
      case 'bronze': return '#CD7F32';
      case 'silver': return '#C0C0C0';
      case 'gold': return '#FFD700';
      case 'platinum': return '#E5E4E2';
      default: return 'default';
    }
  };

  const getAffiliateCounts = () => {
    return {
      all: affiliates.length,
      active: affiliates.filter(a => a.status === 'active').length,
      pending: affiliates.filter(a => a.status === 'pending').length,
      suspended: affiliates.filter(a => a.status === 'suspended').length
    };
  };

  const counts = getAffiliateCounts();

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Affiliate Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setSettingsDialogOpen(true)}
        >
          Commission Settings
        </Button>
      </Box>

      {/* Status Filter Tabs */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => {
              setTabValue(newValue);
              const statuses = ['all', 'active', 'pending', 'suspended'];
              setStatusFilter(statuses[newValue]);
            }}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab 
              label={
                <Badge badgeContent={counts.all} color="primary">
                  All Affiliates
                </Badge>
              } 
            />
            <Tab 
              label={
                <Badge badgeContent={counts.active} color="success">
                  Active
                </Badge>
              } 
            />
            <Tab 
              label={
                <Badge badgeContent={counts.pending} color="warning">
                  Pending
                </Badge>
              } 
            />
            <Tab 
              label={
                <Badge badgeContent={counts.suspended} color="error">
                  Suspended
                </Badge>
              } 
            />
          </Tabs>
        </CardContent>
      </Card>

      {/* Affiliates Table */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Affiliate</TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell>Affiliate Link</TableCell>
                  <TableCell>Tier</TableCell>
                  <TableCell>Referrals</TableCell>
                  <TableCell>Conversion Rate</TableCell>
                  <TableCell>Total Commissions</TableCell>
                  <TableCell>Pending</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Activity</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAffiliates.map((affiliate) => (
                  <TableRow key={affiliate.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {affiliate.userName.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {affiliate.userName}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {affiliate.userEmail}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Typography variant="body2" fontWeight="bold" sx={{ mr: 1 }}>
                          {affiliate.affiliateCode}
                        </Typography>
                        <IconButton size="small">
                          <ContentCopy fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            mr: 1, 
                            maxWidth: '200px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {affiliate.affiliateLink}
                        </Typography>
                        <IconButton 
                          size="small" 
                          onClick={() => navigator.clipboard.writeText(affiliate.affiliateLink)}
                          title="Copy affiliate link"
                        >
                          <ContentCopy fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={affiliate.tier}
                        sx={{ 
                          bgcolor: getTierColor(affiliate.tier),
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {affiliate.totalReferrals} total
                        </Typography>
                        <Typography variant="caption" color="success.main">
                          {affiliate.activeReferrals} active
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          {affiliate.conversionRate}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={affiliate.conversionRate}
                          sx={{ width: 50, height: 6 }}
                          color={affiliate.conversionRate >= 70 ? 'success' : 'warning'}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold" color="success.main">
                        ${affiliate.totalCommissions.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        fontWeight="bold"
                        color={affiliate.pendingCommissions > 0 ? 'warning.main' : 'text.secondary'}
                      >
                        ${affiliate.pendingCommissions.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={affiliate.status}
                        color={getStatusColor(affiliate.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{affiliate.lastActivity}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleViewAffiliate(affiliate)}
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleEditAffiliate(affiliate)}
                      >
                        <Edit />
                      </IconButton>
                      {affiliate.status === 'pending' && (
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() => handleUpdateStatus(affiliate.id, 'active')}
                        >
                          Approve
                        </Button>
                      )}
                      {affiliate.pendingCommissions > 0 && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          onClick={() => handlePayCommissions(affiliate.id)}
                        >
                          Pay
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Payout Requests Section */}
      <Box mt={5}>
        <Typography variant="h5" gutterBottom>Payout Requests</Typography>
        <Card>
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Request ID</TableCell>
                    <TableCell>Affiliate</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Requested At</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(payoutRequests || []).map((req) => (
                    <TableRow key={req.id}>
                      <TableCell>{req.id}</TableCell>
                      <TableCell>{req.affiliateName}</TableCell>
                      <TableCell>${req.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Chip label={req.status} color={req.status === 'pending' ? 'warning' : req.status === 'approved' ? 'success' : 'error'} size="small" />
                      </TableCell>
                      <TableCell>{new Date(req.requestedAt).toLocaleString()}</TableCell>
                      <TableCell>
                        {req.status === 'pending' && (
                          <>
                            <Button size="small" color="success" variant="contained" sx={{ mr: 1 }} onClick={() => handlePayoutAction(req.id, 'approved')}>Approve</Button>
                            <Button size="small" color="error" variant="outlined" onClick={() => handlePayoutAction(req.id, 'rejected')}>Reject</Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>

      {/* Affiliate Details Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogType === 'edit' ? 'Edit Affiliate' : 'Affiliate Details'}
        </DialogTitle>
        <DialogContent>
          {selectedAffiliate && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Name"
                  value={selectedAffiliate.userName}
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  value={selectedAffiliate.userEmail}
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Affiliate Code"
                  value={selectedAffiliate.affiliateCode}
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth disabled={dialogType === 'view'}>
                  <InputLabel>Tier</InputLabel>
                  <Select
                    value={selectedAffiliate.tier}
                    onChange={(e) => setSelectedAffiliate({...selectedAffiliate, tier: e.target.value})}
                  >
                    <MenuItem value="Bronze">Bronze</MenuItem>
                    <MenuItem value="Silver">Silver</MenuItem>
                    <MenuItem value="Gold">Gold</MenuItem>
                    <MenuItem value="Platinum">Platinum</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth disabled={dialogType === 'view'}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={selectedAffiliate.status}
                    onChange={(e) => setSelectedAffiliate({...selectedAffiliate, status: e.target.value})}
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="suspended">Suspended</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Join Date"
                  value={selectedAffiliate.joinDate}
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Total Referrals"
                  value={selectedAffiliate.totalReferrals}
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Active Referrals"
                  value={selectedAffiliate.activeReferrals}
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Conversion Rate"
                  value={`${selectedAffiliate.conversionRate}%`}
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Total Commissions"
                  value={`$${selectedAffiliate.totalCommissions.toFixed(2)}`}
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Pending Commissions"
                  value={`$${selectedAffiliate.pendingCommissions.toFixed(2)}`}
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Paid Commissions"
                  value={`$${selectedAffiliate.paidCommissions.toFixed(2)}`}
                  disabled
                />
              </Grid>
              {selectedAffiliate.suspensionReason && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Suspension Reason"
                    value={selectedAffiliate.suspensionReason}
                    disabled={dialogType === 'view'}
                    onChange={(e) => setSelectedAffiliate({...selectedAffiliate, suspensionReason: e.target.value})}
                  />
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            {dialogType === 'view' ? 'Close' : 'Cancel'}
          </Button>
          {dialogType === 'edit' && (
            <Button onClick={handleSaveAffiliate} variant="contained">
              Save Changes
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Commission Settings Dialog */}
      <Dialog open={settingsDialogOpen} onClose={() => setSettingsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Commission Settings</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Default Commission Rate"
                type="number"
                value={commissionSettings.defaultCommissionRate}
                onChange={(e) => setCommissionSettings({
                  ...commissionSettings, 
                  defaultCommissionRate: Number(e.target.value)
                })}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Bronze Tier Rate"
                type="number"
                value={commissionSettings.tierRates?.Bronze || 0}
                onChange={(e) => setCommissionSettings({
                  ...commissionSettings,
                  tierRates: {
                    ...commissionSettings.tierRates,
                    Bronze: Number(e.target.value)
                  }
                })}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Silver Tier Rate"
                type="number"
                value={commissionSettings.tierRates?.Silver || 0}
                onChange={(e) => setCommissionSettings({
                  ...commissionSettings,
                  tierRates: {
                    ...commissionSettings.tierRates,
                    Silver: Number(e.target.value)
                  }
                })}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Gold Tier Rate"
                type="number"
                value={commissionSettings.tierRates?.Gold || 0}
                onChange={(e) => setCommissionSettings({
                  ...commissionSettings,
                  tierRates: {
                    ...commissionSettings.tierRates,
                    Gold: Number(e.target.value)
                  }
                })}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Platinum Tier Rate"
                type="number"
                value={commissionSettings.tierRates?.Platinum || 0}
                onChange={(e) => setCommissionSettings({
                  ...commissionSettings,
                  tierRates: {
                    ...commissionSettings.tierRates,
                    Platinum: Number(e.target.value)
                  }
                })}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Minimum Payout"
                type="number"
                value={commissionSettings.minimumPayout}
                onChange={(e) => setCommissionSettings({
                  ...commissionSettings, 
                  minimumPayout: Number(e.target.value)
                })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Cookie Duration"
                type="number"
                value={commissionSettings.cookieDuration}
                onChange={(e) => setCommissionSettings({
                  ...commissionSettings, 
                  cookieDuration: Number(e.target.value)
                })}
                InputProps={{
                  endAdornment: <InputAdornment position="end">days</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Payout Schedule</InputLabel>
                <Select
                  value={commissionSettings.payoutSchedule}
                  label="Payout Schedule"
                  onChange={(e) => setCommissionSettings({
                    ...commissionSettings, 
                    payoutSchedule: e.target.value
                  })}
                >
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="quarterly">Quarterly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveCommissionSettings}>Save Settings</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AffiliateManagement;
