import { v4 as uuidv4 } from 'uuid';


export const mockEvents = [
  {
    id: 'event-1',
    title: 'Sunset Yoga Retreat',
    description: 'Join us for a peaceful yoga session as the sun sets over the mountains. Perfect for beginners and experienced practitioners alike. We will practice various yoga poses, meditation techniques, and breathing exercises while enjoying the beautiful natural scenery. Bring your own yoga mat, water bottle, and comfortable clothing. The session will be led by certified yoga instructor Sarah Chen who has over 10 years of experience in teaching yoga and mindfulness.',
    location: { 
      lat: 34.0522, 
      lng: -118.2437, 
      name: 'Griffith Park, Los Angeles',
      address: '2800 E Observatory Rd, Los Angeles, CA 90027'
    },
    media: [
      { 
        id: 'media-1', 
        url: 'resources/images/art-gallery.jpg', 
        type: 'image',
        title: 'Sunset Yoga Session',
        description: 'Beautiful sunset yoga session'
      },
      { 
        id: 'media-2', 
        url: 'resources/images/city-skyline.jpg', 
        type: 'image',
        title: 'City View',
        description: 'Amazing city skyline view'
      }
    ],
    owner: { 
      id: 'user-1', 
      name: 'Sarah Chen', 
      avatar: 'resources/images/user1.png',
      bio: 'Certified Yoga Instructor with 10+ years experience',
      followers: 1234,
      following: 567
    },
    participants: [
      { id: 'user-2', name: 'Marcus Johnson', avatar: 'resources/images/user2.png' },
      { id: 'user-3', name: 'Elena Rodriguez', avatar: 'resources/images/user3.png' },
      { id: 'user-4', name: 'David Kim', avatar: 'resources/images/user4.png' }
    ],
    category: 'wellness',
    tags: ['yoga', 'meditation', 'wellness', 'outdoor', 'sunset'],
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
    duration: '2h',
    capacity: 50,
    price: 0,
    likes: 24,
    comments: [
      { 
        id: 'comment-1',
        user: 'Marcus Johnson', 
        text: 'Can\'t wait for this! 🧘‍♀️ The sunset views are always amazing from Griffith Park.', 
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        likes: 5,
        replies: []
      },
      { 
        id: 'comment-2',
        user: 'Elena Rodriguez', 
        text: 'The sunset views are amazing there! Perfect spot for yoga practice.',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        likes: 3,
        replies: []
      },
      { 
        id: 'comment-3',
        user: 'David Kim',
        text: 'Do we need to bring our own mats?',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        likes: 1,
        replies: [
          {
            id: 'reply-1',
            user: 'Sarah Chen',
            text: 'Yes, please bring your own mat!',
            timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString()
          }
        ]
      }
    ],
    isPublic: true,
    requiresApproval: false
  },
  {
    id: 'event-2',
    title: 'Tech Startup Pitch Night',
    description: 'Watch innovative startups present their ideas to a panel of VCs and industry experts. This is a great opportunity for entrepreneurs to showcase their innovations and get valuable feedback from experienced investors. The event will feature 10 startups presenting their pitches, followed by a networking session with refreshments. Whether you\'re an entrepreneur, investor, or just interested in the startup ecosystem, this event is perfect for you.',
    location: { 
      lat: 37.7749, 
      lng: -122.4194, 
      name: 'San Francisco Innovation Hub',
      address: '123 Market St, San Francisco, CA 94105'
    },
    media: [
      { 
        id: 'media-3', 
        url: 'resources/images/startup-pitch.jpg', 
        type: 'image',
        title: 'Pitch Presentation',
        description: 'Startup pitch presentation'
      }
    ],
    owner: { 
      id: 'user-2', 
      name: 'Marcus Johnson', 
      avatar: 'resources/images/user2.png',
      bio: 'Tech Entrepreneur & Investor',
      followers: 2341,
      following: 432
    },
    participants: [
      { id: 'user-1', name: 'Sarah Chen', avatar: 'resources/images/user1.png' },
      { id: 'user-4', name: 'David Kim', avatar: 'resources/images/user4.png' }
    ],
    category: 'technology',
    tags: ['startup', 'pitch', 'technology', 'investment', 'networking'],
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    duration: '3h',
    capacity: 200,
    price: 25,
    likes: 18,
    comments: [
      { 
        id: 'comment-4',
        user: 'Sarah Chen', 
        text: 'Great opportunity for entrepreneurs! Looking forward to seeing the innovative ideas.',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        likes: 8,
        replies: []
      }
    ],
    isPublic: true,
    requiresApproval: false
  },
  {
    id: 'event-3',
    title: 'Contemporary Art Exhibition Opening',
    description: 'Experience the latest works from emerging local artists at our contemporary art exhibition opening. This curated collection features paintings, sculptures, installations, and digital art from over 20 talented artists. Free wine and appetizers will be served during the opening reception. Meet the artists, discuss their work, and be among the first to see these incredible pieces. The exhibition will run for 3 weeks following the opening.',
    location: { 
      lat: 40.7128, 
      lng: -74.0060, 
      name: 'MoMA PS1, New York',
      address: '22-25 Jackson Ave, Queens, NY 11101'
    },
    media: [
      { 
        id: 'media-4', 
        url: 'resources/images/art-gallery.jpg', 
        type: 'image',
        title: 'Gallery Space',
        description: 'Modern gallery space with artwork'
      }
    ],
    owner: { 
      id: 'user-3', 
      name: 'Elena Rodriguez', 
      avatar: 'resources/images/user3.png',
      bio: 'Art Curator & Gallery Director',
      followers: 3456,
      following: 789
    },
    participants: [
      { id: 'user-1', name: 'Sarah Chen', avatar: 'resources/images/user1.png' },
      { id: 'user-2', name: 'Marcus Johnson', avatar: 'resources/images/user2.png' }
    ],
    category: 'arts',
    tags: ['art', 'exhibition', 'gallery', 'contemporary', 'opening'],
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    duration: '4h',
    capacity: 300,
    price: 0,
    likes: 31,
    comments: [
      { 
        id: 'comment-5',
        user: 'Marcus Johnson', 
        text: 'The installations look incredible! Can\'t wait to see the full exhibition.',
        timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
        likes: 12,
        replies: []
      },
      { 
        id: 'comment-6',
        user: 'Sarah Chen', 
        text: 'Love supporting local artists! 🎨 The diversity of styles is amazing.',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        likes: 15,
        replies: []
      }
    ],
    isPublic: true,
    requiresApproval: false
  },
  {
    id: 'event-4',
    title: 'Garden Wedding Celebration',
    description: 'Beautiful outdoor wedding ceremony followed by reception in a stunning garden setting. Join us as we celebrate the union of two amazing people in the most romantic garden venue in the city. The ceremony will take place in the rose garden followed by a reception under the stars. Live music, gourmet catering, and dancing until late. This will be an unforgettable celebration of love.',
    location: { 
      lat: 34.0522, 
      lng: -118.2437, 
      name: 'Huntington Library Gardens',
      address: '1151 Oxford Rd, San Marino, CA 91108'
    },
    media: [
      { 
        id: 'media-5', 
        url: 'resources/images/outdoor-wedding.jpg', 
        type: 'image',
        title: 'Garden Ceremony',
        description: 'Beautiful garden wedding ceremony'
      }
    ],
    owner: { 
      id: 'user-4', 
      name: 'David Kim', 
      avatar: 'resources/images/user4.png',
      bio: 'Wedding Planner & Event Coordinator',
      followers: 987,
      following: 654
    },
    participants: [
      { id: 'user-1', name: 'Sarah Chen', avatar: 'resources/images/user1.png' },
      { id: 'user-2', name: 'Marcus Johnson', avatar: 'resources/images/user2.png' },
      { id: 'user-3', name: 'Elena Rodriguez', avatar: 'resources/images/user3.png' }
    ],
    category: 'celebration',
    tags: ['wedding', 'celebration', 'garden', 'love', 'ceremony'],
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 'full-day',
    capacity: 150,
    price: 0,
    likes: 45,
    comments: [
      { 
        id: 'comment-7',
        user: 'Sarah Chen', 
        text: 'Congratulations! Such a beautiful venue 💕 Wishing you both a lifetime of happiness!',
        timestamp: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString(),
        likes: 28,
        replies: []
      },
      { 
        id: 'comment-8',
        user: 'Elena Rodriguez', 
        text: 'Wishing you both a lifetime of happiness! The garden looks absolutely magical.',
        timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
        likes: 22,
        replies: []
      }
    ],
    isPublic: false,
    requiresApproval: true
  },
  {
    id: 'event-5',
    title: 'Photography Workshop',
    description: 'Learn professional photography techniques from award-winning photographer. This hands-on workshop will cover composition, lighting, editing, and more. Bring your own camera (DSLR or mirrorless preferred) and learn from the best. The workshop includes both classroom instruction and outdoor practice sessions. Perfect for beginners looking to improve their skills or intermediate photographers wanting to take their work to the next level.',
    location: { 
      lat: 37.7749, 
      lng: -122.4194, 
      name: 'Golden Gate Park',
      address: 'Golden Gate Park, San Francisco, CA'
    },
    media: [
      { 
        id: 'media-6', 
        url: 'resources/images/photography-workshop.jpg', 
        type: 'image',
        title: 'Workshop Session',
        description: 'Photography workshop in action'
      },
      { 
        id: 'media-7', 
        url: 'resources/images/park-public-space.jpg', 
        type: 'image',
        title: 'Park Location',
        description: 'Beautiful park setting for photography'
      }
    ],
    owner: { 
      id: 'user-1', 
      name: 'Sarah Chen', 
      avatar: 'resources/images/user1.png',
      bio: 'Professional Photographer & Instructor',
      followers: 1234,
      following: 567
    },
    participants: [
      { id: 'user-3', name: 'Elena Rodriguez', avatar: 'resources/images/user3.png' },
      { id: 'user-4', name: 'David Kim', avatar: 'resources/images/user4.png' }
    ],
    category: 'education',
    tags: ['photography', 'workshop', 'education', 'skills', 'camera'],
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    duration: '6h',
    capacity: 20,
    price: 150,
    likes: 16,
    comments: [
      { 
        id: 'comment-9',
        user: 'Elena Rodriguez', 
        text: 'Perfect timing for spring photography! 📸 Can\'t wait to learn new techniques.',
        timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
        likes: 9,
        replies: []
      }
    ],
    isPublic: true,
    requiresApproval: false
  }
];

export const mockUsers = [
  {
    id: 'user-1',
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    avatar: 'resources/images/user1.png',
    bio: 'Event enthusiast & community builder',
    role: 'contributor',
    followers: 1234,
    following: 567,
    eventsCreated: 24,
    eventsAttended: 156,
    location: 'San Francisco, CA',
    joinedDate: '2024-03-15',
    isVerified: true,
    generation: 0
  },
  {
    id: 'user-2',
    name: 'Marcus Johnson',
    email: 'marcus@example.com',
    avatar: 'resources/images/user2.png',
    bio: 'Tech Entrepreneur & Investor',
    role: 'contributor',
    followers: 2341,
    following: 432,
    eventsCreated: 18,
    eventsAttended: 89,
    location: 'San Francisco, CA',
    joinedDate: '2024-02-20',
    isVerified: true,
    generation: 0
  },
  {
    id: 'user-3',
    name: 'Elena Rodriguez',
    email: 'elena@example.com',
    avatar: 'resources/images/user3.png',
    bio: 'Art Curator & Gallery Director',
    role: 'contributor',
    followers: 3456,
    following: 789,
    eventsCreated: 31,
    eventsAttended: 234,
    location: 'New York, NY',
    joinedDate: '2024-01-10',
    isVerified: true,
    generation: -1
  },
  {
    id: 'user-4',
    name: 'David Kim',
    email: 'david@example.com',
    avatar: 'resources/images/user4.png',
    bio: 'Wedding Planner & Event Coordinator',
    role: 'contributor',
    followers: 987,
    following: 654,
    eventsCreated: 15,
    eventsAttended: 67,
    location: 'Los Angeles, CA',
    joinedDate: '2024-04-05',
    isVerified: false,
    generation: 1
  }
];

export const mockLocations = [
  {
    id: 'location-1',
    name: 'Griffith Park, Los Angeles',
    address: '2800 E Observatory Rd, Los Angeles, CA 90027',
    lat: 34.0522,
    lng: -118.2437,
    type: 'park',
    description: 'Large urban park with hiking trails and observatory'
  },
  {
    id: 'location-2',
    name: 'San Francisco Innovation Hub',
    address: '123 Market St, San Francisco, CA 94105',
    lat: 37.7749,
    lng: -122.4194,
    type: 'venue',
    description: 'Modern co-working and event space'
  },
  {
    id: 'location-3',
    name: 'MoMA PS1, New York',
    address: '22-25 Jackson Ave, Queens, NY 11101',
    lat: 40.7128,
    lng: -74.0060,
    type: 'museum',
    description: 'Contemporary art museum and gallery'
  },
  {
    id: 'location-4',
    name: 'Huntington Library Gardens',
    address: '1151 Oxford Rd, San Marino, CA 91108',
    lat: 34.0522,
    lng: -118.2437,
    type: 'garden',
    description: 'Beautiful botanical gardens and library'
  },
  {
    id: 'location-5',
    name: 'Golden Gate Park',
    address: 'Golden Gate Park, San Francisco, CA',
    lat: 37.7749,
    lng: -122.4194,
    type: 'park',
    description: 'Large urban park with multiple attractions'
  }
];

export const generateMockComments = (count = 10) => {
  const comments = [];
  const users = mockUsers;
  const commentTexts = [
    'This looks amazing! Can\'t wait to attend! 🎉',
    'Perfect timing for this event! Count me in!',
    'Love the venue choice! Should be a great time.',
    'Will there be food provided at this event?',
    'How many people are expected to attend?',
    'Is this event suitable for beginners?',
    'What should I bring to this event?',
    'Looking forward to meeting everyone there!',
    'The description sounds really interesting!',
    'Thanks for organizing this amazing event!'
  ];

  for (let i = 0; i < count; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const hasAudio = Math.random() > 0.7; // 30% chance of audio comment
    
    comments.push({
      id: `comment-${uuidv4()}`,
      user: {
        name: user.name,
        avatar: user.avatar
      },
      text: hasAudio ? '' : commentTexts[Math.floor(Math.random() * commentTexts.length)],
      audio: hasAudio ? 'mock-audio-url' : null,
      audioDuration: hasAudio ? Math.floor(Math.random() * 60) + 10 : 0,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      likes: Math.floor(Math.random() * 20),
      replies: Math.random() > 0.8 ? [generateMockReply()] : []
    });
  }

  return comments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

const generateMockReply = () => {
  const users = mockUsers;
  const user = users[Math.floor(Math.random() * users.length)];
  const replyTexts = [
    'Thanks for the question!',
    'Yes, that\'s correct!',
    'Looking forward to seeing you there!',
    'Great point!',
    'Absolutely!'
  ];

  return {
    id: `reply-${uuidv4()}`,
    user: {
      name: user.name,
      avatar: user.avatar
    },
    text: replyTexts[Math.floor(Math.random() * replyTexts.length)],
    timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
  };
};

export const mockNotifications = [
  {
    id: 'notif-1',
    type: 'like',
    user: 'Marcus Johnson',
    avatar: 'resources/images/user2.png',
    message: 'liked your event "Sunset Yoga Retreat"',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    read: false,
    eventId: 'event-1'
  },
  {
    id: 'notif-2',
    type: 'comment',
    user: 'Elena Rodriguez',
    avatar: 'resources/images/user3.png',
    message: 'commented on your event "Tech Startup Pitch Night"',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: false,
    eventId: 'event-2'
  },
  {
    id: 'notif-3',
    type: 'follow',
    user: 'David Kim',
    avatar: 'resources/images/user4.png',
    message: 'started following you',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    read: true
  },
  {
    id: 'notif-4',
    type: 'event',
    user: 'EventFeed Team',
    avatar: 'resources/images/system.png',
    message: 'Your event "Photography Workshop" has been approved',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    read: true,
    eventId: 'event-5'
  }
];