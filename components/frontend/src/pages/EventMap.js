import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Input,
  Select,
  Space,
  Button,
  Typography,
  Badge,
  Tooltip,
  message,
  Row,
  Col,
  Tag,
  Divider
} from 'antd';
import {
  SearchOutlined,
  EnvironmentOutlined,
  FilterOutlined,
  CompassOutlined,
  EyeOutlined,
  HeartOutlined,
  ShareAltOutlined
} from '@ant-design/icons';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { mockEvents } from '../utils/mockData';
import { getCategoryColor, getCategoryIcon } from '../utils/helpers';
import { useNavigate, useLocation } from 'react-router-dom';
import { t } from 'i18next';

const { Title, Text } = Typography;
const { Option } = Select;

// Fix for default markers in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const EventMap = () => {
  const [events, setEvents] = useState(mockEvents);
  const [filteredEvents, setFilteredEvents] = useState(mockEvents);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [mapCenter, setMapCenter] = useState([37.7749, -122.4194]);
  const [mapZoom, setMapZoom] = useState(10);
  const mapRef = useRef(null);
  const navigate = useNavigate();

  const categories = [
    { key: 'all', label: 'All Events', icon: '🌟' },
    { key: 'wellness', label: 'Wellness', icon: '🧘‍♀️' },
    { key: 'technology', label: 'Technology', icon: '💻' },
    { key: 'arts', label: 'Arts', icon: '🎨' },
    { key: 'celebration', label: 'Celebration', icon: '🎉' },
    { key: 'education', label: 'Education', icon: '📚' },
  ];

  useEffect(() => {
    filterEvents();
  }, [events, selectedCategory, searchTerm]);

  const filterEvents = () => {
    let filtered = events;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setMapCenter([latitude, longitude]);
          setMapZoom(13);
          message.success('Location found!');
        },
        (error) => {
          message.error('Unable to get your location');
        }
      );
    } else {
      message.error('Geolocation is not supported by this browser');
    }
  };

  const createCustomIcon = (category, isSelected = false) => {
    const color = getCategoryColor(category);
    const icon = getCategoryIcon(category);
    
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div class="marker-content ${isSelected ? 'selected' : ''}">
          <div class="marker-icon" style="background-color: ${getColorHex(color)}">
            <span class="marker-emoji">${icon}</span>
          </div>
          <div class="marker-pulse"></div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
  };
  // TODO: Move something like this to a helper function
  const getColorHex = (color) => {
    const colorMap = {
      purple: '#8b5cf6',
      blue: '#3b82f6',
      pink: '#ec4899',
      red: '#ef4444',
      green: '#10b981',
      orange: '#f97316',
      yellow: '#eab308',
      cyan: '#06b6d4',
      geekblue: '#1d4ed8',
      magenta: '#d946ef'
    };
    return colorMap[color] || '#8b5cf6';
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setMapCenter([event.location.lat, event.location.lng]);
    setMapZoom(15);
  };

  const MapController = ({ center, zoom }) => {
    const map = useMap();
    
    useEffect(() => {
      map.setView(center, zoom);
    }, [center, zoom, map]);
    
    return null;
  };

  return (
    <div className="event-map">
      {/* Header Controls */}
      <div className="map-controls">
        <Card className="controls-card">
          <div className="controls-header">
            <Title level={4} className="gradient-text mb-0">
              <CompassOutlined /> Event Map
            </Title>
            <Button
              type="primary"
              icon={<EnvironmentOutlined />}
              onClick={getCurrentLocation}
              size="small"
            >
              {t('event.location')}
            </Button>
          </div>

          <div className="search-section">
            <Input
              placeholder={t('common.search')}
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
              className="search-input"
            />
          </div>

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

          <div className="stats-section">
            <Space>
              <Badge 
                count={filteredEvents.length} 
                showZero
                style={{ backgroundColor: '#8b5cf6' }}
              />
              <Text>{t('common.results')}</Text>
            </Space>
          </div>
        </Card>
      </div>

      {/* Map Container */}
      <div className="map-container">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '600px', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapController center={mapCenter} zoom={mapZoom} />

          {/* Event Markers */}
          {filteredEvents.map(event => (
            <Marker
              key={event.id}
              position={[event.location.lat, event.location.lng]}
              icon={createCustomIcon(event.category, selectedEvent?.id === event.id)}
              eventHandlers={{
                click: () => handleEventClick(event)
              }}
            >
              <Popup className="event-popup">
                <div className="popup-content">
                  <div className="popup-header">
                    <Tag color={getCategoryColor(event.category)}>
                      {getCategoryIcon(event.category)} {event.category}
                    </Tag>
                  </div>
                  
                  <Title level={5} className="popup-title">
                    {event.title}
                  </Title>
                  
                  <Text className="popup-location">
                    <EnvironmentOutlined /> {event.location.name}
                  </Text>
                  
                  {event.media && event.media.length > 0 && (
                    <div className="popup-media">
                      <img 
                        src={event.media[0].url} 
                        alt={event.title}
                        className="popup-image"
                      />
                    </div>
                  )}
                  
                  <div className="popup-stats">
                    <Space>
                      <span>•</span>
                      {event.participants?.length || 0} X
                    </Space>
                  </div>
                  
                  <div className="popup-actions">
                    <Space>
                      <Button
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`/event/${event.id}`)}
                      >
                        {t('common.view')}
                      </Button>
                    </Space>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* User Location Marker */}
          {userLocation && (
            <Marker
              position={userLocation}
              icon={L.divIcon({
                className: 'user-location-marker',
                html: '<div class="user-marker"></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
              })}
            >
              <Popup>{t('myLocation')}</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* Event List Sidebar */}
      {selectedEvent && (
        <div className="event-sidebar">
          <Card
            title="Selected Event"
            extra={
              <Button
                type="text"
                icon={<EyeOutlined />}
                onClick={() => navigate(`/event/${selectedEvent.id}`)}
              />
            }
            className="selected-event-card"
          >
            <div className="selected-event-content">
              <Title level={4}>{selectedEvent.title}</Title>
              <Text className="event-description">
                {selectedEvent.description.substring(0, 150)}...
              </Text>
              
              <Divider />
              
              <div className="event-details">
                <Space direction="vertical">
                  <Text>
                    <EnvironmentOutlined /> {selectedEvent.location.name}
                  </Text>
                  <Text>
                    📅 {new Date(selectedEvent.date).toLocaleDateString()}
                  </Text>
                  <Text>
                    ⏰ {selectedEvent.duration}
                  </Text>
                  <Text>
                    👥 {selectedEvent.participants?.length || 0} / {selectedEvent.capacity || '∞'} participants
                  </Text>
                </Space>
              </div>
              
              <Divider />
              
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EventMap;