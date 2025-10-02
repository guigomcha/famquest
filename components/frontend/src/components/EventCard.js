import React, { useState, useRef, useEffect } from 'react';
import {
  Card,
  Avatar,
  Typography,
  Space,
  Button,
  Image,
  Tag,
  Tooltip,
  Dropdown,
  Menu,
  message,
  Modal
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
  MoreOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import CommentSystem from './CommentSystem';
import EventMediaCarousel from './EventMediaCarousel';
import { useTranslation } from 'react-i18next';
import { getTimeAgo, getCategoryColor } from '../utils/helpers';
import { mockLocations, mockUsers, mockMedia } from '../utils/mockData';

const { Title, Text, Paragraph } = Typography;


export const EventCard = ({
  event,
  onComment,
  onEdit,
  onDelete,
  showActions = true,
  size = 'default'
}) => {
  const { t } = useTranslation();
  const [commentModalVisible, setCommentModalVisible] = useState(false);

  const [location, setLocation] = useState(null);
  const [owner, setOwner] = useState(null);
  const [ownerAvatar, setOwnerAvatar] = useState(null);

  useEffect(() => {
    (async () => {
      await new Promise(r => setTimeout(r, 0));

      const loc = mockLocations.find(l => l.id === event.location) || null;
      const usr = mockUsers.find(u => u.id === event.owner) || null;
      const av  = usr?.avatar ? mockMedia.find(m => m.id === usr.avatar) || null : null;

      setLocation(loc);
      setOwner(usr);
      setOwnerAvatar(av);
    })();
  }, [event]);

  const handleMenuClick = (key) => {
    switch (key) {
      case 'edit':
        if (onEdit) onEdit();
        break;
      case 'delete':
        if (onDelete) {
          Modal.confirm({
            title: t('common.delete'),
            content: t('common.confirm'),
            okText: t('common.delete'),
            okType: 'danger',
            onOk: onDelete(),
          });
        }
        break;
      case 'report':
        message.info('Report feature coming soon!');
        break;
    }
  };

  const menuItems = [
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: t('common.edit'),
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: t('common.delete'),
      danger: true,
    },
    {
      type: 'divider',
    }
  ];

  const cardSize = size === 'small' ? { width: 300 } : {};
  if (!event || !owner) {
    return (<></>)
  };

  return (
    <>
      <Card
        className={`event-card card-hover`}
        style={cardSize}
        cover={
          <div className="media-container">
            {event.media && (
              <EventMediaCarousel mediaIds={event.media} title={event.title} eventId={event.id} />
            )}
          </div>
        }
        actions={
          showActions
            ? [
                <Button
                  key="comment"
                  type="text"
                  icon={<CommentOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onComment();
                  }}
                >
                  {event.comments?.length || 0}
                </Button>,
                // TODO G: Could implement a full screen tab with a new button to show everything better.
                <Dropdown
                  key="more"
                  menu={{ items: menuItems, onClick: ({ key }) => handleMenuClick(key) }}
                  trigger={['click']}
                >
                  <Button
                    type="text"
                    icon={<MoreOutlined />}
                    onClick={(e) => e.stopPropagation()}
                  />
                </Dropdown>,
              ]
            : []
        }
      >
        <Card.Meta
          avatar={<Avatar src={ownerAvatar} icon={<UserOutlined />} />}
          title={
            <div className="event-header">
              <Text strong className="owner-name">
                {owner.name}
              </Text>
              <Space className="event-meta">
                {location && (
                  <Tooltip title={location.address}>
                    <Space size={4}>
                      <EnvironmentOutlined className="location-icon" />
                      <Text type="secondary" className="location-text">
                        {location.address.split(',')[0]}
                      </Text>
                    </Space>
                  </Tooltip>
                )}
                <Space size={4}>
                  <ClockCircleOutlined className="time-icon" />
                  <Text type="secondary" className="time-text">
                    {getTimeAgo(event.createdDate)}
                  </Text>
                </Space>
              </Space>
            </div>
          }
          description={
            <div className="event-content">
              <Title level={4} className="event-title">
                {event.title}
              </Title>
              {/* TODO: this should enable collapse as well */}
              <Paragraph
                className="event-description"
                ellipsis={{ rows: 3, expandable: true, symbol: t('common.more') }}
              >
                {event.description}
              </Paragraph>

              <div className="event-tags">
                {event.tags?.map((tag, index) => (
                  <Tag key={index} className="event-tag">
                    #{tag}
                  </Tag>
                ))}
              </div>
            </div>
          }
        />
      </Card>

      {/* Comment Modal */}
      <CommentSystem
        visible={commentModalVisible}
        onClose={() => setCommentModalVisible(false)}
        event={event}
        onCommentAdded={(comment) => {
          message.success('Comment added successfully!');
        }}
      />
    </>
  );
};

export default EventCard;