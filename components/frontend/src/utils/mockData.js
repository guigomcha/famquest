import { v4 as uuidv4 } from 'uuid';

/*
For POST, keys with * mean optional (can be null/not added)
For updates, unless explicitelly said in a comment, you have to send everything (PUT instead of PATCH for now)
During PUT everything is mandatory 
*/
/*
Media post: + media file in form
      { 
        tags: ['art'],
        *isAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      }
Media put: + media file in form
      { 
        participants: ['user-1'],
        tags: ['art'],
        isAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
        comments: []
      }
*/
export const mockMedia = [
      { 
        id: 'media-1', 
        ownerId: 'user-1',
        participants: ['user-1'],
        tags: ['art'],
        isAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        name: 'art-gallery.jpg',
        url: 'resources/images/art-gallery.jpg', 
        contentType: 'image/png',
        comments: []
      },
      { 
        id: 'media-2', 
        url: 'resources/images/city-skyline.jpg', 
        contentType: 'image/jpg',
        ownerId: 'user-1',
        participants: ['user-1', 'user-2'],
        tags: ['city', 'art'],
        isAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        name: 'city-skyline.jpg',
        comments: [
            'comment-2'
        ]
      },
      { 
        id: 'media-3', 
        url: 'resources/audio/Audio from guillelerial.oga',
        contentType: 'audio/oga',
        ownerId: 'user-2',
        participants: ['user-2'],
        tags: ['personal'],
        isAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        name: 'Audio from guillelerial.oga',
        comments: []
      },
      { 
        id: 'media-4', 
        url: 'resources/images/shopping-district.jpg',
        ownerId: 'user-2',
        participants: [],
        tags: ['city'],
        isAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        name: 'shopping-district.jpg', 
        contentType: 'image/jpg',
        comments: []
      },
      { 
        id: 'media-5', 
        url: 'resources/images/user2.png', 
        ownerId: 'user-2',
        participants: [],
        tags: ['avatar'],
        isAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        name: 'user2.png', 
        contentType: 'image/png',
        comments: []
      },
      { 
        id: 'media-6', 
        url: 'resources/images/user3.png',
        ownerId: 'user-1', 
        participants: [],
        tags: ['avatar'],
        isAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        name: 'user1.png', 
        contentType: 'image/png',
        comments: []
      }
]
/*
Comment post + put: 
{
  text: 'extra info', 
  *audio: 'media-3', 
  replies: [          
    'comment-3'
  ]
} 
*/
export const mockComments = [
    { 
        id: 'comment-1',
        ownerId: 'user-1', 
        text: 'extra info long should /n support rendering/t/n examples', 
        audioId: 'media-3',
        updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        replies: [          
          'comment-3'
        ]
      },
    { 
        id: 'comment-2',
        ownerId: 'user-1', 
        text: 'comment in photo', 
        audioId: '', 
        updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        replies: []
      },
    { 
        id: 'comment-3',
        ownerId: 'user-2', 
        text: 'some reply to comment', 
        audioId: '', 
        updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        replies: []
      },
    { 
        id: 'comment-4',
        ownerId: 'user-2', 
        text: 'some comment to event. Text optional', 
        audioId: 'media-3', 
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        replies: []
      },
    { 
        id: 'comment-5',
        ownerId: 'user-3', 
        text: 'some more comment to events', 
        audioId: '', 
        updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        replies: []
      }
]
/*
post post + put:
{
    name: 'Tech Startup Pitch Night',
    *descriptionId: 'comment-1',
    *locationId: 'location-2',
    medias: ['media-4'],
    tags: ['outdoor', 'sunset'],
    *startAt: new Date(Date.now() - 19 * 7 * 24 * 60 * 60 * 1000),
    *endAt: new Date(Date.now() - 15 * 7 * 24 * 60 * 60 * 1000),
    comments: ['comment-1', 'comment-2']
  }
*/
export const mockPosts = [
  {
    id: 'post-2',
    name: 'Tech Startup Pitch Night',
    descriptionId: 'comment-2',
    locationId: 'location-2',
    medias: ['media-4'],
    ownerId: 'user-3',
    tags: ['outdoor', 'sunset'],
    updatedAt: new Date(Date.now()).toISOString(),
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    startAt: new Date(Date.now() - 19 * 7 * 24 * 60 * 60 * 1000).toISOString(),
    endAt: new Date(Date.now() - 15 * 7 * 24 * 60 * 60 * 1000).toISOString(),
    comments: ['comment-1', 'comment-2']
  },
  {
    id: 'post-1',
    name: 'Sunset Yoga Retreat',
    descriptionId: 'comment-1',
    locationId: 'location-1',
    medias: ['media-1','media-2'],
    ownerId: 'user-1',
    tags: ['yoga', 'meditation', 'wellness', 'outdoor', 'sunset'],
    updatedAt: new Date(Date.now()).toISOString(),
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    startAt: new Date(Date.now() - 4 * 7 * 24 * 60 * 60 * 1000).toISOString(),
    endAt: new Date(Date.now() - 3 * 7 * 24 * 60 * 60 * 1000).toISOString(),
    comments: ['comment-4']
  },
  {
    id: 'post-3',
    name: 'User event',
    descriptionId: '',
    locationId: '',
    medias: ['media-6','media-2'],
    ownerId: 'user-1',
    tags: ['pet', 'info', 'bla'],
    updatedAt: new Date(Date.now()).toISOString(),
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    startAt: new Date(Date.now() - 4 * 7 * 24 * 60 * 60 * 1000).toISOString(),
    endAt: new Date(Date.now() - 3 * 7 * 24 * 60 * 60 * 1000).toISOString(),
    comments: ['comment-4']
  },
  {
    id: 'post-4',
    name: 'Usaaaaaaaaaaer event',
    descriptionId: 'comment-1',
    locationId: 'location-3',
    medias: ['media-6','media-2'],
    ownerId: 'user-2',
    tags: ['pet', 'info', 'bla'],
    updatedAt: new Date(Date.now()).toISOString(),
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    startAt: new Date(Date.now() - 4 * 7 * 24 * 60 * 60 * 1000).toISOString(),
    endAt: new Date(Date.now() - 3 * 7 * 24 * 60 * 60 * 1000).toISOString(),
    comments: ['comment-4']
  },
  {
    id: 'post-5',
    name: 'asdasfasfasf',
    descriptionId: '',
    locationId: 'location-1',
    medias: ['media-6','media-2'],
    ownerId: 'user-2',
    tags: ['pet', 'info', 'bla'],
    updatedAt: new Date(Date.now()).toISOString(),
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    startAt: new Date(Date.now() - 4 * 7 * 24 * 60 * 60 * 1000).toISOString(),
    endAt: new Date(Date.now() - 3 * 7 * 24 * 60 * 60 * 1000).toISOString(),
    comments: ['comment-4']
  },
];

/*
location post + put
  {
    *address: '',
    *name: '',
    lat: 34.0521,
    lng: -118.2437
  },
*/
export const mockLocations = [
  {
    id: 'location-1',
    address: '',
    name: '',
    ownerId: 'user-1',
    updatedAt: new Date(Date.now()).toISOString(),
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    lat: 34.0522,
    lng: -118.2437
  },
  {
    id: 'location-2',
    address: '123 Market St, San Francisco, CA 94105',    
    name: '',
    ownerId: 'user-1',
    updatedAt: new Date(Date.now()).toISOString(),
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    lat: 37.7749,
    lng: -122.4194
    },
  {
    id: 'location-3',
    address: '22-25 Jackson Ave, Queens, NY 11101',
    name: '',
    ownerId: 'user-2',
    updatedAt: new Date(Date.now()).toISOString(),
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    lat: 40.7128,
    lng: -74.0060
  },
  {
    id: 'location-4',
    address: '',
    name: '',
    ownerId: 'user-2',
    updatedAt: new Date(Date.now()).toISOString(),
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    lat: 40.7128,
    lng: -74.0060
  },
    {
    id: 'location-5',
    address: '',
    name: '',
    ownerId: 'user-2',
    updatedAt: new Date(Date.now()).toISOString(),
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    lat: 34.0521,
    lng: -118.2437
  },
];

/*
user post + put

{
    name: 'Sarah Chen',
    *email: 'sarah@example.com',
    *avatarId: 'media-5',
    *bioId: 'comment-1',
    startAt: new Date(Date.now() - 19 * 7 * 24 * 60 * 60 * 1000),
    *endAt: new Date(Date.now() - 15 * 7 * 24 * 60 * 60 * 1000),
    posts: ['post-3'],
    isVirtual: false,
  }
*/
export const mockUsers = [
  {
    id: 'user-1',
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    avatarId: 'media-5',
    bioId: 'comment-1',
    updatedAt: new Date(Date.now()).toISOString(),
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    startAt: new Date(Date.now() - 19 * 7 * 24 * 60 * 60 * 1000).toISOString(),
    endAt: new Date(Date.now() - 15 * 7 * 24 * 60 * 60 * 1000).toISOString(),
    posts: ['post-3'],
    isVirtual: false,
  },
  {
    id: 'user-2',
    name: 'Marcus Johnson',
    email: 'marcus@example.com',
    avatarId: 'media-6',
    bioId: '',
    updatedAt: new Date(Date.now()).toISOString(),
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    startAt: new Date(Date.now() - 19 * 7 * 24 * 60 * 60 * 1000).toISOString(),
    endAt: '',
    posts: [],
    isVirtual: false,
  },
  {
    id: 'user-3',
    name: 'Elena Rodriguez',
    email: 'elena@example.com',
    avatarId: '',
    bioId: '',
    updatedAt: new Date(Date.now()).toISOString(),
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    startAt: new Date(Date.now() - 19 * 7 * 24 * 60 * 60 * 1000).toISOString(),
    endAt: '',
    posts: [],
    isVirtual: true,
  },
  {
    id: 'user-4',
    name: 'Leo Virtual',
    email: '',
    avatarId: '',
    bioId: '',
    updatedAt: new Date(Date.now()).toISOString(),
    createdAt: new Date(Date.now()).toISOString(),
    startAt: '',
    endAt: '',
    posts: [],
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


/* 
Trips post + put 

  {
    name: 'California Coast Adventure',
    *descriptionId: 'comment-1',
    participants: ['user-1', 'user-2'],   // who participates
    transportation: 'car',
    startAt: new Date(Date.now() - 19 * 7 * 24 * 60 * 60 * 1000),
    endAt: new Date(Date.now() - 15 * 7 * 24 * 60 * 60 * 1000),
    stops: [                               // each stop = existing event
      { id: 'post-1', order: 0 },   // Yoga retreat
      { id: 'post-2', order: 1 },   // Tech pitch night
    ]
  }
*/
export const mockTrips = [
  {
    id: 'trip-1',
    name: 'California Coast Adventure',
    descriptionId: 'comment-1',
    ownerId: 'user-1',                       // who created
    participants: ['user-1', 'user-2'],   // who participates
    transportation: 'car',
    updatedAt: new Date(Date.now()).toISOString(),
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    startAt: new Date(Date.now() - 19 * 7 * 24 * 60 * 60 * 1000).toISOString(),
    endAt: new Date(Date.now() - 15 * 7 * 24 * 60 * 60 * 1000).toISOString(),
    stops: [                               // each stop = existing event
      { id: 'post-1', order: 0 },   // Yoga retreat
      { id: 'post-2', order: 1 },   // Tech pitch night
    ]
  },
  {
    id: 'trip-2',
    name: 'Tech Conference Tour',
    descriptionId: 'comment-3',
    ownerId: 'user-3',
    participants: ['user-3'],
    transportation: 'plane',
    updatedAt: new Date(Date.now()).toISOString(),
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    startAt: new Date(Date.now() - 19 * 7 * 24 * 60 * 60 * 1000).toISOString(),
    endAt: new Date(Date.now() - 15 * 7 * 24 * 60 * 60 * 1000).toISOString(),
    stops: [
      { id: 'post-2', order: 0 },
      { id: 'post-4', order: 1 },
    ]
  },
];