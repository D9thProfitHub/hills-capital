import React, { useState, useMemo } from 'react';
import { 
  Container, Typography, Box, Grid, Card, CardContent, CardMedia, 
  CardActions, Button, Tabs, Tab, Chip, TextField, InputAdornment, 
  Breadcrumbs, Link, Rating, Avatar, LinearProgress, IconButton, Collapse,
  FormControl, InputLabel, Select, MenuItem, Paper, List, ListItem,
  ListItemText, ListItemAvatar, ListItemSecondaryAction, Divider,
  useMediaQuery, useTheme, AppBar, Toolbar, Menu, MenuItem as MuiMenuItem,
  Drawer, ListItemButton, ListItemIcon, CssBaseline, alpha
} from '@mui/material';
import { 
  Search as SearchIcon, 
  School as SchoolIcon, 
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  StarHalf as StarHalfIcon,
  Description as DescriptionIcon,
  MenuBook as MenuBookIcon,
  PlayCircleOutline as PlayIcon,
  PictureAsPdf as PictureAsPdfIcon,
  InsertDriveFile as InsertDriveFileIcon,
  CloudDownload as CloudDownloadIcon,
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  AccountBalance as AccountBalanceIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  ExitToApp as ExitToAppIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';

// Custom theme with enhanced colors
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1a237e', // Deep blue
      light: '#534bae',
      dark: '#000051',
    },
    secondary: {
      main: '#ffc107', // Amber
      light: '#fff350',
      dark: '#c79100',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      background: 'linear-gradient(45deg, #ffc107 30%, #ffeb3b 90%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: '#000051',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          transition: 'transform 0.3s, box-shadow 0.3s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
          },
        },
      },
    },
  },
});

// Styled components
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: 'linear-gradient(45deg, #1a237e 0%, #000051 100%)',
  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)',
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  minWidth: 'auto',
  padding: '12px 16px',
  fontWeight: 600,
  '&.Mui-selected': {
    color: theme.palette.secondary.main,
  },
}));

const StyledChip = styled(Chip)(({ theme, selected }) => ({
  margin: '4px',
  backgroundColor: selected ? theme.palette.secondary.main : 'transparent',
  color: selected ? theme.palette.getContrastText(theme.palette.secondary.main) : theme.palette.secondary.main,
  border: `1px solid ${theme.palette.secondary.main}`,
  '&:hover': {
    backgroundColor: selected ? theme.palette.secondary.dark : alpha(theme.palette.secondary.main, 0.1),
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  background: theme.palette.background.paper,
  '&:hover': {
    '& .MuiCardMedia-root': {
      transform: 'scale(1.03)',
    },
  },
}));

const StyledCardMedia = styled(CardMedia)(({ theme }) => ({
  height: 140,
  transition: 'transform 0.3s ease-in-out',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
}));

const ForexEducation = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  // State for tabs
  const [tabValue, setTabValue] = useState('courses');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };
  
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Sample data - replace with API calls in production
  const categories = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Technical Analysis', 'Fundamental Analysis'];
  const courses = [
    {
      id: 1,
      title: 'Forex Trading Basics',
      instructor: 'John Smith',
      level: 'Beginner',
      duration: '2h 30m',
      rating: 4.8,
      students: 1245,
      image: 'https://via.placeholder.com/300x200?text=Forex+Basics',
      description: 'Learn the fundamentals of forex trading including currency pairs, pips, and basic strategies.',
      progress: 35,
      lessons: 12,
      enrolled: true
    },
    {
      id: 2,
      title: 'Technical Analysis Mastery',
      instructor: 'Sarah Johnson',
      level: 'Intermediate',
      duration: '4h 15m',
      rating: 4.9,
      students: 876,
      image: 'https://via.placeholder.com/300x200?text=Technical+Analysis',
      description: 'Master chart patterns, technical indicators, and price action strategies used by professional traders.',
      progress: 0,
      lessons: 18,
      enrolled: false
    },
    {
      id: 3,
      title: 'Risk Management Strategies',
      instructor: 'Michael Chen',
      level: 'Intermediate',
      duration: '3h',
      rating: 4.7,
      students: 654,
      image: 'https://via.placeholder.com/300x200?text=Risk+Management',
      description: 'Learn how to protect your capital and maximize returns with proper risk management techniques.',
      progress: 0,
      lessons: 10,
      enrolled: false
    },
    {
      id: 4,
      title: 'Forex Fundamentals',
      instructor: 'Emma Wilson',
      level: 'Advanced',
      duration: '5h 20m',
      rating: 4.9,
      students: 432,
      image: 'https://via.placeholder.com/300x200?text=Forex+Fundamentals',
      description: 'Understand how economic indicators, central bank policies, and global events impact currency markets.',
      progress: 0,
      lessons: 15,
      enrolled: false
    }
  ];

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleExpandCourse = (courseId) => {
    setExpandedCourse(expandedCourse === courseId ? null : courseId);
  };

  // Filter courses based on search and category
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || course.level === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Drawer content for mobile
  const drawer = (
    <Box sx={{ width: 250, p: 2 }}>
      <Typography variant="h6" sx={{ p: 2, fontWeight: 'bold', color: theme.palette.secondary.main }}>
        Menu
      </Typography>
      <Divider sx={{ mb: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
      <List>
        {['Dashboard', 'Courses', 'Progress', 'Resources', 'Settings'].map((text, index) => (
          <ListItemButton key={text} sx={{ borderRadius: 2, mb: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
              {index === 0 && <DashboardIcon />}
              {index === 1 && <SchoolIcon />}
              {index === 2 && <AssessmentIcon />}
              {index === 3 && <DescriptionIcon />}
              {index === 4 && <SettingsIcon />}
            </ListItemIcon>
            <ListItemText primary={text} primaryTypographyProps={{ variant: 'body2' }} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box',
              width: 250,
              bgcolor: 'background.paper',
              borderRight: '1px solid rgba(255, 255, 255, 0.12)',
            },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: 280,
              bgcolor: 'background.paper',
              borderRight: '1px solid rgba(255, 255, 255, 0.12)',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
        
        {/* Main Content */}
        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3, md: 4 } }}>
          {/* App Bar */}
          <AppBar 
            position="sticky" 
            elevation={0}
            sx={{ 
              bgcolor: 'background.paper',
              color: 'text.primary',
              borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
              mb: 3,
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <Toolbar>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2, display: { md: 'none' } }}
              >
                <MenuIcon />
              </IconButton>
              <Box sx={{ flexGrow: 1 }} />
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton 
                  color={viewMode === 'list' ? 'secondary' : 'default'} 
                  onClick={() => handleViewModeChange('list')}
                  size="large"
                >
                  <ViewListIcon />
                </IconButton>
                <IconButton 
                  color={viewMode === 'grid' ? 'secondary' : 'default'} 
                  onClick={() => handleViewModeChange('grid')}
                  size="large"
                >
                  <ViewModuleIcon />
                </IconButton>
              </Box>
            </Toolbar>
          </AppBar>
          
          {/* Page Content */}
          <Box sx={{ width: '100%' }}>
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                  Forex Education
                </Typography>
                <Box>
                  <Button 
                    variant="contained" 
                    color="secondary"
                    startIcon={<PlayIcon />}
                    sx={{ borderRadius: 2, fontWeight: 600, textTransform: 'none' }}
                  >
                    Watch Tutorial
                  </Button>
                </Box>
              </Box>
              
              <Breadcrumbs aria-label="breadcrumb" sx={{ color: 'text.secondary' }}>
                <Link color="inherit" href="/" underline="hover" sx={{ display: 'flex', alignItems: 'center' }}>
                  <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                  Home
                </Link>
                <Link color="inherit" href="/education" underline="hover">
                  Education
                </Link>
                <Typography color="text.primary">Forex Trading</Typography>
              </Breadcrumbs>
            </Box>

            <Box sx={{ width: '100%', mb: 4 }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs 
                  value={tabValue} 
                  onChange={handleTabChange} 
                  textColor="primary"
                  indicatorColor="primary"
                  variant="scrollable"
                  scrollButtons="auto"
                  aria-label="forex education tabs"
                >
                  <Tab label="Courses" value="courses" />
                  <Tab label="Learning Paths" value="paths" />
                  <Tab label="Resources" value="resources" />
                  <Tab label="My Learning" value="learning" />
                </Tabs>
              </Box>

              <Box sx={{ mt: 3 }}>
                {tabValue === 'courses' && (
                  <Box sx={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                      <TextField
                        placeholder="Search courses..."
                        variant="outlined"
                        size="small"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        fullWidth={isMobile}
                        sx={{ 
                          flexGrow: 1,
                          maxWidth: isMobile ? '100%' : 400,
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': { borderColor: 'divider' },
                            '&:hover fieldset': { borderColor: 'primary.light' },
                            '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                          },
                          '& .MuiInputBase-input': { 
                            color: 'text.primary',
                            py: 1
                          },
                          '& .MuiInputLabel-root': { color: 'text.secondary' }
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon sx={{ color: 'text.secondary' }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                      
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', width: isMobile ? '100%' : 'auto' }}>
                        {categories.map((category) => (
                          <Chip
                            key={category}
                            label={category}
                            onClick={() => handleCategoryChange(category)}
                            variant={selectedCategory === category ? 'filled' : 'outlined'}
                            color={selectedCategory === category ? 'secondary' : 'default'}
                            sx={{
                              mb: 1,
                              '&:hover': {
                                bgcolor: selectedCategory === category ? 'secondary.dark' : 'action.hover',
                              },
                            }}
                          />
                        ))}
                      </Box>
                    </Box>

                    <Grid container spacing={3}>
                      {filteredCourses.map((course) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={course.id}>
                    <Card sx={{ 
                      bgcolor: 'background.paper', 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                      }
                    }}>
                      <CardMedia
                        component="img"
                        height="140"
                        image={course.image}
                        alt={course.title}
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Chip 
                            label={course.level} 
                            size="small" 
                            sx={{ 
                              bgcolor: '#ddbd22', 
                              color: 'black',
                              fontWeight: 'bold',
                              fontSize: '0.7rem'
                            }} 
                          />
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <StarIcon sx={{ color: '#ddbd22', fontSize: '1.2rem', mr: 0.5 }} />
                            <Typography variant="body2" color="text.secondary">
                              {course.rating}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Typography gutterBottom variant="h6" component="div" sx={{ 
                          fontWeight: 'bold',
                          minHeight: '60px',
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          {course.title}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          By {course.instructor}
                        </Typography>
                        
                        {course.enrolled && (
                          <Box sx={{ width: '100%', mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="caption" color="text.secondary">
                                Progress: {course.progress}%
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {course.lessons} lessons
                              </Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={course.progress} 
                              sx={{ 
                                height: 6, 
                                borderRadius: 3,
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: '#ddbd22'
                                }
                              }} 
                            />
                          </Box>
                        )}
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            {course.duration} • {course.students.toLocaleString()} students
                          </Typography>
                          <Button
                            size="small"
                            onClick={() => handleExpandCourse(course.id)}
                            endIcon={expandedCourse === course.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            sx={{ color: '#ddbd22' }}
                          >
                            {expandedCourse === course.id ? 'Less' : 'More'}
                          </Button>
                        </Box>
                        
                        <Collapse in={expandedCourse === course.id} timeout="auto" unmountOnExit>
                          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                            <Typography variant="body2" paragraph>
                              {course.description}
                            </Typography>
                            <Button
                              variant="contained"
                              fullWidth
                              sx={{
                                bgcolor: '#ddbd22',
                                color: 'black',
                                '&:hover': {
            </Box>
          </ThemeProvider>
        );
      }
              </Typography>
              <Typography color="text.secondary">
                We're working on curated learning paths to help you master forex trading step by step.
              </Typography>
            </Box>
          )}
          
          {tabValue === 'resources' && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <DescriptionIcon sx={{ fontSize: 60, color: '#ddbd22', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Resources Coming Soon
              </Typography>
              <Typography color="text.secondary">
                Check back later for downloadable resources, cheat sheets, and trading tools.
              </Typography>
            </Box>
          )}
          
          {tabValue === 'learning' && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <MenuBookIcon sx={{ fontSize: 60, color: '#ddbd22', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Your Learning Journey
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Track your progress and continue learning from where you left off.
              </Typography>
              <Button 
                variant="contained" 
                onClick={() => setTabValue('courses')}
                sx={{
                  bgcolor: '#ddbd22',
                  color: 'black',
                  '&:hover': {
                    bgcolor: '#c9a91d',
                  },
                  borderRadius: 2,
                  fontWeight: 600,
                  textTransform: 'none',
                  px: 3,
                  py: 1
                }}
              >
                Browse Courses
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default ForexEducation;
