import models from '../models/index.js';

const { EducationContent } = models;

const sampleEducationContent = [
  {
    title: 'Introduction to Trading',
    description: 'Learn the basics of trading and market analysis. Perfect for beginners starting their trading journey.',
    content: JSON.stringify([
      { 
        id: 1, 
        title: 'What is Trading?', 
        duration: '15m', 
        videoUrl: 'https://example.com/video1',
        description: 'Introduction to trading concepts and terminology.'
      },
      { 
        id: 2, 
        title: 'Market Basics', 
        duration: '20m', 
        videoUrl: 'https://example.com/video2',
        description: 'Understanding market structure and participants.'
      },
      { 
        id: 3, 
        title: 'Risk Management', 
        duration: '25m', 
        videoUrl: 'https://example.com/video3',
        description: 'Learn how to manage risk in your trading.'
      }
    ]),
    type: 'course',
    level: 'Beginner',
    duration: 135, // 2h 15m in minutes
    lessons: 3,
    thumbnail: 'https://picsum.photos/400/250?random=1',
    isPublished: true,
    isLocked: false,
    requiredSubscriptionLevel: 'free',
    learningObjectives: ['Understand basic trading concepts', 'Learn market fundamentals', 'Master risk management'],
    prerequisites: [],
    tags: ['trading', 'basics', 'beginner'],
    views: 1250,
    enrollments: 890,
    rating: 4.5,
    ratingCount: 156
  },
  {
    title: 'Technical Analysis Fundamentals',
    description: 'Master chart reading and technical indicators to make informed trading decisions.',
    content: JSON.stringify([
      { 
        id: 1, 
        title: 'Chart Patterns', 
        duration: '30m', 
        videoUrl: 'https://example.com/video4',
        description: 'Learn to identify and trade chart patterns.'
      },
      { 
        id: 2, 
        title: 'Support and Resistance', 
        duration: '25m', 
        videoUrl: 'https://example.com/video5',
        description: 'Understanding key price levels.'
      },
      { 
        id: 3, 
        title: 'Moving Averages', 
        duration: '20m', 
        videoUrl: 'https://example.com/video6',
        description: 'Using moving averages for trend analysis.'
      },
      { 
        id: 4, 
        title: 'RSI and MACD', 
        duration: '35m', 
        videoUrl: 'https://example.com/video7',
        description: 'Popular momentum indicators explained.'
      }
    ]),
    type: 'course',
    level: 'Intermediate',
    duration: 270, // 4h 30m in minutes
    lessons: 4,
    thumbnail: 'https://picsum.photos/400/250?random=2',
    isPublished: true,
    isLocked: false,
    requiredSubscriptionLevel: 'basic',
    learningObjectives: ['Read charts effectively', 'Use technical indicators', 'Identify trading opportunities'],
    prerequisites: ['Basic trading knowledge'],
    tags: ['technical analysis', 'charts', 'indicators'],
    views: 980,
    enrollments: 567,
    rating: 4.7,
    ratingCount: 89
  },
  {
    title: 'Cryptocurrency Trading',
    description: 'Understand digital assets and crypto markets. Advanced strategies for crypto trading.',
    content: JSON.stringify([
      { 
        id: 1, 
        title: 'Blockchain Basics', 
        duration: '40m', 
        videoUrl: 'https://example.com/video8',
        description: 'Understanding blockchain technology.'
      },
      { 
        id: 2, 
        title: 'Crypto Market Structure', 
        duration: '35m', 
        videoUrl: 'https://example.com/video9',
        description: 'How crypto markets work.'
      },
      { 
        id: 3, 
        title: 'DeFi and Yield Farming', 
        duration: '45m', 
        videoUrl: 'https://example.com/video10',
        description: 'Decentralized finance opportunities.'
      }
    ]),
    type: 'course',
    level: 'Advanced',
    duration: 405, // 6h 45m in minutes
    lessons: 3,
    thumbnail: 'https://picsum.photos/400/250?random=3',
    isPublished: true,
    isLocked: true,
    requiredSubscriptionLevel: 'premium',
    learningObjectives: ['Understand blockchain technology', 'Trade cryptocurrencies', 'Use DeFi protocols'],
    prerequisites: ['Technical analysis knowledge', 'Risk management skills'],
    tags: ['cryptocurrency', 'blockchain', 'defi'],
    views: 456,
    enrollments: 234,
    rating: 4.8,
    ratingCount: 45
  },
  {
    title: 'Market Outlook 2025',
    description: 'Join our experts for market predictions and strategies for the upcoming year.',
    type: 'webinar',
    level: 'Intermediate',
    duration: 60, // 60 minutes
    thumbnail: 'https://picsum.photos/400/250?random=5',
    isPublished: true,
    isLocked: false,
    requiredSubscriptionLevel: 'free',
    scheduledDate: new Date('2025-08-15T14:00:00'),
    speaker: 'John Smith, Senior Market Analyst',
    meetingLink: 'https://zoom.us/j/123456789',
    maxAttendees: 500,
    tags: ['webinar', 'market outlook', 'predictions'],
    views: 2340,
    enrollments: 245,
    rating: 4.6,
    ratingCount: 78
  },
  {
    title: 'Risk Management Strategies',
    description: 'Learn how to protect your capital in volatile markets with proven risk management techniques.',
    type: 'webinar',
    level: 'Beginner',
    duration: 45, // 45 minutes
    thumbnail: 'https://picsum.photos/400/250?random=6',
    isPublished: true,
    isLocked: false,
    requiredSubscriptionLevel: 'basic',
    scheduledDate: new Date('2025-08-22T16:00:00'),
    speaker: 'Sarah Johnson, Risk Management Specialist',
    meetingLink: 'https://zoom.us/j/987654321',
    maxAttendees: 300,
    tags: ['webinar', 'risk management', 'capital protection'],
    views: 1890,
    enrollments: 189,
    rating: 4.4,
    ratingCount: 56
  },
  {
    title: 'Options Trading Masterclass',
    description: 'Advanced options strategies for experienced traders looking to diversify their portfolio.',
    content: JSON.stringify([
      { 
        id: 1, 
        title: 'Options Basics', 
        duration: '50m', 
        videoUrl: 'https://example.com/video11',
        description: 'Understanding calls and puts.'
      },
      { 
        id: 2, 
        title: 'Spreads and Straddles', 
        duration: '60m', 
        videoUrl: 'https://example.com/video12',
        description: 'Complex options strategies.'
      }
    ]),
    type: 'course',
    level: 'Advanced',
    duration: 480, // 8 hours in minutes
    lessons: 2,
    thumbnail: 'https://picsum.photos/400/250?random=7',
    isPublished: true,
    isLocked: true,
    requiredSubscriptionLevel: 'vip',
    learningObjectives: ['Master options trading', 'Use advanced strategies', 'Manage options risk'],
    prerequisites: ['Advanced trading experience', 'Technical analysis skills'],
    tags: ['options', 'derivatives', 'advanced'],
    views: 678,
    enrollments: 123,
    rating: 4.9,
    ratingCount: 34
  }
];

export const seedEducationContent = async () => {
  try {
    console.log('Seeding education content...');
    
    // Clear existing education content
    await EducationContent.destroy({ where: {} });
    
    // Insert sample data
    const createdContent = await EducationContent.bulkCreate(sampleEducationContent);
    
    console.log(`Successfully seeded ${createdContent.length} education content items`);
    return createdContent;
  } catch (error) {
    console.error('Error seeding education content:', error);
    throw error;
  }
};

export default seedEducationContent;
