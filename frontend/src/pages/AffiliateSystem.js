import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  TextField, 
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  LinearProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  AccountBalanceWallet as WalletIcon,
  Share as ShareIcon,
  GroupAdd as GroupAddIcon,
  MonetizationOn as MonetizationOnIcon,
  CardGiftcard as GiftIcon,
  ContentCopy as ContentCopyIcon,
  CheckCircle as CheckCircleIcon,
  LocalAtm as LocalAtmIcon,
  Timeline as TimelineIcon,
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  EmojiEvents as EmojiEventsIcon
} from '@mui/icons-material';

const AffiliateSystem = () => {
  const [tabValue, setTabValue] = useState(0);
  const [copied, setCopied] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  
  // Mock data - in a real app, this would come from your API
  const userStats = {
    referralLink: 'https://hillscapital.com/ref/abc123',
    totalEarnings: 1250.75,
    availableBalance: 850.25,
    totalReferrals: 42,
    level1Referrals: 15,
    level2Referrals: 18,
    level3Referrals: 9,
    monthlyEarnings: 425.50,
    conversionRate: '3.2%',
    rank: 'Gold',
    nextRank: 'Platinum',
    progressToNextRank: 65,
    rewardsUnlocked: 2,
    totalRewards: 5
  };

  const commissionRates = [
    { level: 'Level 0 (You)', firstSubscription: '2.5%', resubscription: '2.5%' },
    { level: 'Level 1 (Your Direct Referrals)', firstSubscription: '2.5%', resubscription: '2.5%' },
    { level: 'Level 2 (Their Referrals)', firstSubscription: '5%', resubscription: '2.5%' },
    { level: 'Level 3 (Their Referrals)', firstSubscription: '50%', resubscription: '2.5%' }
  ];

  const rewards = [
    { id: 1, name: '50 Direct Referrals', description: 'All-expense paid trip abroad for 10 days', unlocked: true },
    { id: 2, name: 'Top Affiliate of the Month', description: 'Featured on our leaderboard', unlocked: true },
    { id: 3, name: '100 Direct Referrals', description: 'Premium trading tools package', unlocked: false },
    { id: 4, name: 'Affiliate of the Year', description: 'Brand new car', unlocked: false },
    { id: 5, name: '250+ Direct Referrals', description: 'VIP all-inclusive vacation package', unlocked: false }
  ];

  const recentCommissions = [
    { id: 1, date: '2023-06-15', user: 'John D.', level: 1, amount: 125.00, status: 'Paid' },
    { id: 2, date: '2023-06-14', user: 'Sarah M.', level: 1, amount: 87.50, status: 'Paid' },
    { id: 3, date: '2023-06-14', user: 'Mike R.', level: 2, amount: 12.50, status: 'Pending' },
    { id: 4, date: '2023-06-13', user: 'Alex K.', level: 1, amount: 62.50, status: 'Paid' },
    { id: 5, date: '2023-06-12', user: 'Emma L.', level: 3, amount: 6.25, status: 'Paid' }
  ];

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(userStats.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWithdraw = (e) => {
    e.preventDefault();
    // Handle withdrawal request
    console.log('Withdrawal requested:', withdrawAmount);
    alert('Withdrawal request submitted successfully!');
    setWithdrawAmount('');
  };

  const stats = [
    { label: 'Total Earnings', value: `$${userStats.totalEarnings.toFixed(2)}`, icon: <MonetizationOnIcon color="primary" /> },
    { label: 'Available Balance', value: `$${userStats.availableBalance.toFixed(2)}`, icon: <WalletIcon color="primary" /> },
    { label: 'Total Referrals', value: userStats.totalReferrals, icon: <PeopleIcon color="primary" /> },
    { label: 'Monthly Earnings', value: `$${userStats.monthlyEarnings.toFixed(2)}`, icon: <TimelineIcon color="primary" /> }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box textAlign="center" mb={6}>
        <Typography variant="h3" component="h1" gutterBottom>
          Affiliate Program
        </Typography>
        <Typography variant="h6" color="text.secondary" maxWidth="800px" mx="auto">
          Earn generous commissions by referring traders to Hills Capital. Get up to 50% commission on first-time subscriptions and 2.5% on renewals.
        </Typography>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper elevation={0} sx={{ p: 3, height: '100%', bgcolor: 'background.paper', borderRadius: 2 }}>
              <Box display="flex" alignItems="center">
                <Box mr={2}>
                  {stat.icon}
                </Box>
                <Box>
                  <Typography variant="h6" color="primary" fontWeight="bold">
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={4}>
        {/* Left Column */}
        <Grid item xs={12} md={8}>
          {/* Referral Link */}
          <Card elevation={0} sx={{ mb: 4, bgcolor: 'background.paper', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Your Referral Link
              </Typography>
              <Box display="flex" alignItems="center" mt={2}>
                <TextField
                  fullWidth
                  variant="outlined"
                  value={userStats.referralLink}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={copyToClipboard}
                          color={copied ? 'success' : 'primary'}
                          edge="end"
                        >
                          {copied ? <CheckCircleIcon /> : <ContentCopyIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<ShareIcon />}
                  sx={{ ml: 2, whiteSpace: 'nowrap' }}
                >
                  Share
                </Button>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                <CheckCircleIcon color="success" fontSize="small" sx={{ mr: 0.5 }} />
                {copied ? 'Copied to clipboard!' : 'Click to copy your unique referral link'}
              </Typography>
            </CardContent>
          </Card>

          {/* Commission Structure */}
          <Card elevation={0} sx={{ mb: 4, bgcolor: 'background.paper', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Commission Structure
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Level</TableCell>
                      <TableCell align="right">First Subscription</TableCell>
                      <TableCell align="right">Resubscription</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {commissionRates.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell component="th" scope="row">
                          {row.level}
                        </TableCell>
                        <TableCell align="right">{row.firstSubscription}</TableCell>
                        <TableCell align="right">{row.resubscription}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Recent Commissions */}
          <Card elevation={0} sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Commissions
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell align="right">Level</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell align="right">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentCommissions.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{row.date}</TableCell>
                        <TableCell>{row.user}</TableCell>
                        <TableCell align="right">L{row.level}</TableCell>
                        <TableCell align="right">${row.amount.toFixed(2)}</TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={row.status} 
                            size="small" 
                            color={row.status === 'Paid' ? 'success' : 'warning'}
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
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={4}>
          {/* Withdraw Funds */}
          <Card elevation={0} sx={{ mb: 4, bgcolor: 'background.paper', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Withdraw Earnings
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Available Balance: <strong>${userStats.availableBalance.toFixed(2)}</strong>
              </Typography>
              <form onSubmit={handleWithdraw}>
                <TextField
                  fullWidth
                  type="number"
                  label="Amount to withdraw"
                  variant="outlined"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  margin="normal"
                  required
                />
                <FormControl fullWidth margin="normal">
                  <InputLabel>Payment Method</InputLabel>
                  <Select
                    defaultValue="trc20"
                    required
                  >
                    <MenuItem value="trc20">TRC20 (USDT)</MenuItem>
                    <MenuItem value="erc20" disabled>ERC20 (Coming Soon)</MenuItem>
                    <MenuItem value="bank" disabled>Bank Transfer (Coming Soon)</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="TRC20 Wallet Address"
                  variant="outlined"
                  margin="normal"
                  required
                  placeholder="e.g., TYsgUJihgU6shvcWpAVwzySJqvmXTqoXVa"
                />
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary" 
                  fullWidth 
                  sx={{ mt: 2 }}
                  disabled={userStats.availableBalance <= 0}
                >
                  Request Withdrawal
                </Button>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                  Minimum withdrawal: $50.00 | Processing time: 1-3 business days
                </Typography>
              </form>
            </CardContent>
          </Card>

          {/* Rank & Progress */}
          <Card elevation={0} sx={{ mb: 4, bgcolor: 'background.paper', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Your Rank
              </Typography>
              <Box display="flex" alignItems="center" mb={2}>
                <Chip 
                  label={userStats.rank} 
                  color="primary" 
                  variant="outlined"
                  size="small"
                  sx={{ mr: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Next: {userStats.nextRank}
                </Typography>
              </Box>
              <Box sx={{ width: '100%', mb: 1 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={userStats.progressToNextRank} 
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              <Typography variant="caption" color="text.secondary">
                {userStats.progressToNextRank}% to {userStats.nextRank} Rank
              </Typography>
            </CardContent>
          </Card>

          {/* Rewards & Bonuses */}
          <Card elevation={0} sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Rewards & Bonuses</Typography>
                <Chip 
                  label={`${userStats.rewardsUnlocked}/${userStats.totalRewards} unlocked`} 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                />
              </Box>
              <List dense>
                {rewards.map((reward) => (
                  <ListItem 
                    key={reward.id} 
                    disableGutters
                    sx={{
                      opacity: reward.unlocked ? 1 : 0.6,
                      mb: 1
                    }}
                  >
                    <ListItemIcon>
                      {reward.unlocked ? (
                        <CheckCircleIcon color="success" />
                      ) : (
                        <GiftIcon color="disabled" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={reward.name}
                      secondary={reward.description}
                      primaryTypographyProps={{
                        variant: 'body2',
                        fontWeight: reward.unlocked ? 'medium' : 'regular'
                      }}
                      secondaryTypographyProps={{
                        variant: 'caption'
                      }}
                    />
                  </ListItem>
                ))}
              </List>
              <Button 
                fullWidth 
                variant="outlined" 
                color="primary" 
                size="small" 
                sx={{ mt: 1 }}
              >
                View All Rewards
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Promotional Banner */}
      <Paper 
        elevation={0}
        sx={{
          mt: 6,
          p: 4,
          borderRadius: 2,
          background: 'linear-gradient(135deg, #1976d2 0%, #303f9f 100%)',
          color: 'white',
          textAlign: 'center'
        }}
      >
        <EmojiEventsIcon sx={{ fontSize: 48, mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Become a Top Affiliate
        </Typography>
        <Typography variant="body1" paragraph maxWidth="800px" mx="auto">
          Earn amazing rewards including an all-expense paid trip for 50 direct referrals and a brand new car for the top affiliate of the year!
        </Typography>
        <Button 
          variant="contained" 
          color="secondary" 
          size="large"
          startIcon={<ShareIcon />}
          sx={{ 
            bgcolor: 'white',
            color: 'primary.main',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.9)'
            }
          }}
        >
          Start Referring Now
        </Button>
      </Paper>
    </Container>
  );
};

export default AffiliateSystem;
