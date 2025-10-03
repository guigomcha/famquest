import { v4 as uuidv4 } from 'uuid';

export const mockMedia = [
{ 
        id: 'media-1', 
        url: 'resources/images/art-gallery.jpg', 
        type: 'image',
        owner: 'user-1',
        comments: []
      },
      { 
        id: 'media-2', 
        url: 'resources/images/city-skyline.jpg', 
        type: 'image',
        owner: 'user-1',
        comments: [
            'comment-2'
        ]
      },
      { 
        id: 'media-3', 
        url: 'resources/audio/Audio from guillelerial.oga',
        owner: 'user-1', 
        type: 'audio',
        comments: []
      },
      { 
        id: 'media-4', 
        url: 'resources/images/shopping-district.jpg',
        owner: 'user-2', 
        type: 'image',
        comments: []
      },
      { 
        id: 'media-5', 
        url: 'resources/images/user2.png', 
        owner: 'user-2',
        type: 'image',
        comments: []
      },
      { 
        id: 'media-6', 
        url: 'resources/images/user3.png',
        owner: 'user-3', 
        type: 'image',
        comments: []
      }
]
export const mockComments = [
    { 
        id: 'comment-1',
        user: 'user-1', 
        text: 'extra info', 
        audio: 'media-3', 
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        replies: [          
          'comment-3'
        ]
      },
    { 
        id: 'comment-2',
        user: 'user-1', 
        text: 'comment in photo', 
        audio: '', 
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        replies: []
      },
    { 
        id: 'comment-3',
        user: 'user-2', 
        text: 'some reply to comment', 
        audio: '', 
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        replies: []
      },
    { 
        id: 'comment-4',
        user: 'user-2', 
        text: 'some comment to event', 
        audio: '', 
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        replies: []
      },
    { 
        id: 'comment-5',
        user: 'user-3', 
        text: 'some more comment to events', 
        audio: '', 
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        replies: []
      }
]
export const mockEvents = [
  {
    id: 'event-2',
    title: 'Tech Startup Pitch Night',
    description: 'Watch innovative startups present their ideas to a panel of VCs and industry experts. This is a great opportunity for entrepreneurs to showcase their innovations and get valuable feedback from experienced investors. The event will feature 10 startups presenting their pitches, followed by a networking session with refreshments. Whether you\'re an entrepreneur, investor, or just interested in the startup ecosystem, this event is perfect for you.',
    location: 'location-2',
    media: ['media-4'],
    owner: 'user-3',
    tags: ['outdoor', 'sunset'],
    updatedDate: new Date(Date.now()).toISOString(),
    createdDate: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    startTime: new Date(Date.now() - 19 * 7 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 15 * 7 * 24 * 60 * 60 * 1000).toISOString(),
    comments: ['comment-1', 'comment-2']
  },
  {
    id: 'event-1',
    title: 'Sunset Yoga Retreat',
    description: 'Join us for a peaceful yoga session as the sun sets over the mountains. Perfect for beginners and experienced practitioners alike. We will practice various yoga poses, meditation techniques, and breathing exercises while enjoying the beautiful natural scenery. Bring your own yoga mat, water bottle, and comfortable clothing. The session will be led by certified yoga instructor Sarah Chen who has over 10 years of experience in teaching yoga and mindfulness.',
    location: 'location-1',
    media: ['media-1','media-2'],
    owner: 'user-1',
    tags: ['yoga', 'meditation', 'wellness', 'outdoor', 'sunset'],
    updatedDate: new Date(Date.now()).toISOString(),
    createdDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    startTime: new Date(Date.now() - 4 * 7 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 3 * 7 * 24 * 60 * 60 * 1000).toISOString(),
    comments: ['comment-4']
  },
  {
    id: 'event-3',
    title: 'User event',
    description: 'some description',
    location: '',
    media: ['media-6','media-2'],
    owner: 'user-1',
    tags: ['pet', 'info', 'bla'],
    updatedDate: new Date(Date.now()).toISOString(),
    createdDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    startTime: new Date(Date.now() - 4 * 7 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 3 * 7 * 24 * 60 * 60 * 1000).toISOString(),
    comments: ['comment-4']
  },
  {
    id: 'event-4',
    title: 'Usaaaaaaaaaaer event',
    description: 'some description',
    location: 'location-3',
    media: ['media-6','media-2'],
    owner: 'user-2',
    tags: ['pet', 'info', 'bla'],
    updatedDate: new Date(Date.now()).toISOString(),
    createdDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    startTime: new Date(Date.now() - 4 * 7 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 3 * 7 * 24 * 60 * 60 * 1000).toISOString(),
    comments: ['comment-4']
  },
];

export const mockLocations = [
  {
    id: 'location-1',
    address: '2800 E Observatory Rd, Los Angeles, CA 90027',
    lat: 34.0522,
    lng: -118.2437
  },
  {
    id: 'location-2',
    address: '123 Market St, San Francisco, CA 94105',
    lat: 37.7749,
    lng: -122.4194
    },
  {
    id: 'location-3',
    address: '22-25 Jackson Ave, Queens, NY 11101',
    lat: 40.7128,
    lng: -74.0060
  }
];

/* mockUsers.js  –  works with the relationship-table above */
export const mockUsers = [
  {
    id: 'user-1',
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    avatar: 'media-5',
    bio: 'Yoga instructor, loves sunsets',
    updatedDate: new Date(Date.now()).toISOString(),
    createdDate: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    birthTime: new Date(Date.now() - 19 * 7 * 24 * 60 * 60 * 1000).toISOString(),
    deathTime: new Date(Date.now() - 15 * 7 * 24 * 60 * 60 * 1000).toISOString(),
    events: ['event-3'],
    isVirtual: false,
  },
  {
    id: 'user-2',
    name: 'Marcus Johnson',
    email: 'marcus@example.com',
    avatar: 'media-6',
    bio: 'Tech entrepreneur',
    updatedDate: new Date(Date.now()).toISOString(),
    createdDate: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    birthTime: new Date(Date.now() - 19 * 7 * 24 * 60 * 60 * 1000).toISOString(),
    deathTime: '',
    events: [],
    isVirtual: false,
  },
  {
    id: 'user-3',
    name: 'Elena Rodriguez',
    email: 'elena@example.com',
    avatar: '',
    bio: '',
    updatedDate: new Date(Date.now()).toISOString(),
    createdDate: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    birthTime: new Date(Date.now() - 19 * 7 * 24 * 60 * 60 * 1000).toISOString(),
    deathTime: '',
    events: [],
    isVirtual: true,
  },
  {
    id: 'user-4',
    name: 'Leo Virtual',
    email: 'leo@virtual.com',
    avatar: '',
    bio: 'Virtual member',
    updatedDate: new Date(Date.now()).toISOString(),
    createdDate: new Date(Date.now()).toISOString(),
    birthTime: '',
    deathTime: '',
    events: [],
    isVirtual: true,
  },
];

/* mockRelations.js  –  links for the table  */
export const mockRelations = [
  /* ----------  horizontal  ---------- */
  { id: 'rel-1', source: 'user-1', target: 'user-2', label: 'spouse' },
  { id: 'rel-2', source: 'user-2', target: 'user-1', label: 'spouse' }, // bidirectional

  { id: 'rel-3', source: 'user-1', target: 'user-3', label: 'friend' },
  { id: 'rel-4', source: 'user-3', target: 'user-1', label: 'friend' },

  /* ----------  vertical (parent → child)  ---------- */
  { id: 'rel-5', source: 'user-1', target: 'user-3', label: 'parent' },
  { id: 'rel-6', source: 'user-2', target: 'user-3', label: 'parent' },

  /* ----------  pet  ---------- */
  { id: 'rel-7', source: 'user-1', target: 'user-4', label: 'pet' },
];


/* mockTrips  –  backend-ready shape  ------------------------------------ */
export const mockTrips = [
  {
    id: 'trip-1',
    name: 'California Coast Adventure',
    description: 'Scenic road-trip down the coast',
    owner: 'user-1',                       // who created
    involvedUsers: ['user-1', 'user-2'],   // who participates
    transportation: 'car',
    budget: 1200,
    isPublic: true,
    status: 'planned',                     // planned | active | completed
    startTime: '2024-03-15T08:00:00Z',
    endTime: '2024-03-20T20:00:00Z',
    stops: [                               // each stop = existing event
      { eventId: 'event-1', order: 0 },   // Yoga retreat
      { eventId: 'event-2', order: 1 },   // Tech pitch night
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'trip-2',
    name: 'Tech Conference Tour',
    description: 'Multi-city tech events',
    owner: 'user-3',
    involvedUsers: ['user-3'],
    transportation: 'plane',
    budget: 2500,
    isPublic: false,
    status: 'active',
    startTime: '2024-04-10T07:00:00Z',
    endTime: '2024-04-15T22:00:00Z',
    stops: [
      { eventId: 'event-2', order: 0 },   // User event
    ],
    createdAt: new Date().toISOString(),
  },
];