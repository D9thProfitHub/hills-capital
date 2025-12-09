import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardActionArea,
  CardMedia, 
  Button, 
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  School as SchoolIcon,
  CurrencyBitcoin as CryptoIcon,
  PlayCircleOutline as PlayIcon,
  CheckCircle as CheckCircleIcon,
  MenuBook as MenuBookIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Module data
const modules = [
  {
    id: 1,
    title: 'Introduction to Cryptocurrency',
    description: 'Learn the basics of blockchain technology and how cryptocurrencies work in the digital economy.',
    duration: '30 min',
    lessons: 5,
    completed: true,
    thumbnail: 'https://via.placeholder.com/300x200?text=Crypto+Module+1',
    youtubeId: 'dQw4w9WgXcQ' // Replace with actual YouTube video ID
  },
  {
    id: 2,
    title: 'Blockchain Fundamentals',
    description: 'Understand the core concepts of blockchain technology and its applications beyond cryptocurrencies.',
    duration: '45 min',
    lessons: 6,
    completed: true,
    thumbnail: 'https://via.placeholder.com/300x200?text=Crypto+Module+2',
    youtubeId: 'dQw4w9WgXcQ'
  },
  {
    id: 3,
    title: 'Crypto Trading Basics',
    description: 'Learn how to trade cryptocurrencies, read charts, and understand market indicators.',
    duration: '40 min',
    lessons: 5,
    completed: true,
    thumbnail: 'https://via.placeholder.com/300x200?text=Crypto+Module+3',
    youtubeId: 'dQw4w9WgXcQ'
  },
  {
    id: 4,
    title: 'Crypto Security & Wallets',
    description: 'Essential security practices for storing and protecting your cryptocurrency investments.',
    duration: '35 min',
    lessons: 4,
    completed: true,
    thumbnail: 'https://via.placeholder.com/300x200?text=Crypto+Module+4',
    youtubeId: 'dQw4w9WgXcQ'
  },
  {
    id: 5,
    title: 'Advanced Trading Strategies',
    description: 'Master advanced trading techniques and risk management for cryptocurrency markets.',
    duration: '50 min',
    lessons: 7,
    completed: false,
    thumbnail: 'https://via.placeholder.com/300x200?text=Crypto+Module+5',
    youtubeId: 'dQw4w9WgXcQ'
  }
];

// Module Card Component
const ModuleCard = ({ module }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: theme.shadows[8]
        }
      }}
    >
      <CardActionArea 
        onClick={() => navigate(`/education/crypto/module/${module.id}`)}
        sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
      >
        <CardMedia
          component="img"
          height="140"
          image={module.thumbnail}
          alt={module.title}
          sx={{
            objectFit: 'cover',
            width: '100%',
            borderBottom: `1px solid ${theme.palette.divider}`
          }}
        />
        <CardContent sx={{ flexGrow: 1, width: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Chip 
              icon={<PlayIcon />} 
              label={`${module.lessons} lessons`} 
              size="small" 
              color="primary"
              variant="outlined"
            />
            <Typography variant="caption" color="text.secondary">
              {module.duration}
            </Typography>
          </Box>
          <Typography gutterBottom variant="h6" component="div" sx={{ mt: 1, minHeight: isMobile ? 'auto' : '4.5em' }}>
            {module.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: isMobile ? 'auto' : '4em' }}>
            {module.description}
          </Typography>
          {module.completed && (
            <Chip 
              icon={<CheckCircleIcon />} 
              label="Completed" 
              color="success" 
              size="small"
              sx={{ mt: 1 }}
            />
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

// Main Component
const CryptoEducation = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      {/* Hero Section */}
      <Box 
        sx={{ 
          textAlign: 'center', 
          mb: 6,
          background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
          color: 'white',
          borderRadius: 4,
          p: 4,
          boxShadow: 3
        }}
      >
        <CryptoIcon sx={{ fontSize: 60, mb: 2 }} />
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom
          sx={{
            fontSize: {
              xs: '2rem',   // Smaller on extra small screens
              sm: '2.5rem', // Slightly larger on small screens
              md: '3rem'    // Full size on medium and up
            },
            lineHeight: 1.2,
            fontWeight: 600
          }}
        >
          Cryptocurrency Education
        </Typography>
        <Typography variant="h6" sx={{ maxWidth: 800, mx: 'auto', mb: 3 }}>
          Master the world of cryptocurrencies with our comprehensive educational resources. 
          Learn about blockchain technology, trading strategies, and security best practices.
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          size="large"
          startIcon={<PlayIcon />}
          href="https://youtube.com/@hillscapital-v8g8w"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ 
            px: 4, 
            py: 1.5, 
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
          }}
        >
          Watch on YouTube
        </Button>
      </Box>

      {/* Modules Grid */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          <MenuBookIcon sx={{ mr: 1, color: 'primary.main' }} />
          Course Modules
        </Typography>
        
        <Grid container spacing={3}>
          {modules.map((module) => (
            <Grid item xs={12} sm={6} md={4} key={module.id}>
              <ModuleCard module={module} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Call to Action */}
      <Box 
        sx={{ 
          backgroundColor: 'background.paper',
          borderRadius: 4,
          p: 4,
          textAlign: 'center',
          boxShadow: 1
        }}
      >
        <Typography variant="h5" component="h2" gutterBottom>
          Ready to start your crypto journey?
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 700, mx: 'auto' }}>
          Join our community of crypto enthusiasts and start learning the skills you need to navigate the digital asset markets with confidence.
        </Typography>
        <Button 
          variant="contained" 
          size="large" 
          color="primary"
          href="/register"
          sx={{ 
            px: 4, 
            py: 1.5, 
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 'bold',
            fontSize: '1.1rem'
          }}
        >
          Get Started for Free
        </Button>
      </Box>
    </Container>
  );
};

export default CryptoEducation;
