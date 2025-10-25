import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  Upload,
  Button,
  Card,
  Row,
  Col,
  Space,
  Typography,
  message,
  Steps,
  Divider,
  Image,
  Modal,
  Tabs,
  Tag,
  Tooltip
} from 'antd';
import {
  InboxOutlined,
  UploadOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  EyeOutlined,
  EditOutlined,
  SaveOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { mockEvents } from '../utils/mockData';
import MediaUpload from '../components/MediaUpload';
import { v4 as uuidv4 } from 'uuid';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Step } = Steps;
const { TabPane } = Tabs;

const EventEdit = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [eventData, setEventData] = useState(null);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [removedMedia, setRemovedMedia] = useState([]);
  const [playingVideos, setPlayingVideos] = useState(new Set());

  const categories = [
    { key: 'wellness', label: 'Wellness', icon: '🧘‍♀️' },
    { key: 'technology', label: 'Technology', icon: '💻' },
    { key: 'arts', label: 'Arts', icon: '🎨' },
    { key: 'celebration', label: 'Celebration', icon: '🎉' },
    { key: 'education', label: 'Education', icon: '📚' },
    { key: 'sports', label: 'Sports', icon: '⚽' },
  ];

  useEffect(() => {
    if (eventId) {
      loadEvent();
    }
  }, [eventId]);

  const loadEvent = () => {
    const event = mockEvents.find(e => e.id === eventId);
    if (event) {
      setEventData(event);
      setMediaFiles(event.media || []);
      form.setFieldsValue({
        title: event.title,
        description: event.description,
        category: event.category,
        location: event.location.name,
        date: event.timestamp,
        tags: event.tags?.join(', ') || '',
        capacity: event.capacity || null,
        price: event.price || 0,
      });
    } else {
      message.error('Event not found');
      navigate('/');
    }
  };

  const handleStepChange = (step) => {
    setCurrentStep(step);
  };

  const handleFormSubmit = async (values) => {
    setLoading(true);
    try {
      const updatedEvent = {
        ...eventData,
        ...values,
        tags: values.tags ? values.tags.split(',').map(tag => tag.trim()) : [],
        media: mediaFiles.filter(file => !removedMedia.includes(file.id)),
        updatedAt: new Date().toISOString(),
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      message.success('Event updated successfully!');
      navigate('/');
    } catch (error) {
      message.error('Failed to update event');
    } finally {
      setLoading(false);
    }
  };

  const handleMediaUpload = (files) => {
    const newMedia = files.map(file => ({
      id: uuidv4(),
      url: URL.createObjectURL(file),
      type: file.type.startsWith('image/') ? 'image' : 'video',
      name: file.name,
      size: file.size,
    }));
    setMediaFiles([...mediaFiles, ...newMedia]);
  };

  const handleMediaRemove = (mediaId) => {
    setRemovedMedia([...removedMedia, mediaId]);
    setMediaFiles(mediaFiles.filter(file => file.id !== mediaId));
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

  const showPreview = () => {
    const values = form.getFieldsValue();
    setPreviewVisible(true);
  };

  const steps = [
    {
      title: 'Basic Info',
      content: (
        <Card title="Basic Information" className="edit-section">
          <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
            <Form.Item
              name="title"
              label="Event Title"
              rules={[{ required: true, message: 'Please enter event title' }]}
            >
              <Input placeholder="Enter a catchy title for your event" maxLength={100} />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: 'Please enter event description' }]}
            >
              <ReactQuill
                theme="snow"
                placeholder="Describe your event in detail..."
                modules={{
                  toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['link', 'image'],
                    ['clean']
                  ],
                }}
              />
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="category"
                  label="Category"
                  rules={[{ required: true, message: 'Please select a category' }]}
                >
                  <Select placeholder="Select category">
                    {categories.map(cat => (
                      <Option key={cat.key} value={cat.key}>
                        <Space>
                          <span>{cat.icon}</span>
                          <span>{cat.label}</span>
                        </Space>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="tags"
                  label="Tags"
                  tooltip="Separate tags with commas"
                >
                  <Input placeholder="yoga, wellness, outdoor" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="capacity"
                  label="Capacity"
                  tooltip="Maximum number of participants"
                >
                  <Input type="number" placeholder="Unlimited" min={1} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="price"
                  label="Price"
                  tooltip="Leave 0 for free events"
                >
                  <Input type="number" placeholder="0" min={0} step={0.01} prefix="$" />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>
      ),
    },
    {
      title: 'Location & Time',
      content: (
        <Card title="Location & Time" className="edit-section">
          <Form form={form} layout="vertical">
            <Form.Item
              name="location"
              label="Location"
              rules={[{ required: true, message: 'Please enter event location' }]}
            >
              <Input placeholder="Enter venue or address" />
            </Form.Item>

            <Form.Item
              name="date"
              label="Event Date & Time"
              rules={[{ required: true, message: 'Please select event date' }]}
            >
              <Input type="datetime-local" />
            </Form.Item>

            <Form.Item
              name="duration"
              label="Duration"
              tooltip="How long will the event last?"
            >
              <Select placeholder="Select duration">
                <Option value="1h">1 hour</Option>
                <Option value="2h">2 hours</Option>
                <Option value="3h">3 hours</Option>
                <Option value="half-day">Half day</Option>
                <Option value="full-day">Full day</Option>
                <Option value="multiple-days">Multiple days</Option>
              </Select>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      title: 'Media',
      content: (
        <Card title="Event Media" className="edit-section">
          <MediaUpload
            onUpload={handleMediaUpload}
            accept="image/*,video/*"
            multiple
            maxCount={10}
          />

          {mediaFiles.length > 0 && (
            <div className="media-preview-section">
              <Divider>Current Media</Divider>
              <Row gutter={[16, 16]}>
                {mediaFiles.map((media) => (
                  !removedMedia.includes(media.id) && (
                    <Col key={media.id} xs={24} sm={12} md={8} lg={6}>
                      <Card
                        hoverable
                        className="media-card"
                        cover={
                          <div className="media-preview">
                            {media.type === 'image' ? (
                              <Image
                                src={media.url}
                                alt={media.name}
                                className="media-image"
                                preview
                              />
                            ) : (
                              <div className="video-preview">
                                <video
                                  src={media.url}
                                  className="media-video"
                                  muted
                                />
                                <div className="video-overlay">
                                  <PlayCircleOutlined className="play-icon" />
                                </div>
                              </div>
                            )}
                          </div>
                        }
                        actions={[
                          <Tooltip title="Remove">
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => handleMediaRemove(media.id)}
                            />
                          </Tooltip>
                        ]}
                      >
                        <Card.Meta
                          title={media.name}
                          description={`${(media.size / 1024 / 1024).toFixed(2)} MB`}
                        />
                      </Card>
                    </Col>
                  )
                ))}
              </Row>
            </div>
          )}
        </Card>
      ),
    },
    {
      title: 'Review & Publish',
      content: (
        <Card title="Review & Publish" className="edit-section">
          <div className="preview-section">
            <Title level={4}>Event Preview</Title>
            <div className="preview-content">
              {/* Preview content would go here */}
              <Button
                type="primary"
                icon={<EyeOutlined />}
                onClick={showPreview}
                className="mb-4"
              >
                Preview Event
              </Button>
            </div>
          </div>

          <Space className="action-buttons">
            <Button
              type="default"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/')}
            >
              Cancel
            </Button>
            <Button
              type="default"
              icon={<SaveOutlined />}
              onClick={() => message.info('Draft saved!')}
            >
              Save Draft
            </Button>
            <Button
              type="primary"
              loading={loading}
              onClick={() => form.submit()}
            >
              Update Event
            </Button>
          </Space>
        </Card>
      ),
    },
  ];

  return (
    <div className="event-edit">
      <div className="edit-header">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/')}
          className="back-button"
        >
          Back to Events
        </Button>
        <Title level={2} className="gradient-text">
          Edit Event
        </Title>
        <Text type="secondary">
          Update your event details and media
        </Text>
      </div>

      <Steps
        current={currentStep}
        onChange={handleStepChange}
        className="edit-steps"
      >
        {steps.map((step) => (
          <Step key={step.title} title={step.title} />
        ))}
      </Steps>

      <div className="step-content">
        {steps[currentStep].content}
      </div>

      {/* Preview Modal */}
      <Modal
        title="Event Preview"
        visible={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        width={800}
        footer={null}
      >
        <div className="event-preview">
          {/* Preview content would be rendered here */}
          <p>Event preview coming soon...</p>
        </div>
      </Modal>
    </div>
  );
};

export default EventEdit;