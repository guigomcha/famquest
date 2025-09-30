import React, { useState, useRef } from 'react';
import {
  Card,
  Avatar,
  Typography,
  Space,
  Button,
  Image,
  Carousel,
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
import { getTimeAgo, getCategoryColor } from '../utils/helpers';

const { Title, Text, Paragraph } = Typography;

const EventCard = ({ 
  event, 
  isLiked, 
  onLike, 
  onShare, 
  onComment, 
  onEdit, 
  onDelete,
  showActions = true,
  size = 'default'
}) => {
  const [playingVideos, setPlayingVideos] = useState(new Set());
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const videoRefs = useRef({});

  const toggleVideoPlayback = (mediaId) => {
    const newPlayingVideos = new Set(playingVideos);
    if (playingVideos.has(mediaId)) {
      newPlayingVideos.delete(mediaId);
      if (videoRefs.current[mediaId]) {
        videoRefs.current[mediaId].pause();
      }
    } else {
      newPlayingVideos.add(mediaId);
      if (videoRefs.current[mediaId]) {
        videoRefs.current[mediaId].play();
      }
    }
    setPlayingVideos(newPlayingVideos);
  };

  const handleDoubleClick = (e) => {
    // Double tap to like
    if (e.detail === 2 && onLike) {
      onLike();
    }
  };

  const openImageModal = (index) => {
    setSelectedImage(index);
    setImageModalVisible(true);
  };

  const handleMenuClick = (key) => {
    switch (key) {
      case 'edit':
        if (onEdit) onEdit();
        break;
      case 'delete':
        if (onDelete) {
          Modal.confirm({
            title: 'Delete Event',
            content: 'Are you sure you want to delete this event?',
            okText: 'Delete',
            okType: 'danger',
            onOk: onDelete,
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
      label: 'Edit Event',
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: 'Delete Event',
      danger: true,
    },
    {
      type: 'divider',
    },
    {
      key: 'report',
      label: 'Report Event',
    },
  ];

  const cardSize = size === 'small' ? { width: 300 } : {};

  return (
    <>
      <Card
        className={`event-card card-hover`}
        style={cardSize}
        cover={
          <div className="media-container" onClick={handleDoubleClick}>
            {event.media && (
              <Carousel
                arrows 
                dots={true}
                infinite={false}
                className="event-media-carousel"
              >
                {event.media.map((media, index) => (
                  <div key={index} className="media-item">
                    {media.type === 'image' ? (
                      <Image
                        src={media.url}
                        alt={`${event.title} - ${index + 1}`}
                        className="event-image"
                        preview={{
                          visible: imageModalVisible,
                          onVisibleChange: setImageModalVisible,
                          current: selectedImage,
                        }}
                        onClick={() => openImageModal(index)}
                      />
                    ) : (
                      <div className="video-container">
                        <video
                          ref={(el) => (videoRefs.current[media.id] = el)}
                          src={media.url}
                          className="event-video"
                          muted
                          loop
                        />
                        <Button
                          type="primary"
                          shape="circle"
                          icon={
                            playingVideos.has(media.id) ? (
                              <PauseCircleOutlined />
                            ) : (
                              <PlayCircleOutlined />
                            )
                          }
                          className="video-play-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleVideoPlayback(media.id);
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </Carousel>
            )}
          </div>
        }
        actions={
          showActions
            ? [
                <Button
                  key="like"
                  type="text"
                  icon={isLiked ? <HeartFilled style={{ color: '#ef4444' }} /> : <HeartOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onLike();
                  }}
                  className={isLiked ? 'liked' : ''}
                >
                  {event.likes}
                </Button>,
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
                <Button
                  key="share"
                  type="text"
                  icon={<ShareAltOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare();
                  }}
                />,
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
          avatar={<Avatar src={event.owner.avatar} icon={<UserOutlined />} />}
          title={
            <div className="event-header">
              <Text strong className="owner-name">
                {event.owner.name}
              </Text>
              <Space className="event-meta">
                <Tooltip title={event.location.name}>
                  <Space size={4}>
                    <EnvironmentOutlined className="location-icon" />
                    <Text type="secondary" className="location-text">
                      {event.location.name.split(',')[0]}
                    </Text>
                  </Space>
                </Tooltip>
                <Space size={4}>
                  <ClockCircleOutlined className="time-icon" />
                  <Text type="secondary" className="time-text">
                    {getTimeAgo(event.timestamp)}
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
              
              <Paragraph
                className="event-description"
                ellipsis={{ rows: 3, expandable: true, symbol: 'more' }}
              >
                {event.description}
              </Paragraph>

              <div className="event-tags">
                <Tag color={getCategoryColor(event.category)} className="category-tag">
                  {event.category}
                </Tag>
                {event.tags?.map((tag, index) => (
                  <Tag key={index} className="event-tag">
                    #{tag}
                  </Tag>
                ))}
              </div>

              {event.participants && event.participants.length > 0 && (
                <div className="event-participants">
                  <Space size={8}>
                    <Avatar.Group
                      maxCount={3}
                      maxStyle={{ color: '#f56a00', backgroundColor: '#fde3cf' }}
                    >
                      {event.participants.slice(0, 3).map((participant, index) => (
                        <Avatar
                          key={index}
                          src={participant.avatar}
                          icon={<UserOutlined />}
                          size="small"
                        />
                      ))}
                    </Avatar.Group>
                    <Text type="secondary" className="participants-text">
                      {event.participants.length} going
                    </Text>
                  </Space>
                </div>
              )}
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