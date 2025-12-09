import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Badge,
  Avatar,
  Switch,
  FormControlLabel,
  CardMedia
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  School,
  VideoLibrary,
  Article,
  Quiz,
  Upload,
  PlayCircle
} from '@mui/icons-material';

const EducationManagement = () => {
  const [content, setContent] = useState([]);
  const [filteredContent, setFilteredContent] = useState([]);
  const [selectedContent, setSelectedContent] = useState({
    title: '',
    description: '',
    type: 'course',
    level: 'Beginner',
    duration: '',
    lessons: 0,
    isPublished: false,
    thumbnail: '',
    instructor: ''
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('add'); // 'add', 'edit', 'view'
  const [contentTypeFilter, setContentTypeFilter] = useState('all');
  const [tabValue, setTabValue] = useState(0);

  // Calculate counts for each content type
  const counts = {
    all: content.length,
    course: content.filter(item => item.type === 'course').length,
    webinar: content.filter(item => item.type === 'webinar').length,
    article: content.filter(item => item.type === 'article').length,
    quiz: content.filter(item => item.type === 'quiz').length
  };

  useEffect(() => {
    fetchEducationContent();
  }, []);

  useEffect(() => {
    filterContent();
  }, [content, contentTypeFilter]);

  const fetchEducationContent = async () => {
    try {
      console.log('Fetching education content...');
      const token = localStorage.getItem('token');
      const res = await fetch('https://api.hillscapitaltrade.com/api/admin/education-content', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch education content');
      const data = await res.json();
      console.log('Fetched education content:', data);
      console.log('Setting content to:', data.data);
      setContent(data.data || []);
    } catch (error) {
      console.error('Error fetching education content:', error);
    }
  };

  const filterContent = () => {
    console.log('Filtering content. Content:', content, 'Filter:', contentTypeFilter);
    if (contentTypeFilter === 'all') {
      setFilteredContent(content);
      console.log('Set filtered content to all:', content);
    } else {
      const filtered = content.filter(item => item.type === contentTypeFilter);
      setFilteredContent(filtered);
      console.log('Set filtered content to:', filtered);
    }
  };

  const handleOpenDialog = (type, contentItem = null) => {
    setDialogType(type);
    setSelectedContent(contentItem || {
      title: '',
      description: '',
      type: 'course',
      level: 'Beginner',
      duration: '',
      lessons: 0,
      isPublished: false,
      thumbnail: '',
      instructor: ''
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedContent({
      title: '',
      description: '',
      type: 'course',
      level: 'Beginner',
      duration: '',
      lessons: 0,
      isPublished: false,
      thumbnail: '',
      instructor: ''
    });
  };

  const handleSaveContent = async () => {
    try {
      const token = localStorage.getItem('token');
      if (dialogType === 'add') {
        const res = await fetch('https://api.hillscapitaltrade.com/api/admin/education-content', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(selectedContent)
        });
        if (!res.ok) throw new Error('Failed to add content');
        await fetchEducationContent();
        handleCloseDialog();
      } else if (dialogType === 'edit') {
        const res = await fetch(`https://api.hillscapitaltrade.com/api/admin/education-content/${selectedContent.id}` , {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(selectedContent)
        });
        if (!res.ok) throw new Error('Failed to update content');
        await fetchEducationContent();
        handleCloseDialog();
      }

    } catch (error) {
      console.error('Error saving content:', error);
    }
  };

  const handleDeleteContent = async (contentId) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`https://api.hillscapitaltrade.com/api/admin/education-content/${contentId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to delete content');
        await fetchEducationContent();
      } catch (error) {
        console.error('Error deleting content:', error);
      }
    }
  };

  const handleTogglePublish = async (contentId) => {
    try {
      const token = localStorage.getItem('token');
      const item = content.find(item => item.id === contentId);
      const res = await fetch(`https://api.hillscapitaltrade.com/api/admin/education-content/${contentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isPublished: !item.isPublished })
      });
      if (!res.ok) throw new Error('Failed to toggle publish status');
      await fetchEducationContent();
    } catch (error) {
      console.error('Error toggling publish:', error);
    }
  };

  const getLevelColor = (level) => {
    // Handle undefined or null level values
    if (!level) {
      return 'default';
    }
    
    switch (level.toLowerCase()) {
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
        image={item.thumbnail}
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
          <Chip
            label={item.isPublished ? 'Published' : 'Draft'}
            color={item.isPublished ? 'success' : 'default'}
            size="small"
          />
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
            {item.duration || item.readTime}
          </Typography>
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="body2">
            {item.type === 'course' && `${item.enrollments} enrolled`}
            {item.type === 'webinar' && `${item.registrations}/${item.maxAttendees} registered`}
            {item.type === 'article' && `${item.views} views`}
            {item.type === 'quiz' && `${item.attempts} attempts`}
          </Typography>
          {item.rating && (
            <Typography variant="body2" color="primary">
              ⭐ {item.rating}
            </Typography>
          )}
        </Box>

        <Box display="flex" gap={1}>
          <IconButton
            size="small"
            onClick={() => handleOpenDialog('view', item)}
          >
            <Visibility />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleOpenDialog('edit', item)}
          >
            <Edit />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleTogglePublish(item.id)}
            color={item.isPublished ? 'error' : 'success'}
          >
            {item.isPublished ? 'Unpublish' : 'Publish'}
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDeleteContent(item.id)}
            color="error"
          >
            <Delete />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Education Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog('add')}
        >
          Add New Content
        </Button>
      </Box>

      {/* Content Type Filter Tabs */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => {
              setTabValue(newValue);
              const types = ['all', 'course', 'webinar', 'article', 'quiz'];
              setContentTypeFilter(types[newValue]);
            }}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab 
              label={
                <Badge badgeContent={counts.all} color="primary">
                  All Content
                </Badge>
              } 
            />
            <Tab 
              label={
                <Badge badgeContent={counts.course} color="primary">
                  Courses
                </Badge>
              } 
            />
            <Tab 
              label={
                <Badge badgeContent={counts.webinar} color="secondary">
                  Webinars
                </Badge>
              } 
            />
            <Tab 
              label={
                <Badge badgeContent={counts.article} color="info">
                  Articles
                </Badge>
              } 
            />
            <Tab 
              label={
                <Badge badgeContent={counts.quiz} color="warning">
                  Quizzes
                </Badge>
              } 
            />
          </Tabs>
        </CardContent>
      </Card>

      {/* Content Grid */}
      <Grid container spacing={3}>
        {filteredContent.map((item) => (
          <Grid item xs={12} md={6} lg={4} key={item.id}>
            <ContentCard item={item} />
          </Grid>
        ))}
      </Grid>

      {/* Content Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogType === 'add' ? 'Add New Content' : 
           dialogType === 'edit' ? 'Edit Content' : 'Content Details'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  value={selectedContent.title}
                  onChange={(e) => setSelectedContent({...selectedContent, title: e.target.value})}
                  disabled={dialogType === 'view'}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={selectedContent.description}
                  onChange={(e) => setSelectedContent({...selectedContent, description: e.target.value})}
                  disabled={dialogType === 'view'}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth disabled={dialogType === 'view'}>
                  <InputLabel>Content Type</InputLabel>
                  <Select
                    value={selectedContent.type}
                    onChange={(e) => setSelectedContent({...selectedContent, type: e.target.value})}
                  >
                    <MenuItem value="course">Course</MenuItem>
                    <MenuItem value="webinar">Webinar</MenuItem>
                    <MenuItem value="article">Article</MenuItem>
                    <MenuItem value="quiz">Quiz</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth disabled={dialogType === 'view'}>
                  <InputLabel>Level</InputLabel>
                  <Select
                    value={selectedContent.level}
                    onChange={(e) => setSelectedContent({...selectedContent, level: e.target.value})}
                  >
                    <MenuItem value="Beginner">Beginner</MenuItem>
                    <MenuItem value="Intermediate">Intermediate</MenuItem>
                    <MenuItem value="Advanced">Advanced</MenuItem>
                    <MenuItem value="All Levels">All Levels</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Duration"
                  value={selectedContent.duration}
                  onChange={(e) => setSelectedContent({...selectedContent, duration: e.target.value})}
                  disabled={dialogType === 'view'}
                  placeholder="e.g., 2 hours, 30 min"
                />
              </Grid>
              {selectedContent.type === 'course' && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Number of Lessons"
                    type="number"
                    value={selectedContent.lessons}
                    onChange={(e) => setSelectedContent({...selectedContent, lessons: Number(e.target.value)})}
                    disabled={dialogType === 'view'}
                  />
                </Grid>
              )}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Instructor/Author"
                  value={selectedContent.instructor || selectedContent.author}
                  onChange={(e) => setSelectedContent({
                    ...selectedContent, 
                    [selectedContent.type === 'course' || selectedContent.type === 'webinar' ? 'instructor' : 'author']: e.target.value
                  })}
                  disabled={dialogType === 'view'}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Thumbnail URL"
                  value={selectedContent.thumbnail}
                  onChange={(e) => setSelectedContent({...selectedContent, thumbnail: e.target.value})}
                  disabled={dialogType === 'view'}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={selectedContent.isPublished}
                      onChange={(e) => setSelectedContent({...selectedContent, isPublished: e.target.checked})}
                      disabled={dialogType === 'view'}
                    />
                  }
                  label="Published"
                />
              </Grid>
            </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            {dialogType === 'view' ? 'Close' : 'Cancel'}
          </Button>
          {dialogType !== 'view' && (
            <Button onClick={handleSaveContent} variant="contained">
              {dialogType === 'add' ? 'Add Content' : 'Save Changes'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EducationManagement;
