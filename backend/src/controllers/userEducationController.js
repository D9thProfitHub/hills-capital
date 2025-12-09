import asyncHandler from '../middleware/async.js';
import models from '../models/index.js';

const { EducationContent, UserEducationProgress, User } = models;

// @desc    Test endpoint to get education content without authentication
// @route   GET /api/education/test
// @access  Public
export const getEducationTest = asyncHandler(async (req, res, next) => {
  try {
    // Get all published education content
    const educationContent = await EducationContent.findAll({
      where: {
        isPublished: true
      },
      attributes: [
        'id', 'title', 'description', 'type', 'isPublished', 'createdAt', 'updatedAt'
      ],
      order: [['createdAt', 'DESC']]
    });

    console.log('Found education content:', educationContent.length, 'items');

    res.status(200).json({
      success: true,
      count: educationContent.length,
      data: educationContent
    });
  } catch (error) {
    console.error('Error in getEducationTest:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching education content',
      error: error.message
    });
  }
});

// @desc    Get education content for users
// @route   GET /api/users/education
// @access  Private
export const getUserEducation = asyncHandler(async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get all published education content
    const educationContent = await EducationContent.findAll({
      where: {
        isPublished: true
      },
      attributes: [
        'id', 'title', 'description', 'type', 'isPublished', 'createdAt', 'updatedAt'
      ],
      order: [['createdAt', 'DESC']]
    });

    // Get user's progress for each content
    const userProgress = await UserEducationProgress.findAll({
      where: {
        userId: userId
      },
      attributes: ['educationContentId', 'progress', 'isCompleted']
    });

    // Create a map for quick lookup of user progress
    const progressMap = {};
    userProgress.forEach(progress => {
      progressMap[progress.educationContentId] = progress;
    });

    // Format the response data
    const formattedContent = educationContent.map(content => {
      const userProgressData = progressMap[content.id];
      
      return {
        id: content.id,
        title: content.title,
        description: content.description,
        type: content.type,
        level: 'Beginner', // Default level since not in DB
        duration: content.type === 'webinar' ? '60 min' : '2h 30m', // Default duration
        lessons: 5, // Default lessons count
        progress: userProgressData ? userProgressData.progress : 0,
        thumbnail: `https://picsum.photos/400/250?random=${content.id}`,
        isLocked: false, // Default to unlocked
        isCompleted: userProgressData ? userProgressData.isCompleted : false,
        isSaved: false, // Default to not saved since column doesn't exist
        // Webinar specific fields
        ...(content.type === 'webinar' && {
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Default to next week
          speaker: 'Expert Analyst', // Default speaker
          isRegistered: userProgressData ? userProgressData.progress > 0 : false,
          attendees: 150 // Default attendee count
        }),
        // Additional metadata
        views: Math.floor(Math.random() * 1000) + 100, // Random view count
        rating: (4.0 + Math.random()).toFixed(1), // Random rating 4.0-5.0
        tags: ['Trading', 'Education'], // Default tags
        lastAccessed: null // Not available in current schema
      };
    });

    res.status(200).json({
      success: true,
      count: formattedContent.length,
      data: formattedContent
    });
  } catch (error) {
    console.error('Error fetching user education content:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching education content' 
    });
  }
});

// @route   GET /api/users/education/:id
// @access  Private
export const getUserCourse = asyncHandler(async (req, res, next) => {
  try {
    const courseId = parseInt(req.params.id);
    const userId = req.user.id;
    
    // Get the education content from database
    const course = await EducationContent.findByPk(courseId, {
      attributes: [
        'id', 'title', 'description', 'type', 'isPublished', 'createdAt', 'updatedAt'
      ]
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Get user's progress for this course
    const userProgress = await UserEducationProgress.findOne({
      where: {
        userId: userId,
        educationContentId: courseId
      }
    });

    // Create mock lessons data since we don't have detailed content in the database yet
    const mockLessons = [
      {
        id: 1,
        title: `${course.title} - Introduction`,
        description: 'Learn the fundamentals and get started',
        duration: '15 min',
        videoUrl: 'https://example.com/video1'
      },
      {
        id: 2,
        title: `${course.title} - Core Concepts`,
        description: 'Understand the key principles',
        duration: '20 min',
        videoUrl: 'https://example.com/video2'
      },
      {
        id: 3,
        title: `${course.title} - Practical Application`,
        description: 'Apply what you have learned',
        duration: '25 min',
        videoUrl: 'https://example.com/video3'
      }
    ];

    // Mark completed lessons based on user progress
    const completedLessons = userProgress ? userProgress.completedLessons || [] : [];
    const formattedLessons = mockLessons.map((lesson, index) => ({
      ...lesson,
      completed: completedLessons.includes(index)
    }));

    const formattedCourse = {
      id: course.id,
      title: course.title,
      description: course.description,
      type: course.type,
      level: 'Beginner', // Default level since not in database
      duration: course.type === 'webinar' ? '60 min' : '2h 30m', // Mock duration
      lessons: formattedLessons,
      thumbnail: `https://picsum.photos/400/250?random=${course.id}`,
      isLocked: false, // Default to unlocked
      videoUrl: 'https://example.com/course-intro',
      learningObjectives: [
        `Master the fundamentals of ${course.title}`,
        'Apply practical techniques',
        'Build confidence in the subject'
      ],
      prerequisites: ['Basic understanding of trading concepts'],
      views: Math.floor(Math.random() * 1000) + 100, // Mock view count
      rating: (Math.random() * 2 + 3).toFixed(1), // Mock rating between 3.0-5.0
      progress: userProgress ? userProgress.progress : 0,
      isCompleted: userProgress ? userProgress.isCompleted : false
    };

    res.status(200).json({
      success: true,
      data: formattedCourse
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching course' 
    });
  }
});

// @desc    Update course progress
// @route   PUT /api/users/education/:id/progress
// @access  Private
export const updateCourseProgress = asyncHandler(async (req, res, next) => {
  try {
    const courseId = parseInt(req.params.id);
    const { lessonId, completed, progress } = req.body;
    const userId = req.user.id;

    // Verify the course exists
    const course = await EducationContent.findByPk(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Find or create user progress record
    let [userProgress, created] = await UserEducationProgress.findOrCreate({
      where: {
        userId: userId,
        educationContentId: courseId
      },
      defaults: {
        progress: 0,
        completedLessons: [],
        isCompleted: false,
        timeSpent: 0
      }
    });

    // Update lesson completion if lessonId is provided
    if (lessonId !== undefined) {
      let completedLessons = userProgress.completedLessons || [];
      
      if (completed) {
        // Add lesson to completed list if not already there
        if (!completedLessons.includes(lessonId)) {
          completedLessons.push(lessonId);
        }
      } else {
        // Remove lesson from completed list
        completedLessons = completedLessons.filter(id => id !== lessonId);
      }
      
      // Calculate progress based on completed lessons (assuming 3 lessons per course)
      const totalLessons = 3;
      const calculatedProgress = Math.round((completedLessons.length / totalLessons) * 100);
      
      await userProgress.update({
        completedLessons,
        progress: calculatedProgress,
        lastAccessedAt: new Date()
      });
    }

    // Update overall progress if provided
    if (progress !== undefined) {
      const updateData = {
        progress: Math.min(100, Math.max(0, progress)),
        lastAccessedAt: new Date()
      };

      // Mark as completed if progress reaches 100%
      if (updateData.progress >= 100) {
        updateData.isCompleted = true;
        updateData.completedAt = new Date();
        
        // Mark completion timestamp if this is the first completion
        if (!userProgress.isCompleted) {
          console.log(`User ${userId} completed course ${courseId}`);
        }
      }

      await userProgress.update(updateData);
    }

    // Reload to get updated data
    await userProgress.reload();

    res.status(200).json({
      success: true,
      message: 'Progress updated successfully',
      data: {
        courseId,
        lessonId,
        completed,
        progress: userProgress.progress,
        isCompleted: userProgress.isCompleted,
        completedLessons: userProgress.completedLessons,
        updatedAt: userProgress.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating course progress:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating progress' 
    });
  }
});
