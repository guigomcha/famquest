import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Avatar, 
  Typography, 
  Space, 
  Button, 
  Image, 
  Carousel, 
  Tag, 
  Divider,
  Input,
  List,
  Badge,
  Tooltip,
  message
} from 'antd';
import { 
  HeartOutlined, 
  HeartFilled, 
  CommentOutlined, 
  ShareAltOutlined, 
  EnvironmentOutlined,
  ClockCircleOutlined,
  UserOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined
} from '@ant-design/icons';
import CommentSystem from '../components/CommentSystem';
import EventCard from '../components/EventCard';
import { mockEvents } from '../utils/mockData';
import { useNavigate, useLocation } from 'react-router-dom';
  
const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

const EventFeed = () => {
  const [events, setEvents] = useState(mockEvents);
  const [likedEvents, setLikedEvents] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [playingVideos, setPlayingVideos] = useState(new Set());
  const navigate = useNavigate();
  
  const categories = [
    { key: 'all', label: 'All Events', icon: '🌟' },
    { key: 'wellness', label: 'Wellness', icon: '🧘‍♀️' },
    { key: 'technology', label: 'Technology', icon: '💻' },
    { key: 'arts', label: 'Arts', icon: '🎨' },
    { key: 'celebration', label: 'Celebration', icon: '🎉' },
    { key: 'education', label: 'Education', icon: '📚' },
  ];

  const handleLike = (eventId) => {
    const newLikedEvents = new Set(likedEvents);
    if (likedEvents.has(eventId)) {
      newLikedEvents.delete(eventId);
    } else {
      newLikedEvents.add(eventId);
    }
    setLikedEvents(newLikedEvents);
    
    // Update event likes
    setEvents(events.map(event => {
      if (event.id === eventId) {
        return {
          ...event,
          likes: likedEvents.has(eventId) ? event.likes - 1 : event.likes + 1
        };
      }
      return event;
    }));

    if (!likedEvents.has(eventId)) {
      message.success('Event liked! ❤️');
    }
  };

  const handleShare = (event) => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      message.success('Link copied to clipboard!');
    }
  };

  const openComments = (event) => {
    setCurrentEvent(event);
    setCommentModalVisible(true);
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const toggleVideoPlayback = (mediaId) => {
    const newPlayingVideos = new Set(playingVideos);
    if (playingVideos.has(mediaId)) {
      newPlayingVideos.delete(mediaId);
    } else {
      newPlayingVideos.add(mediaId);
    }
    setPlayingVideos(newPlayingVideos);
  };

  return (
    <div className="event-feed">
      {/* Hero Section */}
      <div className="hero-section mb-6">
        <div className="hero-content">
          <Title level={1} className="gradient-text mb-4">
            Discover Amazing Events
          </Title>
          <Text className="text-lg text-gray-600 mb-6 block">
            Connect with your community through shared experiences
          </Text>
          
          {/* Quick Stats */}
          <Row gutter={16} className="mb-6">
            <Col span={8}>
              <Card className="stats-card">
                <div className="text-2xl font-bold gradient-text">{events.length}</div>
                <div className="text-xs text-gray-600">Events Today</div>
              </Card>
            </Col>
            <Col span={8}>
              <Card className="stats-card">
                <div className="text-2xl font-bold gradient-text">2.4k</div>
                <div className="text-xs text-gray-600">Active Users</div>
              </Card>
            </Col>
            <Col span={8}>
              <Card className="stats-card">
                <div className="text-2xl font-bold gradient-text">89</div>
                <div className="text-xs text-gray-600">Nearby</div>
              </Card>
            </Col>
          </Row>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6">
        <Search
          placeholder="Search events..."
          allowClear
          enterButton
          size="large"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4"
        />
        
        <div className="category-filters">
          <Space wrap>
            {categories.map(category => (
              <Button
                key={category.key}
                type={selectedCategory === category.key ? 'primary' : 'default'}
                onClick={() => setSelectedCategory(category.key)}
                className="category-button"
              >
                <span className="mr-2">{category.icon}</span>
                {category.label}
              </Button>
            ))}
          </Space>
        </div>
      </div>

      {/* Event Feed */}
      <Row gutter={[16, 16]}>
        {filteredEvents.map(event => (
          <Col key={event.id} xs={24} sm={24} md={12} lg={8}>
            <EventCard
              event={event}
              isLiked={likedEvents.has(event.id)}
              onLike={() => handleLike(event.id)}
              onShare={() => handleShare(event)}
              onComment={() => openComments(event)}
              onEdit={() => navigate(`/edit/${event.id}`)}
            />
          </Col>
        ))}
      </Row>

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <div className="empty-state">
          <div className="text-6xl mb-4">🔍</div>
          <Title level={3}>No events found</Title>
          <Text className="text-gray-600">
            Try adjusting your search terms or filters
          </Text>
        </div>
      )}

      {/* Comment Modal */}
      <CommentSystem
        visible={commentModalVisible}
        onClose={() => setCommentModalVisible(false)}
        event={currentEvent}
        onCommentAdded={(comment) => {
          // Handle new comment
          message.success('Comment added successfully!');
        }}
      />
    </div>
  );
};

export default EventFeed;