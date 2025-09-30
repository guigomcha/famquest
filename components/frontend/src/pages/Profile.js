import React, { useState } from 'react';
import {
  Card,
  Avatar,
  Typography,
  Tabs,
  Button,
  Space,
  Row,
  Col,
  Statistic,
  Progress,
  Badge,
  Divider,
  Upload,
  message,
  List,
  Tag,
  Switch,
  Tooltip
} from 'antd';
import {
  EditOutlined,
  HeartOutlined,
  ShareAltOutlined,
  EyeOutlined,
  SettingOutlined,
  TrophyOutlined,
  StarOutlined,
  AimOutlined,
  UploadOutlined,
  UserOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  DollarOutlined
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { mockEvents, mockUsers } from '../utils/mockData';
import { getCategoryColor, getTimeAgo } from '../utils/helpers';
import EventCard from '../components/EventCard';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const Profile = () => {
  const [activeTab, setActiveTab] = useState('events');
  const [userData] = useState(mockUsers[0]); // Current user
  const [events] = useState(mockEvents.filter(event => event.owner.id === 'user-1'));
  const [savedEvents] = useState(mockEvents.slice(0, 3));
  const [isEditing, setIsEditing] = useState(false);

  const userStats = {
    eventsCreated: events.length,
    eventsAttended: 156,
    followers: userData.followers,
    following: userData.following,
    totalLikes: events.reduce((sum, event) => sum + event.likes, 0),
    categories: {
      wellness: 8,
      education: 6,
      technology: 5,
      arts: 4,
      celebration: 3
    }
  };

  const engagementData = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: [12, 19, 15, 25, 22, 30],
      type: 'line',
      smooth: true,
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0, color: 'rgba(139, 92, 246, 0.3)'
          }, {
            offset: 1, color: 'rgba(139, 92, 246, 0.05)'
          }]
        }
      },
      lineStyle: {
        color: '#8b5cf6',
        width: 3
      },
      itemStyle: {
        color: '#8b5cf6'
      }
    }]
  };

  const categoryData = Object.entries(userStats.categories).map(([category, count]) => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    value: count,
    itemStyle: {
      color: getCategoryColor(category)
    }
  }));

  const handleEditProfile = () => {
    setIsEditing(true);
    message.info('Edit profile feature coming soon!');
  };

  const handleAvatarUpload = (info) => {
    if (info.file.status === 'done') {
      message.success('Avatar uploaded successfully!');
    } else if (info.file.status === 'error') {
      message.error('Avatar upload failed.');
    }
  };

  const renderEventCard = (event) => (
    <EventCard
      key={event.id}
      event={event}
      showActions={true}
      onLike={() => message.success('Event liked!')}
      onShare={() => message.success('Shared!')}
      onComment={() => message.info('Comments coming soon!')}
      onEdit={() => message.info('Edit feature coming soon!')}
    />
  );

  return (
    <div className="profile-page">
      {/* Profile Header */}
      <div className="profile-header">
        <Card className="header-card">
          <div className="header-content">
            <div className="avatar-section">
              <Upload
                showUploadList={false}
                onChange={handleAvatarUpload}
                beforeUpload={() => false}
              >
                <Avatar
                  src={userData.avatar}
                  size={120}
                  icon={<UserOutlined />}
                  className="profile-avatar"
                />
                <div className="avatar-overlay">
                  <UploadOutlined />
                  <Text>Change Photo</Text>
                </div>
              </Upload>
            </div>

            <div className="info-section">
              <div className="info-header">
                <Title level={2} className="user-name">
                  {userData.name}
                </Title>
                {userData.isVerified && (
                  <Badge
                    status="processing"
                    text="Verified"
                    color="blue"
                    className="verified-badge"
                  />
                )}
              </div>
              
              <Text className="user-bio">{userData.bio}</Text>
              
              <div className="user-details">
                <Space>
                  <Tooltip title="Location">
                    <Text>
                      <EnvironmentOutlined /> {userData.location}
                    </Text>
                  </Tooltip>
                  <Tooltip title="Joined Date">
                    <Text>
                      <CalendarOutlined /> {new Date(userData.joinedDate).toLocaleDateString()}
                    </Text>
                  </Tooltip>
                </Space>
              </div>

              <div className="user-stats">
                <Row gutter={16}>
                  <Col>
                    <Statistic
                      title="Events Created"
                      value={userStats.eventsCreated}
                      prefix={<TrophyOutlined />}
                    />
                  </Col>
                  <Col>
                    <Statistic
                      title="Events Attended"
                      value={userStats.eventsAttended}
                      prefix={<CalendarOutlined />}
                    />
                  </Col>
                  <Col>
                    <Statistic
                      title="Followers"
                      value={formatNumber(userStats.followers)}
                      prefix={<UserOutlined />}
                    />
                  </Col>
                  <Col>
                    <Statistic
                      title="Following"
                      value={formatNumber(userStats.following)}
                      prefix={<UserOutlined />}
                    />
                  </Col>
                </Row>
              </div>

              <div className="profile-actions">
                <Space>
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={handleEditProfile}
                  >
                    Edit Profile
                  </Button>
                  <Button
                    icon={<SettingOutlined />}
                    onClick={() => message.info('Settings coming soon!')}
                  >
                    Settings
                  </Button>
                </Space>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="profile-content">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="profile-tabs"
          tabBarExtraContent={{
            right: (
              <Space>
                <Button
                  type="text"
                  icon={<EyeOutlined />}
                  onClick={() => message.info('View as visitor coming soon!')}
                >
                  View as Visitor
                </Button>
              </Space>
            )
          }}
        >
          <TabPane
            tab={
              <span>
                <TrophyOutlined />
                My Events ({events.length})
              </span>
            }
            key="events"
          >
            <div className="events-section">
              <Row gutter={[16, 16]}>
                {events.map(event => (
                  <Col key={event.id} xs={24} sm={12} lg={8}>
                    {renderEventCard(event)}
                  </Col>
                ))}
              </Row>
            </div>
          </TabPane>

          <TabPane
            tab={
              <span>
                <HeartOutlined />
                Saved Events ({savedEvents.length})
              </span>
            }
            key="saved"
          >
            <div className="saved-section">
              <Row gutter={[16, 16]}>
                {savedEvents.map(event => (
                  <Col key={event.id} xs={24} sm={12} lg={8}>
                    <Card
                      hoverable
                      className="saved-event-card"
                      cover={
                        <img
                          alt={event.title}
                          src={event.media?.[0]?.url}
                          className="saved-event-image"
                        />
                      }
                      actions={[
                        <EyeOutlined key="view" />,
                        <HeartOutlined key="like" />,
                        <ShareAltOutlined key="share" />
                      ]}
                    >
                      <Card.Meta
                        title={event.title}
                        description={
                          <Space direction="vertical">
                            <Text type="secondary">
                              {event.location.name}
                            </Text>
                            <Tag color={getCategoryColor(event.category)}>
                              {event.category}
                            </Tag>
                            <Text>
                              {event.participants?.length || 0} going
                            </Text>
                          </Space>
                        }
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          </TabPane>

          <TabPane
            tab={
              <span>
                <StarOutlined />
                Statistics
              </span>
            }
            key="stats"
          >
            <div className="stats-section">
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={16}>
                  <Card title="Event Engagement" className="stats-card">
                    <ReactECharts
                      option={engagementData}
                      style={{ height: '300px' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} lg={8}>
                  <Card title="Event Categories" className="stats-card">
                    <ReactECharts
                      option={{
                        tooltip: {
                          trigger: 'item'
                        },
                        series: [{
                          type: 'pie',
                          radius: '70%',
                          data: categoryData,
                          emphasis: {
                            itemStyle: {
                              shadowBlur: 10,
                              shadowOffsetX: 0,
                              shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                          }
                        }]
                      }}
                      style={{ height: '300px' }}
                    />
                  </Card>
                </Col>
              </Row>

              <Row gutter={[16, 16]} className="mt-4">
                <Col xs={24} sm={12} lg={6}>
                  <Card className="stat-card">
                    <Statistic
                      title="Total Likes"
                      value={formatNumber(userStats.totalLikes)}
                      prefix={<HeartOutlined style={{ color: '#ef4444' }} />}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card className="stat-card">
                    <Statistic
                      title="Engagement Rate"
                      value="87%"
                      prefix={<AimOutlined style={{ color: '#10b981' }} />}
                    />
                    <Progress percent={87} size="small" />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card className="stat-card">
                    <Statistic
                      title="Avg. Event Rating"
                      value="4.8"
                      prefix={<StarOutlined style={{ color: '#f59e0b' }} />}
                      suffix="/ 5.0"
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card className="stat-card">
                    <Statistic
                      title="Revenue Generated"
                      value={formatNumber(12500)}
                      prefix={<DollarOutlined style={{ color: '#8b5cf6' }} />}
                    />
                  </Card>
                </Col>
              </Row>

              <Row gutter={[16, 16]} className="mt-4">
                <Col xs={24}>
                  <Card title="Achievements" className="stats-card">
                    <Row gutter={[16, 16]}>
                      <Col xs={12} sm={6} lg={3}>
                        <div className="achievement-item">
                          <TrophyOutlined className="achievement-icon gold" />
                          <Text className="achievement-title">Top Creator</Text>
                          <Text className="achievement-desc">Created 20+ events</Text>
                        </div>
                      </Col>
                      <Col xs={12} sm={6} lg={3}>
                        <div className="achievement-item">
                          <StarOutlined className="achievement-icon silver" />
                          <Text className="achievement-title">Community Star</Text>
                          <Text className="achievement-desc">1000+ followers</Text>
                        </div>
                      </Col>
                      <Col xs={12} sm={6} lg={3}>
                        <div className="achievement-item">
                          <HeartOutlined className="achievement-icon bronze" />
                          <Text className="achievement-title">Loved Events</Text>
                          <Text className="achievement-desc">500+ total likes</Text>
                        </div>
                      </Col>
                      <Col xs={12} sm={6} lg={3}>
                        <div className="achievement-item">
                          <AimOutlined className="achievement-icon platinum" />
                          <Text className="achievement-title">Goal Achiever</Text>
                          <Text className="achievement-desc">High engagement rate</Text>
                        </div>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              </Row>
            </div>
          </TabPane>

          <TabPane
            tab={
              <span>
                <SettingOutlined />
                Settings
              </span>
            }
            key="settings"
          >
            <div className="settings-section">
              <Card title="Account Settings" className="settings-card">
                <List
                  itemLayout="horizontal"
                  dataSource={[
                    {
                      title: 'Profile Information',
                      description: 'Update your name, bio, and profile photo',
                      action: <Button type="link">Edit</Button>
                    },
                    {
                      title: 'Privacy Settings',
                      description: 'Control who can see your events and activity',
                      action: <Button type="link">Manage</Button>
                    },
                    {
                      title: 'Notification Preferences',
                      description: 'Choose how you want to be notified',
                      action: <Button type="link">Configure</Button>
                    },
                    {
                      title: 'Connected Accounts',
                      description: 'Manage your social media connections',
                      action: <Button type="link">Manage</Button>
                    },
                    {
                      title: 'Data & Privacy',
                      description: 'Download your data or delete your account',
                      action: <Button type="link">View</Button>
                    }
                  ]}
                  renderItem={item => (
                    <List.Item actions={[item.action]}>
                      <List.Item.Meta
                        title={item.title}
                        description={item.description}
                      />
                    </List.Item>
                  )}
                />
              </Card>

              <Card title="App Settings" className="settings-card mt-4">
                <List
                  itemLayout="horizontal"
                  dataSource={[
                    {
                      title: 'Location Services',
                      description: 'Allow access to your location for event discovery',
                      action: <Switch defaultChecked />
                    },
                    {
                      title: 'Push Notifications',
                      description: 'Get notified about new events and updates',
                      action: <Switch defaultChecked />
                    },
                    {
                      title: 'Email Notifications',
                      description: 'Receive email updates about your events',
                      action: <Switch defaultChecked />
                    },
                    {
                      title: 'Auto-save Drafts',
                      description: 'Automatically save event drafts',
                      action: <Switch defaultChecked />
                    },
                    {
                      title: 'Data Saver Mode',
                      description: 'Reduce data usage by loading lower quality images',
                      action: <Switch />
                    }
                  ]}
                  renderItem={item => (
                    <List.Item actions={[item.action]}>
                      <List.Item.Meta
                        title={item.title}
                        description={item.description}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </div>
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

// Helper function to format numbers
const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

export default Profile;