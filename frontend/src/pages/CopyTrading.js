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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  AccountBalance as AccountBalanceIcon,
  Visibility as VisibilityIcon,
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  VpnKey as VpnKeyIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  Storage as StorageIcon,
  AttachMoney as AttachMoneyIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';

const CopyTrading = () => {
  const [expanded, setExpanded] = useState('panel1');
  const [accountDetails, setAccountDetails] = useState({
    name: '',
    broker: '',
    server: '',
    login: '',
    password: '',
    accountType: 'MT4',
    riskLevel: 'medium',
    maxDrawdown: '20',
    acceptTerms: false
  });

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAccountDetails(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Account details submitted:', accountDetails);
  };

  const features = [
    {
      icon: <AutoAwesomeIcon color="primary" />,
      title: 'Automated Execution',
      description: 'Trades are copied instantly from expert traders to your account in real-time.'
    },
    {
      icon: <AccountBalanceIcon color="primary" />,
      title: 'Diversification',
      description: 'Follow multiple traders across different strategies and markets.'
    },
    {
      icon: <VisibilityIcon color="primary" />,
      title: 'Transparency',
      description: 'Full access to performance history and statistics of all signal providers.'
    },
    {
      icon: <SecurityIcon color="primary" />,
      title: 'Risk Control',
      description: 'Customize risk parameters based on your account size and risk appetite.'
    }
  ];

  const supportedAssets = [
    'All Major Forex Pairs (EUR/USD, GBP/USD, USD/JPY, etc.)',
    'Cryptocurrencies (BTC, ETH, XRP, etc.)',
    'Commodities (Gold, Silver, Oil)',
    'Indices (S&P 500, NASDAQ, DAX, etc.)',
    'Synthetic Indices'
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Box textAlign="center" mb={6}>
        <Typography variant="h3" component="h1" gutterBottom>
          Copy Trading
        </Typography>
        <Typography variant="h6" color="text.secondary" maxWidth="800px" mx="auto">
          Automatically replicate the trades of experienced investors in real-time and benefit from expert strategies without needing in-depth market knowledge.
        </Typography>
      </Box>

      {/* Features Grid */}
      <Grid container spacing={4} mb={8}>
        {features.map((feature, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
              <Box display="flex" alignItems="flex-start">
                <Box mr={2} mt={0.5}>
                  {feature.icon}
                </Box>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography color="text.secondary">
                    {feature.description}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={6}>
        {/* Account Connection Form */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Connect Your Trading Account
              </Typography>
              <Typography color="text.secondary" paragraph>
                Link your MT4/MT5 account to start copy trading in minutes.
              </Typography>
              
              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Your Name"
                      name="name"
                      value={accountDetails.name}
                      onChange={handleInputChange}
                      required
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Platform</InputLabel>
                      <Select
                        name="accountType"
                        value={accountDetails.accountType}
                        onChange={handleInputChange}
                        required
                      >
                        <MenuItem value="MT4">MetaTrader 4</MenuItem>
                        <MenuItem value="MT5">MetaTrader 5</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Broker Name"
                      name="broker"
                      value={accountDetails.broker}
                      onChange={handleInputChange}
                      required
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Server"
                      name="server"
                      value={accountDetails.server}
                      onChange={handleInputChange}
                      required
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Account Number"
                      name="login"
                      type="number"
                      value={accountDetails.login}
                      onChange={handleInputChange}
                      required
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Password (Investor)"
                      name="password"
                      type="password"
                      value={accountDetails.password}
                      onChange={handleInputChange}
                      required
                      margin="normal"
                      helperText="Use your investor password (read-only access)"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Risk Level</InputLabel>
                      <Select
                        name="riskLevel"
                        value={accountDetails.riskLevel}
                        onChange={handleInputChange}
                        required
                      >
                        <MenuItem value="low">Low (Conservative)</MenuItem>
                        <MenuItem value="medium">Medium (Balanced)</MenuItem>
                        <MenuItem value="high">High (Aggressive)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Max Drawdown Limit</InputLabel>
                      <Select
                        name="maxDrawdown"
                        value={accountDetails.maxDrawdown}
                        onChange={handleInputChange}
                        required
                      >
                        <MenuItem value="10">10%</MenuItem>
                        <MenuItem value="20">20%</MenuItem>
                        <MenuItem value="30">30%</MenuItem>
                        <MenuItem value="50">50%</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={accountDetails.acceptTerms}
                          onChange={handleInputChange}
                          name="acceptTerms"
                          color="primary"
                          required
                        />
                      }
                      label="I understand the risks involved in trading and agree to the Terms of Service"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button 
                      type="submit" 
                      variant="contained" 
                      color="primary" 
                      size="large"
                      fullWidth
                      disabled={!accountDetails.acceptTerms}
                    >
                      Connect Account & Start Copy Trading
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Information Panel */}
        <Grid item xs={12} md={6}>
          <Box mb={4}>
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                <Box display="flex" alignItems="center">
                  <DashboardIcon color="primary" sx={{ mr: 1 }} />
                  How It Works
                  </Box>
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                  <ListItemText 
                    primary="1. Connect Your Account" 
                    secondary="Provide your MT4/MT5 login details (investor password only)" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                  <ListItemText 
                    primary="2. Choose Signal Providers" 
                    secondary="Select from our verified expert traders" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                  <ListItemText 
                    primary="3. Set Risk Parameters" 
                    secondary="Customize lot sizes and risk levels" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                  <ListItemText 
                    primary="4. Start Copying" 
                    secondary="Trades are automatically copied to your account" 
                  />
                </ListItem>
              </List>
            </Paper>

            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                <Box display="flex" alignItems="center">
                  <AttachMoneyIcon color="primary" sx={{ mr: 1 }} />
                  Supported Assets
                </Box>
              </Typography>
              <List dense>
                {supportedAssets.map((asset, index) => (
                  <ListItem key={index}>
                    <ListItemIcon><CheckCircleIcon color="primary" fontSize="small" /></ListItemIcon>
                    <ListItemText primary={asset} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CopyTrading;
