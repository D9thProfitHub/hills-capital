import mongoose from 'mongoose';

const EducationContentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  content: {
    type: String,
    required: [true, 'Please add content']
  },
  type: {
    type: String,
    required: [true, 'Please specify content type'],
    enum: ['course', 'webinar', 'article', 'quiz']
  },
  level: {
    type: String,
    required: [true, 'Please specify difficulty level'],
    enum: ['Beginner', 'Intermediate', 'Advanced']
  },
  duration: {
    type: Number, // in minutes for courses/webinars, reading time for articles
    required: function() {
      return this.type === 'course' || this.type === 'webinar';
    }
  },
  readTime: {
    type: Number, // in minutes for articles
    required: function() {
      return this.type === 'article';
    }
  },
  thumbnail: {
    type: String,
    default: 'https://picsum.photos/300/200'
  },
  videoUrl: {
    type: String,
    required: function() {
      return this.type === 'course' || this.type === 'webinar';
    }
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  enrollments: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  attempts: {
    type: Number,
    default: 0
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot be more than 5']
    },
    count: {
      type: Number,
      default: 0
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  prerequisites: [{
    type: mongoose.Schema.ObjectId,
    ref: 'EducationContent'
  }],
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  // Quiz specific fields
  questions: [{
    question: {
      type: String,
      required: function() {
        return this.parent().type === 'quiz';
      }
    },
    options: [{
      text: String,
      isCorrect: Boolean
    }],
    explanation: String
  }],
  passingScore: {
    type: Number,
    required: function() {
      return this.type === 'quiz';
    },
    min: [0, 'Passing score cannot be negative'],
    max: [100, 'Passing score cannot exceed 100']
  },
  // Webinar specific fields
  scheduledDate: {
    type: Date,
    required: function() {
      return this.type === 'webinar';
    }
  },
  meetingLink: {
    type: String,
    required: function() {
      return this.type === 'webinar';
    }
  }
}, {
  timestamps: true
});

// Populate creator info
EducationContentSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'createdBy',
    select: 'firstName lastName email'
  }).populate({
    path: 'prerequisites',
    select: 'title type level'
  });
  
  next();
});

// Update view count
EducationContentSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Update enrollment count
EducationContentSchema.methods.incrementEnrollments = function() {
  this.enrollments += 1;
  return this.save();
};

// Update quiz attempts
EducationContentSchema.methods.incrementAttempts = function() {
  this.attempts += 1;
  return this.save();
};

export default mongoose.model('EducationContent', EducationContentSchema);
