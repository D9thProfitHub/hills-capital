import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField,
  InputAdornment,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  ContentCopy,
  Share,
  Email,
  Facebook,
  Twitter,
  LinkedIn,
  Link as LinkIcon,
  CheckCircle,
  PersonAdd,
  BarChart,
  MonetizationOn,
  People,
  TrendingUp
} from '@mui/icons-material';

import api from '../../../services/api';
import io from 'socket.io-client';

const Affiliate = () => {
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [affiliateData, setAffiliateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user's affiliate data from backend
  useEffect(() => {
    const fetchUserAffiliateData = async () => {
      try {
        setLoading(true);
        
        // Fetch user's affiliate info
        const affiliateResponse = await api.get('/api/users/affiliate');
        
        setAffiliateData(affiliateResponse.data.data);
        
        // Fetch user's referrals
        const referralsResponse = await api.get('/api/users/affiliate/referrals');
        
        // Referrals are now included in affiliateData
        setLoading(false);
        
      } catch (err) {
        console.error('Error fetching affiliate data:', err);
        console.error('Error response:', err.response);
        console.error('Error status:', err.response?.status);
        console.error('Error data:', err.response?.data);
        setError(`Failed to load affiliate information: ${err.response?.data?.message || err.message}`);
        setLoading(false);
      }
    };
    
    fetchUserAffiliateData();
  }, []);

  if (loading) return <LinearProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!affiliateData) return <Typography>No affiliate data found</Typography>;

  // Check if user has an active affiliate account
  const hasAffiliateAccount = affiliateData.id !== 0 && affiliateData.affiliateCode;

  // Commission history from affiliate data
  const commissionHistory = [
    {
      id: 1,
      date: affiliateData.joinedDate || new Date().toISOString().split('T')[0],
      description: hasAffiliateAccount ? 'Account Setup Bonus' : 'Affiliate account not yet activated',
      amount: 0,
      status: 'completed'
    }
  ];

  // Use affiliate link from data or show message if none
  const referralLink = hasAffiliateAccount 
    ? affiliateData.affiliateLink 
    : 'Join the affiliate program to get your referral link';
  const referrals = affiliateData.referrals || [];

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setIsLinkCopied(true);
    setTimeout(() => setIsLinkCopied(false), 2000);
  };
  
  const shareOptions = [
    { icon: <Email />, name: 'Email', color: '#EA4335' },
    { icon: <Facebook />, name: 'Facebook', color: '#4267B2' },
    { icon: <Twitter />, name: 'Twitter', color: '#1DA1F2' },
    { icon: <LinkedIn />, name: 'LinkedIn', color: '#0077B5' }
  ];
  
  const getStatusChip = (status) => {
    switch(status) {
      case 'active':
        return <Chip label="Active" color="success" size="small" />;
      case 'pending':
        return <Chip label="Pending" color="warning" size="small" />;
      case 'inactive':
        return <Chip label="Inactive" color="default" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Affiliate Program</Typography>
        <Box>
          <Button 
            variant={activeTab === 'overview' ? 'contained' : 'outlined'} 
            size="small" 
            onClick={() => setActiveTab('overview')}
            sx={{ mr: 1 }}
          >
            Overview
          </Button>
          <Button 
            variant={activeTab === 'referrals' ? 'contained' : 'outlined'} 
            size="small" 
            onClick={() => setActiveTab('referrals')}
            sx={{ mr: 1 }}
          >
            My Referrals
          </Button>
          <Button 
            variant={activeTab === 'commissions' ? 'contained' : 'outlined'} 
            size="small" 
            onClick={() => setActiveTab('commissions')}
          >
            Commissions
          </Button>
        </Box>
      </Box>
      
      {activeTab === 'overview' && (
        <>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Your Referral Link</Typography>
              <Box display="flex" alignItems="center" mb={3}>
                <TextField
                  fullWidth
                  variant="outlined"
                  value={referralLink}
                  InputProps={{
                    readOnly: true,
                    startAdornment: (
                      <InputAdornment position="start">
                        <LinkIcon />
                      </InputAdornment>
                    ),
                    sx: { pr: 1 }
                  }}
                />
                <Tooltip title={isLinkCopied ? 'Copied!' : 'Copy link'}>
                  <Button
                    variant="contained"
                    onClick={copyToClipboard}
                    startIcon={isLinkCopied ? <CheckCircle /> : <ContentCopy />}
                    sx={{ ml: 1, whiteSpace: 'nowrap' }}
                  >
                    {isLinkCopied ? 'Copied!' : 'Copy'}
                  </Button>
                </Tooltip>
              </Box>
              
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Share your link
              </Typography>
              <Box display="flex" gap={1} mb={3}>
                {shareOptions.map((option, index) => (
                  <IconButton 
                    key={index} 
                    sx={{ 
                      backgroundColor: `${option.color}15`, 
                      color: option.color,
                      '&:hover': { 
                        backgroundColor: `${option.color}25` 
                      }
                    }}
                  >
                    {option.icon}
                  </IconButton>
                ))}
              </Box>
              
              <Box display="flex" flexWrap="wrap" gap={2}>
                <Button variant="outlined" startIcon={<PersonAdd />}>
                  Invite Friends
                </Button>
                <Button variant="outlined" startIcon={<BarChart />}>
                  View Analytics
                </Button>
                <Button variant="outlined" startIcon={<MonetizationOn />}>
                  Withdraw Earnings
                </Button>
              </Box>
            </CardContent>
          </Card>
          
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6} lg={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    <MonetizationOn color="primary" sx={{ mr: 1 }} />
                    <Typography color="text.secondary">Total Earned</Typography>
                  </Box>
                  <Typography variant="h5" gutterBottom>
                    ${affiliateData.totalCommissions.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <TrendingUp color="success" sx={{ fontSize: 16, mr: 0.5 }} />
                    <Typography variant="caption" color="success.main">
                      +12.5% from last month
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6} lg={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    <MonetizationOn color="warning" sx={{ mr: 1 }} />
                    <Typography color="text.secondary">Pending Commissions</Typography>
                  </Box>
                  <Typography variant="h5" gutterBottom>
                    ${affiliateData.pendingCommissions.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Next payout: Aug 1, 2025
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6} lg={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    <People color="info" sx={{ mr: 1 }} />
                    <Typography color="text.secondary">Total Referrals</Typography>
                  </Box>
                  <Typography variant="h5" gutterBottom>
                    {affiliateData.totalReferrals}
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <People color="success" sx={{ fontSize: 16, mr: 0.5 }} />
                    <Typography variant="caption" color="success.main">
                      {affiliateData.activeReferrals} active
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6} lg={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    <TrendingUp color="secondary" sx={{ mr: 1 }} />
                    <Typography color="text.secondary">Conversion Rate</Typography>
                  </Box>
                  <Typography variant="h5" gutterBottom>
                    {affiliateData.conversionRate}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={affiliateData.conversionRate} 
                    sx={{ height: 6, borderRadius: 3 }} 
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Commission Tiers</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>Starter</Typography>
                      <Typography variant="h4" color="primary" gutterBottom>
                        10% Commission
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Earn 10% commission on all trades made by your direct referrals.
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        • 1st tier referrals
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        • Basic analytics
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        • Email support
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined" sx={{ borderColor: 'primary.main', borderWidth: 2 }}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="subtitle1">Pro</Typography>
                        <Chip label="Current" color="primary" size="small" />
                      </Box>
                      <Typography variant="h4" color="primary" gutterBottom>
                        15% Commission
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Earn 15% commission on all trades made by your direct referrals.
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        • 1st & 2nd tier referrals
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        • Advanced analytics
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        • Priority support
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>Elite</Typography>
                      <Typography variant="h4" color="primary" gutterBottom>
                        20% Commission
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Earn 20% commission on all trades made by your direct referrals.
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        • 1st, 2nd & 3rd tier referrals
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        • Premium analytics
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        • Dedicated account manager
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        • Exclusive promotions
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </>
      )}
      
      {activeTab === 'referrals' && (
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">My Referrals</Typography>
              <Button variant="contained" startIcon={<PersonAdd />}>
                Invite Friends
              </Button>
            </Box>
            
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Join Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Commission</TableCell>
                    <TableCell>Tier</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {referrals.map((referral) => (
                    <TableRow key={referral.id}>
                      <TableCell>{referral.name}</TableCell>
                      <TableCell>{referral.email}</TableCell>
                      <TableCell>
                        {new Date(referral.joinDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </TableCell>
                      <TableCell>
                        {getStatusChip(referral.status)}
                      </TableCell>
                      <TableCell>
                        ${referral.commission.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={`Tier ${referral.tier}`} 
                          size="small" 
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
      
      {activeTab === 'commissions' && (
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">Commission History</Typography>
              <Button variant="contained" startIcon={<MonetizationOn />}>
                Withdraw Earnings
              </Button>
            </Box>
            
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {commissionHistory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {new Date(item.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell align="right">
                        <Typography 
                          fontWeight="medium" 
                          color={item.status === 'paid' ? 'success.main' : 'text.primary'}
                        >
                          ${item.amount.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {item.status === 'paid' ? (
                          <Chip 
                            label="Paid" 
                            color="success" 
                            size="small"
                            variant="outlined"
                          />
                        ) : (
                          <Chip 
                            label="Pending" 
                            color="warning" 
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <Box mt={3} textAlign="center">
              <Typography variant="body2" color="text.secondary">
                Payouts are processed on the 1st of each month for the previous month's earnings.
              </Typography>
              <Button variant="text" sx={{ mt: 1 }}>
                View Full Payment History
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default Affiliate;
