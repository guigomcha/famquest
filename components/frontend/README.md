# EventFeed - Social Event Platform

A modern, feature-rich social event platform built with React, Ant Design, and integrated mapping capabilities. Discover, create, and share amazing events with your community.

## 🌟 Features

### Core Functionality
- **Event Feed**: Instagram-style event discovery with rich media support
- **Interactive Map**: Leaflet-powered map with event markers and location search
- **Event Creation**: Multi-step event upload with media support
- **User Profiles**: Comprehensive profile management with statistics
- **Real-time Interactions**: Likes, comments (text/audio), shares

### Advanced Features
- **Media Support**: Images and videos with preview and playback controls
- **Audio Comments**: Record and share audio comments on events
- **Nested Comments**: Comment threads with reply functionality
- **Event Categories**: Filter and categorize events
- **Statistics Dashboard**: User engagement and event analytics
- **Responsive Design**: Mobile-first approach with touch optimization

## 🛠 Technology Stack

### Frontend
- **React 18**: Modern React with hooks and concurrent features
- **Ant Design 5**: Comprehensive UI component library
- **React Router 6**: Client-side routing
- **Leaflet**: Interactive mapping
- **ECharts**: Data visualization
- **React Quill**: Rich text editor
- **Anime.js**: Smooth animations

### Build Tools
- **Create React App**: Development and build setup
- **Docker**: Containerized deployment
- **Nginx**: Production web server

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Docker (optional)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd react-event-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Open in browser**
   Navigate to `http://localhost:3000`

### Docker Development

1. **Using Docker Compose**
   ```bash
   # For development
   docker-compose --profile dev up

   # For production
   docker-compose up
   ```

2. **Using Docker directly**
   ```bash
   # Build and run development container
   docker build -f Dockerfile.dev -t eventfeed-dev .
   docker run -p 3000:3000 -v $(pwd):/app eventfeed-dev

   # Build and run production container
   docker build -t eventfeed .
   docker run -p 3000:3000 eventfeed
   ```

## 🚀 Production Deployment

### Build for Production
```bash
npm run build
```

This creates an optimized production build in the `build` folder.

### Docker Deployment
```bash
# Build production image
docker build -t eventfeed:latest .

# Run container
docker run -p 80:3000 eventfeed:latest
```

### Environment Variables
Create a `.env` file for environment-specific configuration:
```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_MAPBOX_TOKEN=your_mapbox_token
REACT_APP_GA_TRACKING_ID=your_ga_id
```

## 📁 Project Structure

```
react-event-app/
├── public/                 # Static files
├── src/
│   ├── components/         # Reusable components
│   │   ├── EventCard.js    # Event display component
│   │   ├── CommentSystem.js # Comments with audio support
│   │   ├── MediaUpload.js  # File upload component
│   │   └── Layout.js       # Main layout wrapper
│   ├── pages/              # Page components
│   │   ├── EventFeed.js    # Main feed page
│   │   ├── EventMap.js     # Map view page
│   │   ├── EventUpload.js  # Event creation page
│   │   ├── EventEdit.js    # Event editing page
│   │   └── Profile.js      # User profile page
│   ├── utils/              # Utility functions
│   │   ├── mockData.js     # Mock data for development
│   │   └── helpers.js      # Helper functions
│   ├── App.js              # Main App component
│   ├── App.css             # Global styles
│   └── index.js            # Entry point
├── Dockerfile              # Production container
├── Dockerfile.dev          # Development container
├── docker-compose.yml      # Docker Compose configuration
└── package.json            # Dependencies and scripts
```

## 🎨 Design System

### Colors
- **Primary**: `#8b5cf6` (Purple)
- **Success**: `#10b981` (Green)
- **Warning**: `#f59e0b` (Amber)
- **Error**: `#ef4444` (Red)
- **Info**: `#3b82f6` (Blue)

### Typography
- **Font**: Inter (Google Fonts)
- **Headings**: Bold weights (600-700)
- **Body**: Regular (400) and Medium (500)

### Components
- **Cards**: Elevated design with hover effects
- **Buttons**: Gradient primary, outlined secondary
- **Forms**: Floating labels with validation
- **Modals**: Centered with backdrop blur

## 🔧 Configuration

### Map Configuration
The app uses Leaflet for mapping. For production, consider:
- Adding your own tile server
- Implementing clustering for large datasets
- Adding custom markers and styling

### Media Upload
Configure upload limits and supported formats:
```javascript
const uploadConfig = {
  maxCount: 10,
  maxSize: 50 * 1024 * 1024, // 50MB
  accept: 'image/*,video/*'
};
```

### Authentication
The app includes mock authentication. For production:
- Integrate with your backend API
- Add JWT token management
- Implement refresh token logic

## 📱 Responsive Design

### Breakpoints
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

### Mobile Optimizations
- Touch-friendly button sizes (minimum 44px)
- Swipe gestures for media navigation
- Optimized image loading
- Bottom navigation for easy thumb access

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### E2E Tests
```bash
# Install Cypress
npm install --save-dev cypress

# Run tests
npx cypress open
```

## 🚀 Performance Optimizations

### Implemented
- **Code Splitting**: React.lazy() for route-based splitting
- **Image Optimization**: Lazy loading and responsive images
- **Bundle Analysis**: Webpack Bundle Analyzer
- **Service Worker**: Offline functionality
- **Compression**: Gzip/Brotli compression

### Recommendations
- Implement virtual scrolling for large lists
- Add image CDN for better performance
- Use React.memo() for expensive components
- Implement request caching

## 🔒 Security Considerations

### Implemented
- **Input Validation**: Form validation on client and server
- **XSS Protection**: React's built-in protection
- **CSP Headers**: Content Security Policy
- **HTTPS**: Enforced in production

### Production Checklist
- [ ] Environment variables secured
- [ ] API keys not exposed
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Input sanitization implemented

## 📈 Analytics

### Integrated
- **User Engagement**: Event interactions, time on site
- **Performance**: Core Web Vitals, load times
- **Conversion**: Event creation, user registration

### Custom Events
```javascript
// Track event creation
gtag('event', 'event_created', {
  event_category: 'engagement',
  event_label: event.category,
  value: 1
});
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, email support@eventfeed.com or join our Slack channel.

## 🔄 Changelog

### v1.0.0 (Current)
- Initial release
- Event feed with media support
- Interactive map with markers
- User profiles and authentication
- Comment system with audio support
- Mobile-responsive design

### Roadmap
- [ ] Real-time notifications
- [ ] Event ticketing integration
- [ ] Advanced search and filtering
- [ ] Social sharing features
- [ ] Event recommendations
- [ ] Group event planning

---

Built with ❤️ by the EventFeed team

eventfeed/
├─ public/
│  ├─ index.html
│  └─ manifest.json
├─ src/
│  ├─ api/
│  │  ├─ endpoints.js          // Swagger aligned helpers
│  │  └─ mock-server.js        // Fake REST for demo
│  ├─ components/
│  │  ├─ App.js
│  │  ├─ Layout.js
│  │  ├─ EventCard.js
│  │  ├─ CommentSystem.js
│  │  ├─ MediaUpload.js
│  │  └─ ProtectedRoute.js
│  ├─ contexts/
│  │  ├─ AuthContext.js
│  │  └─ WorkspaceContext.js
│  ├─ pages/
│  │  ├─ Login.js
│  │  ├─ EventFeed.js
│  │  ├─ EventMap.js
│  │  ├─ EventUpload.js
│  │  ├─ EventEdit.js
│  │  ├─ Profile.js
│  │  ├─ FamilyTree.js
│  │  └─ Trips.js
│  ├─ styles/
│  │  └─ layout.css            // single consolidated stylesheet
│  ├─ utils/
│  │  ├─ helpers.js
│  │  ├─ mockData.js
│  │  └─ i18n.js
│  ├─ index.js
│  └─ serviceWorker.js
├─ .env
├─ docker-compose.yml
├─ package.json
└─ README.md


| Go entity (swagger) | Front-End model | Remarks                         |
| ------------------- | --------------- | ------------------------------- |
| spots               | events          | renamed for UX                  |
| notes               | comments        | renamed                         |
| attachments         | media           | renamed                         |
| known\_locations    | locations       | 1-to-1                          |
| trips               | trips           | 1-to-1                          |
| family\_tree        | familyTree      | 1-to-1                          |
| users               | users           | 1-to-1                          |
| discovered          | discovered      | kept (used for “unlock” badges) |



i18n

- no warnings
- long description support

