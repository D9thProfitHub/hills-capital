import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CardMedia,
  Chip,
  Button,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  IconButton,
  LinearProgress,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  School,
  Search,
  PlayCircleOutline,
  BookmarkBorder,
  Bookmark,
  CheckCircle,
  VideoLibrary,
  Article,
  Quiz,
  Close,
  PlayArrow,
  CheckCircleOutline
} from '@mui/icons-material';
import api from '../../../services/api';

const Education = () => {
  const [content, setContent] = useState([]);
  const [filteredContent, setFilteredContent] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedCourses, setSavedCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  
  // Fetch education content from API
  useEffect(() => {
    const fetchEducationContent = async () => {
      try {
        const response = await api.get('/api/users/education');
        console.log('Fetched education content:', response.data);
        const data = response.data?.data || [];
        setContent(data);
        setFilteredContent(data);
      } catch (error) {
        console.error('Error fetching education content:', error);
        setContent([]);
        setFilteredContent([]);
      }
    };

    fetchEducationContent();
  }, []);

  // Filter content based on search and tab
  useEffect(() => {
    let filtered = content;
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by tab
    switch(tabValue) {
      case 0: // All Content
        break;
      case 1: // Courses
        filtered = filtered.filter(item => item.type === 'course');
        break;
      case 2: // Webinars
        filtered = filtered.filter(item => item.type === 'webinar');
        break;
      case 3: // Articles
        filtered = filtered.filter(item => item.type === 'article');
        break;
      case 4: // Saved
        filtered = filtered.filter(item => 
          savedCourses.includes(item.id) || (item.userProgress && item.userProgress.isSaved)
        );
        break;
      default:
        break;
    }
    
    setFilteredContent(filtered);
  }, [content, searchQuery, tabValue, savedCourses]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const toggleSaveCourse = (courseId) => {
    setSavedCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleCourseClick = async (courseId) => {
    try {
      const response = await api.get(`/api/users/education/${courseId}`);
      setSelectedCourse(response.data.data);
      setCourseDialogOpen(true);
    } catch (error) {
      console.error('Error fetching course details:', error);
    }
  };

  const handleCloseCourseDialog = () => {
    setCourseDialogOpen(false);
    setSelectedCourse(null);
  };

  const handleStartLesson = async (lessonIndex) => {
    if (!selectedCourse) return;
    
    try {
      // Update progress for the lesson
      await api.put(`/api/users/education/${selectedCourse.id}/progress`, {
        lessonId: lessonIndex,
        completed: true
      });
      
      // Refresh the course data
      const response = await api.get(`/api/users/education/${selectedCourse.id}`);
      setSelectedCourse(response.data.data);
      
      // Refresh the main content list
      const contentResponse = await api.get('/api/users/education');
      const data = contentResponse.data?.data || [];
      setContent(data);
      setFilteredContent(data);
    } catch (error) {
      console.error('Error updating lesson progress:', error);
    }
  };

  const getLevelColor = (level) => {
    // Handle undefined or null level values
    if (!level) {
      return 'default';
    }
    
    switch(level.toLowerCase()) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'error';
      default: return 'default';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'course': return <School />;
      case 'webinar': return <VideoLibrary />;
      case 'article': return <Article />;
      case 'quiz': return <Quiz />;
      default: return <School />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'course': return 'primary';
      case 'webinar': return 'secondary';
      case 'article': return 'info';
      case 'quiz': return 'warning';
      default: return 'default';
    }
  };

  const ContentCard = ({ item }) => (
    <Card sx={{ height: '100%' }}>
      <CardMedia
        component="img"
        height="140"
        image={item.thumbnail || '/api/placeholder/400/200'}
        alt={item.title}
      />
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Chip
            icon={getTypeIcon(item.type)}
            label={item.type}
            color={getTypeColor(item.type)}
            size="small"
          />
          <IconButton 
            size="small" 
            onClick={() => toggleSaveCourse(item.id)}
          >
            {savedCourses.includes(item.id) || (item.userProgress && item.userProgress.isSaved) ? 
              <Bookmark color="primary" /> : 
              <BookmarkBorder />
            }
          </IconButton>
        </Box>
        
        <Typography variant="h6" component="div" gutterBottom>
          {item.title}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          {item.description}
        </Typography>

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Chip
            label={item.level || 'Beginner'}
            color={getLevelColor(item.level || 'Beginner')}
            size="small"
          />
          <Typography variant="body2" color="text.secondary">
            {item.duration || item.readTime || '30 min'}
          </Typography>
        </Box>

        {item.userProgress && (
          <Box mb={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" color="text.secondary">
                Progress
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {item.userProgress.progress || 0}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={item.userProgress.progress || 0} 
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>
        )}

        <Button
          variant={item.userProgress?.progress > 0 ? "outlined" : "contained"}
          fullWidth
          startIcon={item.userProgress?.isCompleted ? <CheckCircle /> : <PlayCircleOutline />}
          disabled={item.isLocked}
          onClick={() => handleCourseClick(item.id)}
        >
          {item.userProgress?.isCompleted ? 'Completed' : 
           item.userProgress?.progress > 0 ? 'Continue' : 'Start'}
        </Button>
      </CardContent>
    </Card>
  );
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" gutterBottom>Education Center</Typography>
        <TextField
          size="small"
          placeholder="Search content..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      
      <Tabs 
        value={tabValue} 
        onChange={handleTabChange} 
        sx={{ mb: 3 }}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab 
          label={
            <Badge badgeContent={content.length} color="primary">
              All Content
            </Badge>
          } 
        />
        <Tab 
          label={
            <Badge badgeContent={content.filter(item => item.type === 'course').length} color="primary">
              Courses
            </Badge>
          } 
        />
        <Tab 
          label={
            <Badge badgeContent={content.filter(item => item.type === 'webinar').length} color="secondary">
              Webinars
            </Badge>
          } 
        />
        <Tab 
          label={
            <Badge badgeContent={content.filter(item => item.type === 'article').length} color="info">
              Articles
            </Badge>
          } 
        />
        <Tab 
          label={
            <Badge badgeContent={savedCourses.length} color="warning">
              Saved
            </Badge>
          } 
        />
      </Tabs>

      <Grid container spacing={3}>
        {filteredContent.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <ContentCard item={item} />
          </Grid>
        ))}
      </Grid>

      {filteredContent.length === 0 && (
        <Box textAlign="center" py={4}>
          <School sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No content found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchQuery ? 'Try adjusting your search terms' : 'Check back later for new content'}
          </Typography>
        </Box>
      )}

      {/* Course Detail Dialog */}
      <Dialog 
        open={courseDialogOpen} 
        onClose={handleCloseCourseDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedCourse && (
          <>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">{selectedCourse.title}</Typography>
                <IconButton onClick={handleCloseCourseDialog}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box mb={3}>
                <Typography variant="body1" paragraph>
                  {selectedCourse.description}
                </Typography>
                
                <Box display="flex" gap={2} mb={3}>
                  <Chip
                    label={selectedCourse.level || 'Beginner'}
                    color={getLevelColor(selectedCourse.level || 'Beginner')}
                    size="small"
                  />
                  <Chip
                    label={selectedCourse.type}
                    color={getTypeColor(selectedCourse.type)}
                    size="small"
                  />
                  <Chip
                    label={selectedCourse.duration || '30 min'}
                    variant="outlined"
                    size="small"
                  />
                </Box>

                {selectedCourse.userProgress && (
                  <Box mb={3}>
                    <Typography variant="subtitle2" gutterBottom>
                      Your Progress: {selectedCourse.userProgress.progress || 0}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={selectedCourse.userProgress.progress || 0} 
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                )}
              </Box>

              {selectedCourse.lessons && selectedCourse.lessons.length > 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Course Content
                  </Typography>
                  <List>
                    {selectedCourse.lessons.map((lesson, index) => {
                      const isCompleted = selectedCourse.userProgress?.completedLessons?.includes(index);
                      return (
                        <React.Fragment key={index}>
                          <ListItem 
                            button 
                            onClick={() => handleStartLesson(index)}
                            sx={{ 
                              bgcolor: isCompleted ? 'action.selected' : 'transparent',
                              '&:hover': { bgcolor: 'action.hover' }
                            }}
                          >
                            <ListItemIcon>
                              {isCompleted ? 
                                <CheckCircleOutline color="success" /> : 
                                <PlayArrow color="primary" />
                              }
                            </ListItemIcon>
                            <ListItemText
                              primary={lesson.title || `Lesson ${index + 1}`}
                              secondary={lesson.description || lesson.duration || '10 min'}
                            />
                          </ListItem>
                          {index < selectedCourse.lessons.length - 1 && <Divider />}
                        </React.Fragment>
                      );
                    })}
                  </List>
                </Box>
              )}

              {selectedCourse.learningObjectives && selectedCourse.learningObjectives.length > 0 && (
                <Box mt={3}>
                  <Typography variant="h6" gutterBottom>
                    Learning Objectives
                  </Typography>
                  <List dense>
                    {selectedCourse.learningObjectives.map((objective, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <CheckCircleOutline color="primary" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={objective} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseCourseDialog}>
                Close
              </Button>
              <Button 
                variant="contained" 
                startIcon={<PlayCircleOutline />}
                onClick={() => {
                  if (selectedCourse.lessons && selectedCourse.lessons.length > 0) {
                    handleStartLesson(0);
                  }
                }}
                disabled={selectedCourse.userProgress?.isCompleted}
              >
                {selectedCourse.userProgress?.isCompleted ? 'Completed' : 
                 selectedCourse.userProgress?.progress > 0 ? 'Continue Learning' : 'Start Course'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default Education;
