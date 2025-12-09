import React from 'react';
import { 
  Container, 
  Grid, 
  Typography, 
  Box, 
  Link, 
  List, 
  ListItem, 
  ListItemIcon, 
  Divider,
  IconButton,
  Button
} from '@mui/material';
import { 
  Facebook as FacebookIcon, 
  Twitter as TwitterIcon, 
  Instagram as InstagramIcon, 
  YouTube as YouTubeIcon, 
  Telegram as TelegramIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'background.paper',
        py: 6,
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              HILLS-CAPITAL
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Empowering traders with education, signals, and automated solutions for financial success in the global markets.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
              {[
                { 
                  icon: <FacebookIcon />, 
                  url: 'https://www.facebook.com/profile.php?id=61578067629441&mibextid=ZbWKwL',
                  label: 'Facebook'
                },
                { 
                  icon: <TwitterIcon />, 
                  url: 'https://x.com/HillsCapital_Ai?t=nGtgcYQeR51S9L0JP2MJOw&s=08',
                  label: 'Twitter'
                },
                { 
                  icon: <InstagramIcon />, 
                  url: 'https://www.instagram.com/hillscapital_aiplanet?igsh=MW05dXJncGV1Zm42Nw==',
                  label: 'Instagram'
                },
                { 
                  icon: <YouTubeIcon />, 
                  url: 'https://youtube.com/@hillscapital-v8g8w?si=duJ8h0ugS04H85ly',
                  label: 'YouTube'
                },
                { 
                  icon: <TelegramIcon />, 
                  url: 'https://t.me/hillscapital_aiplanet',
                  label: 'Telegram'
                },
                { 
                  icon: <Box component="span" sx={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 24,
                    height: 24,
                    bgcolor: 'black',
                    color: 'white',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>Tk</Box>,
                  url: 'https://www.tiktok.com/@hillscapital_aiplanet',
                  label: 'TikTok'
                }
              ].map((social, index) => (
                <IconButton 
                  key={index} 
                  component="a" 
                  href={social.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  color="primary"
                >
                  {social.icon}
                </IconButton>
              ))}
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={4} md={2}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Company
            </Typography>
            <List dense disablePadding>
              {[
                { text: 'About Us', to: '/about' },
                { text: 'Our Team', to: '/team' },
                { text: 'Careers', to: '/careers' },
                { text: 'Blog', to: '/blog' },
                { text: 'Press', to: '/press' }
              ].map((item, index) => (
                <ListItem key={index} disableGutters>
                  <Button 
                    component={RouterLink} 
                    to={item.to}
                    sx={{ 
                      color: 'text.secondary',
                      textTransform: 'none',
                      p: 0,
                      '&:hover': { color: 'primary.main' },
                      justifyContent: 'flex-start',
                      textAlign: 'left',
                      width: '100%'
                    }}
                  >
                    {item.text}
                  </Button>
                </ListItem>
              ))}
            </List>
          </Grid>
          
          <Grid item xs={12} sm={4} md={2}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Services
            </Typography>
            <List dense disablePadding>
              {[
                { text: 'Forex Education', to: '/forex-education' },
                { text: 'Crypto Education', to: '/crypto-education' },
                { text: 'Signal Room', to: '/signal-room' },
                { text: 'Copy Trading', to: '/copy-trading' },
                { text: 'Trading Bots', to: '/trading-bots' }
              ].map((item, index) => (
                <ListItem key={index} disableGutters>
                  <Button 
                    component={RouterLink} 
                    to={item.to}
                    sx={{ 
                      color: 'text.secondary',
                      textTransform: 'none',
                      p: 0,
                      '&:hover': { color: 'primary.main' },
                      justifyContent: 'flex-start',
                      textAlign: 'left',
                      width: '100%'
                    }}
                  >
                    {item.text}
                  </Button>
                </ListItem>
              ))}
            </List>
          </Grid>
          
          <Grid item xs={12} sm={4} md={2}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Legal
            </Typography>
            <List dense disablePadding>
              {[
                { text: 'Terms of Service', to: '/terms' },
                { text: 'Privacy Policy', to: '/privacy' },
                { text: 'Risk Disclosure', to: '/risk-disclosure' },
                { text: 'Refund Policy', to: '/refund-policy' },
                { text: 'AML Policy', to: '/aml-policy' }
              ].map((item, index) => (
                <ListItem key={index} disableGutters>
                  <Button 
                    component={RouterLink} 
                    to={item.to}
                    sx={{ 
                      color: 'text.secondary',
                      textTransform: 'none',
                      p: 0,
                      '&:hover': { color: 'primary.main' },
                      justifyContent: 'flex-start',
                      textAlign: 'left',
                      width: '100%'
                    }}
                  >
                    {item.text}
                  </Button>
                </ListItem>
              ))}
            </List>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Contact Us
            </Typography>
            <List dense disablePadding>
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <EmailIcon fontSize="small" color="primary" />
                </ListItemIcon>
                <Typography variant="body2" color="text.secondary">
                  support@hillscapital.com
                </Typography>
              </ListItem>
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <PhoneIcon fontSize="small" color="primary" />
                </ListItemIcon>
                <Typography variant="body2" color="text.secondary">
                  +1 (555) 123-4567
                </Typography>
              </ListItem>
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 32, alignSelf: 'flex-start' }}>
                  <LocationIcon fontSize="small" color="primary" />
                </ListItemIcon>
                <Typography variant="body2" color="text.secondary">
                  123 Trading Street,<br />
                  New York, NY 10001
                </Typography>
              </ListItem>
            </List>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 4 }} />
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          justifyContent: 'space-between', 
          alignItems: 'center',
          gap: 2
        }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} HILLS-CAPITAL. All rights reserved.
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            flexWrap: 'wrap',
            justifyContent: { xs: 'center', md: 'flex-end' },
            width: { xs: '100%', md: 'auto' },
            mt: { xs: 2, md: 0 }
          }}>
            <Button 
              component={RouterLink}
              to="/privacy"
              variant="text"
              size="small"
              sx={{ 
                color: 'text.secondary',
                minWidth: 'auto',
                p: 0,
                '&:hover': { 
                  color: 'primary.main',
                  backgroundColor: 'transparent'
                }
              }}
            >
              Privacy Policy
            </Button>
            <Button 
              component={RouterLink}
              to="/terms"
              variant="text"
              size="small"
              sx={{ 
                color: 'text.secondary',
                minWidth: 'auto',
                p: 0,
                '&:hover': { 
                  color: 'primary.main',
                  backgroundColor: 'transparent'
                }
              }}
            >
              Terms of Service
            </Button>
            <Button 
              component={RouterLink}
              to="/risk-disclosure"
              variant="text"
              size="small"
              sx={{ 
                color: 'text.secondary',
                minWidth: 'auto',
                p: 0,
                '&:hover': { 
                  color: 'primary.main',
                  backgroundColor: 'transparent'
                }
              }}
            >
              Risk Disclosure
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
