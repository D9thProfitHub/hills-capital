import React from 'react';
import {
  Container,
  Grid,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import {
  CheckCircle as CheckCircleIcon,
  School as SchoolIcon,
  CurrencyBitcoin as CryptoIcon,
  SignalCellularAlt as SignalIcon,
  ContentCopy as CopyTradingIcon,
  SmartToy as RobotIcon,
  ArrowForward as ArrowForwardIcon,
  BarChart as BarChartIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import TradingViewWidget from '../components/TradingViewWidget';
import ErrorBoundary from '../components/ErrorBoundary';

const ServiceCard = ({ icon, title, description, features, link }) => (
  <Card
    sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      transition: 'all 0.3s ease',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        borderColor: 'primary.main'
      }
    }}
  >
    <CardContent sx={{ flexGrow: 1, p: 4 }}>
      <Box sx={{ mb: 3, display: 'inline-block', p: 2, borderRadius: '50%', bgcolor: 'rgba(212, 175, 55, 0.1)' }}>
        {icon}
      </Box>
      <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, minHeight: '60px' }}>
        {description}
      </Typography>
      <List dense disablePadding>
        {features.map((feature, idx) => (
          <ListItem key={idx} disableGutters sx={{ py: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <CheckCircleIcon color="primary" fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={feature} />
          </ListItem>
        ))}
      </List>
      <Button
        component={RouterLink}
        to={link}
        variant="outlined"
        color="primary"
        fullWidth
        sx={{ mt: 4, borderRadius: 2 }}
      >
        Learn More
      </Button>
    </CardContent>
  </Card>
);

const Home = () => {

  return (
    <Box sx={{ overflowX: 'hidden' }}>
      {/* TradingView Widget */}
      <Box sx={{ bgcolor: '#000' }}>
        <ErrorBoundary>
          <TradingViewWidget />
        </ErrorBoundary>
      </Box>

      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: 'white',
          py: { xs: 8, md: 16 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.15) 0%, transparent 50%)',
            pointerEvents: 'none'
          }}
        />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={7}>
              <Chip
                label="New: Synthetic Indices Signals"
                color="primary"
                size="small"
                sx={{ mb: 3, fontWeight: 600 }}
              />
              <Typography
                variant="h1"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '2.5rem', md: '4.5rem' },
                  lineHeight: 1.1,
                  mb: 3,
                  background: 'linear-gradient(45deg, #fff 30%, #D4AF37 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Trade with Precision & Confidence
              </Typography>
              <Typography
                variant="h5"
                paragraph
                sx={{
                  color: 'grey.400',
                  mb: 5,
                  fontSize: { xs: '1.1rem', md: '1.25rem' },
                  maxWidth: '600px',
                  lineHeight: 1.6
                }}
              >
                Access premium signals, automated trading bots, and comprehensive education for Forex, Crypto, and Synthetic Indices.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="contained"
                  color="primary"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: 2
                  }}
                >
                  Start Free Trial
                </Button>
                <Button
                  component={RouterLink}
                  to="/markets"
                  variant="outlined"
                  color="inherit"
                  size="large"
                  startIcon={<BarChartIcon />}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: 2,
                    borderColor: 'rgba(255,255,255,0.2)',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255,255,255,0.05)'
                    }
                  }}
                >
                  View Markets
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box
                sx={{
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: -20,
                    background: 'conic-gradient(from 0deg, transparent 0deg, #D4AF37 360deg)',
                    borderRadius: '50%',
                    animation: 'spin 4s linear infinite',
                    opacity: 0.3,
                    filter: 'blur(20px)'
                  }
                }}
              >
                <Box
                  component="img"
                  src="/images/trading-dashboard.jpg"
                  alt="Trading Platform"
                  sx={{
                    width: '100%',
                    borderRadius: 4,
                    boxShadow: '0 24px 80px rgba(0, 0, 0, 0.5)',
                    position: 'relative',
                    zIndex: 2,
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Services Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={8}>
            <Typography variant="overline" color="primary" fontWeight="bold" letterSpacing={2}>
              OUR EXPERTISE
            </Typography>
            <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 800, mt: 1 }}>
              Comprehensive Trading Solutions
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '700px', mx: 'auto', mt: 2 }}>
              Everything you need to succeed in the financial markets, all in one place.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <ServiceCard
                icon={<TimelineIcon color="primary" sx={{ fontSize: 40 }} />}
                title="Synthetic Indices"
                description="Trade 24/7 with our exclusive synthetic indices signals and strategies."
                features={['High Volatility Pairs', '24/7 Market Access', 'Specialized Strategies']}
                link="/signal-room"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <ServiceCard
                icon={<SchoolIcon color="primary" sx={{ fontSize: 40 }} />}
                title="Training Academy"
                description="Structured learning paths from beginner basics to advanced institutional concepts."
                features={['Video Tutorials', 'Live Mentorship', 'Quizzes & Certifications']}
                link="/forex-education"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <ServiceCard
                icon={<RobotIcon color="primary" sx={{ fontSize: 40 }} />}
                title="Automated Trading"
                description="Deploy our battle-tested trading bots to automate your strategy."
                features={['Backtested Results', 'Risk Controls', 'Easy Setup']}
                link="/robots"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <ServiceCard
                icon={<SignalIcon color="primary" sx={{ fontSize: 40 }} />}
                title="Premium Signals"
                description="Real-time entry and exit points for Forex, Crypto, and Synthetics."
                features={['85%+ Accuracy', 'Instant Alerts', 'Detailed Analysis']}
                link="/signal-room"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <ServiceCard
                icon={<CopyTradingIcon color="primary" sx={{ fontSize: 40 }} />}
                title="Copy Trading"
                description="Mirror the trades of our top-performing master traders automatically."
                features={['Transparent History', 'No Experience Needed', 'Full Control']}
                link="/copy-trading"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <ServiceCard
                icon={<CryptoIcon color="primary" sx={{ fontSize: 40 }} />}
                title="Crypto Trading"
                description="Navigate the crypto markets with expert insights and technical analysis."
                features={['Spot & Futures', 'DeFi Insights', 'Portfolio Management']}
                link="/crypto-education"
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: 10, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 800 }}>
            Ready to Start Your Journey?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Join thousands of traders who are already profiting with Hills Capital.
          </Typography>
          <Button
            component={RouterLink}
            to="/register"
            variant="contained"
            size="large"
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              px: 6,
              py: 2,
              fontSize: '1.2rem',
              fontWeight: 700,
              '&:hover': {
                bgcolor: 'grey.100'
              }
            }}
          >
            Get Started Now
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
