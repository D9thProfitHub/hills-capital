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
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  Avatar
} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  AccountBalance as AccountBalanceIcon,
  CurrencyExchange as CurrencyExchangeIcon,
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon,
  AttachMoney as AttachMoneyIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Timeline as TimelineIcon,
  Memory as MemoryIcon,
  Speed as SpeedIcon,
  VerifiedUser as VerifiedUserIcon,
  SupportAgent as SupportAgentIcon,
  Lock as LockIcon
} from '@mui/icons-material';

const RobotsAutoPilot = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedBot, setSelectedBot] = useState('');
  const [accountDetails, setAccountDetails] = useState({
    name: '',
    email: '',
    phone: '',
    broker: '',
    server: '',
    accountNumber: '',
    accountType: 'MT4',
    investmentAmount: '',
    riskLevel: 'medium',
    acceptTerms: false
  });

  const botTypes = [
    {
      id: 'forex',
      name: 'Forex Bot',
      description: 'Automated trading for major and minor currency pairs',
      icon: <CurrencyExchangeIcon color="primary" />,
      features: [
        '24/5 market monitoring',
        'Multiple currency pairs',
        'Advanced risk management',
        'Real-time execution'
      ]
    },
    {
      id: 'synthetics',
      name: 'Synthetic Indices Bot',
      description: 'Algorithmic trading for synthetic indices',
      icon: <TimelineIcon color="primary" />,
      features: [
        'Volatility-based strategies',
        '24/7 trading',
        'Customizable parameters',
        'Performance analytics'
      ]
    },
    {
      id: 'commodities',
      name: 'Commodities Bot',
      description: 'Automated trading for gold, oil, and other commodities',
      icon: <AccountBalanceIcon color="primary" />,
      features: [
        'Precious metals trading',
        'Energy markets',
        'Trend following strategies',
        'Risk-adjusted position sizing'
      ]
    },
    {
      id: 'crypto',
      name: 'Crypto Bot',
      description: 'Automated trading for spot and futures crypto markets',
      icon: <MemoryIcon color="primary" />,
      features: [
        '24/7 trading',
        'Spot and futures markets',
        'Arbitrage opportunities',
        'Multi-exchange support'
      ]
    }
  ];

  const steps = [
    'Select Bot Type',
    'Configure Settings',
    'Review & Submit'
  ];

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
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
    console.log('Bot setup submitted:', { selectedBot, ...accountDetails });
    handleNext();
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {botTypes.map((bot) => (
              <Grid item xs={12} sm={6} key={bot.id}>
                <Card 
                  variant="outlined"
                  sx={{
                    height: '100%',
                    borderColor: selectedBot === bot.id ? 'primary.main' : 'divider',
                    borderWidth: selectedBot === bot.id ? 2 : 1,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: 3,
                    },
                    cursor: 'pointer',
                  }}
                  onClick={() => setSelectedBot(bot.id)}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Box mr={2}>
                        {bot.icon}
                      </Box>
                      <Typography variant="h6">{bot.name}</Typography>
                      {selectedBot === bot.id && (
                        <CheckCircleIcon color="primary" sx={{ ml: 'auto' }} />
                      )}
                    </Box>
                    <Typography color="text.secondary" paragraph>
                      {bot.description}
                    </Typography>
                    <List dense>
                      {bot.features.map((feature, index) => (
                        <ListItem key={index} disableGutters>
                          <ListItemIcon sx={{ minWidth: 30 }}>
                            <CheckCircleIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={feature} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        );
      case 1:
        return (
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={accountDetails.name}
                  onChange={handleInputChange}
                  required
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={accountDetails.email}
                  onChange={handleInputChange}
                  required
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={accountDetails.phone}
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
                    <MenuItem value="MT4">MetaTrader 4 (MT4)</MenuItem>
                    <MenuItem value="MT5">MetaTrader 5 (MT5)</MenuItem>
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
                  name="accountNumber"
                  value={accountDetails.accountNumber}
                  onChange={handleInputChange}
                  required
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Investment Amount (USD)"
                  name="investmentAmount"
                  type="number"
                  value={accountDetails.investmentAmount}
                  onChange={handleInputChange}
                  required
                  margin="normal"
                  InputProps={{
                    startAdornment: <AttachMoneyIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
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
                  label={
                    <Typography variant="body2">
                      I understand that my account will be configured manually by our team within 24-48 hours. 
                      I agree to the Terms of Service and Privacy Policy.
                    </Typography>
                  }
                />
              </Grid>
            </Grid>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <CheckCircleIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Request Submitted Successfully!
            </Typography>
            <Typography color="text.secondary" paragraph>
              Our team will review your application and contact you within 24-48 hours to complete the setup of your {botTypes.find(b => b.id === selectedBot)?.name}.
            </Typography>
            <Typography color="text.secondary" paragraph>
              Please ensure your trading account credentials are ready for our team.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => {
                setActiveStep(0);
                setSelectedBot('');
                setAccountDetails({
                  name: '',
                  email: '',
                  phone: '',
                  broker: '',
                  server: '',
                  accountNumber: '',
                  accountType: 'MT4',
                  investmentAmount: '',
                  riskLevel: 'medium',
                  acceptTerms: false
                });
              }}
              sx={{ mt: 2 }}
            >
              Setup Another Bot
            </Button>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box textAlign="center" mb={6}>
        <Typography variant="h3" component="h1" gutterBottom>
          Robots & Auto Pilot Trading
        </Typography>
        <Typography variant="h6" color="text.secondary" maxWidth="800px" mx="auto">
          Our expert-configured trading robots work 24/7 to execute trades based on proven strategies. 
          Select your preferred bot type and let our team handle the setup for you.
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ p: 4, mb: 6, borderRadius: 2, bgcolor: 'background.paper' }}>
        <Stepper activeStep={activeStep} orientation="horizontal" sx={{ mb: 4 }}>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mt: 4 }}>
          {getStepContent(activeStep)}
        </Box>

        {activeStep !== steps.length - 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={activeStep === 1 ? handleSubmit : handleNext}
              disabled={activeStep === 0 && !selectedBot}
            >
              {activeStep === steps.length - 2 ? 'Submit Request' : 'Next'}
            </Button>
          </Box>
        )}
      </Paper>

      {/* Features Section */}
      <Box sx={{ mt: 8 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Why Choose Our Trading Bots?
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {[
            {
              icon: <SpeedIcon color="primary" sx={{ fontSize: 40 }} />,
              title: 'Lightning Fast Execution',
              description: 'Our bots execute trades in milliseconds, ensuring you never miss an opportunity.'
            },
            {
              icon: <SecurityIcon color="primary" sx={{ fontSize: 40 }} />,
              title: 'Risk Management',
              description: 'Built-in stop-loss and take-profit mechanisms to protect your capital.'
            },
            {
              icon: <VerifiedUserIcon color="primary" sx={{ fontSize: 40 }} />,
              title: 'Expert-Configured',
              description: 'Each bot is set up and monitored by our team of trading experts.'
            },
            {
              icon: <SupportAgentIcon color="primary" sx={{ fontSize: 40 }} />,
              title: '24/7 Support',
              description: 'Our support team is available around the clock to assist you.'
            },
            {
              icon: <LockIcon color="primary" sx={{ fontSize: 40 }} />,
              title: 'Secure & Private',
              description: 'Your account details are encrypted and never shared with third parties.'
            },
            {
              icon: <SettingsIcon color="primary" sx={{ fontSize: 40 }} />,
              title: 'Customizable',
              description: 'Tailor the bot settings to match your trading style and risk tolerance.'
            }
          ].map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Box textAlign="center" sx={{ p: 3 }}>
                <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                <Typography variant="h6" gutterBottom>{feature.title}</Typography>
                <Typography color="text.secondary">{feature.description}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default RobotsAutoPilot;
