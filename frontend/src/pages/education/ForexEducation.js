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
  PlayCircleOutline as PlayIcon,
  CheckCircle as CheckCircleIcon,
  MenuBook as MenuBookIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Module data
const modules = [
  {
    id: 1,
    title: 'Introduction to Forex Trading',
    description: 'Learn the basics of forex trading, market participants, and how the forex market operates.',
    duration: '30 min',
    lessons: 5,
    completed: true,
    thumbnail: 'https://via.placeholder.com/300x200?text=Module+1',
    youtubeId: 'dQw4w9WgXcQ'
  },
  {
    id: 2,
    title: 'Technical Analysis Fundamentals',
    description: 'Master chart patterns, indicators, and technical analysis tools used by professional traders.',
    duration: '45 min',
    lessons: 7,
    completed: true,
    thumbnail: 'https://via.placeholder.com/300x200?text=Module+2',
    youtubeId: 'dQw4w9WgXcQ'
  },
  {
    id: 3,
    title: 'Risk Management Strategies',
    description: 'Learn how to manage risk, set stop losses, and protect your trading capital.',
    duration: '40 min',
    lessons: 6,
    completed: true,
    thumbnail: 'https://via.placeholder.com/300x200?text=Module+3',
    youtubeId: 'dQw4w9WgXcQ'
  },
  {
    id: 4,
    title: 'Trading Psychology',
    description: 'Develop the right mindset and emotional control for successful trading.',
    duration: '35 min',
    lessons: 5,
    completed: true,
    thumbnail: 'https://via.placeholder.com/300x200?text=Module+4',
    youtubeId: 'dQw4w9WgXcQ'
  },
  {
    id: 5,
    title: 'Advanced Trading Strategies',
    description: 'Learn advanced trading strategies used by professional forex traders.',
    duration: '50 min',
    lessons: 8,
    completed: false,
    thumbnail: 'https://via.placeholder.com/300x200?text=Module+5',
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
        onClick={() => navigate(`/education/forex/module/${module.id}`)}
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
const ForexEducation = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      {/* Hero Section */}
      <Box 
        sx={{ 
          textAlign: 'center', 
          mb: 6,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          borderRadius: 4,
          p: 4,
          boxShadow: 3
        }}
      >
        <SchoolIcon sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom>
          Forex Trading Education
        </Typography>
        <Typography variant="h6" sx={{ maxWidth: 800, mx: 'auto', mb: 3 }}>
          Master the art of forex trading with our comprehensive educational resources. 
          Learn at your own pace with structured modules designed for all skill levels.
        </Typography>
        <Button 
          variant="contained" 
          color="secondary" 
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
          Ready to start trading?
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 700, mx: 'auto' }}>
          Join thousands of traders who have already improved their trading skills with our educational resources.
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

export default ForexEducation;
