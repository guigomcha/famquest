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
  Select,
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
  PauseCircleOutlined,
  FilterOutlined
} from '@ant-design/icons';
import CommentSystem from '../components/CommentSystem';
import EventCard from '../components/EventCard';
import { mockEvents } from '../utils/mockData';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

const EventFeed = () => {
  const { t, i18n } = useTranslation();
  const [events, setEvents] = useState(mockEvents);
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
            {t('common.homeMessage')}
          </Title>
          <Text className="text-lg text-gray-600 mb-6 block">
            {t('common.homeSubMessage')}
          </Text>
          
          {/* Quick Stats */}
          <Row gutter={8} className="mb-6">
            <Col span={8}>
              <Card className="stats-card">
                <div className="text-2xl font-bold gradient-text">{events.length}</div>
                <div className="text-xs text-gray-600">{t('event.statTotal')}</div>
              </Card>
            </Col>
            <Col span={8}>
              <Card className="stats-card">
                <div className="text-2xl font-bold gradient-text">x</div>
                <div className="text-xs text-gray-600">{t('family.stat')}</div>
              </Card>
            </Col>
            <Col span={8}>
              <Card className="stats-card">
                <div className="text-2xl font-bold gradient-text">x%</div>
                <div className="text-xs text-gray-600">{t('event.statDiscovered')}</div>
              </Card>
            </Col>
          </Row>
        </div>
      </div>

      {/* Search and Filter */}
      {/* TODO: Make it more responsiveand use the full row */}
      <Row gutter={8} className="mb-6">
        <Col span={16}>
          <Search
            placeholder={t('common.search')}
            allowClear
            enterButton
            size="large"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
          />
        </Col>
        <Col span={8}>
          <div className="filter-section">
            <Text strong className="filter-label">
              <FilterOutlined /> {t('event.selectCategory')}:
            </Text>
            <Select
              value={selectedCategory}
              onChange={setSelectedCategory}
              className="category-select"
              size="small"
              >
              {categories.map(cat => (
                <Option key={cat.key} value={cat.key}>
                  <Space>
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </Space>
                </Option>
              ))}
            </Select>
          </div>
        </Col>
      </Row>

      {/* Event Feed */}
      {/* TODO: Improve alignment of event cards */}
      <Row gutter={[16, 16]}>
        {filteredEvents.map(event => (
          <Col key={event.id} xs={24} sm={24} md={12} lg={8}>
            <EventCard
              event={event}
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
          <Title level={3}>{t('common.empty')}</Title>
          <Text className="text-gray-600">
            {t('common.filterEmpty')}
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
          // TODO G: render outside 
          message.success(t('comment.commentAdded'));
        }}
      />
    </div>
  );
};

export default EventFeed;