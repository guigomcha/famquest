import React, { useState } from 'react';
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  Row,
  Col,
  Space,
  Typography,
  message,
  Steps,
  Divider,
  Upload,
  DatePicker,
  TimePicker,
  InputNumber,
  Switch
} from 'antd';
import {
  InboxOutlined,
  UploadOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
  CheckOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import MediaUpload from '../components/MediaUpload';
import { generateEventId, getCategoryColor } from '../utils/helpers';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Step } = Steps;
const { RangePicker } = DatePicker;

const EventUpload = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [eventData, setEventData] = useState({});

  const categories = [
    { key: 'wellness', label: 'Wellness', icon: '🧘‍♀️' },
    { key: 'technology', label: 'Technology', icon: '💻' },
    { key: 'arts', label: 'Arts', icon: '🎨' },
    { key: 'celebration', label: 'Celebration', icon: '🎉' },
    { key: 'education', label: 'Education', icon: '📚' },
    { key: 'sports', label: 'Sports', icon: '⚽' },
  ];

  const handleStepChange = (step) => {
    setCurrentStep(step);
  };

  const handleFormSubmit = async (values) => {
    setLoading(true);
    try {
      const newEvent = {
        id: generateEventId(),
        ...values,
        tags: values.tags ? values.tags.split(',').map(tag => tag.trim()) : [],
        media: mediaFiles,
        owner: {
          id: 'current-user',
          name: 'You',
          avatar: 'resources/user-avatars/user1.png'
        },
        participants: [],
        likes: 0,
        comments: [],
        timestamp: new Date().toISOString(),
        isPublic: values.isPublic !== false,
        requiresApproval: values.requiresApproval || false
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      message.success('Event created successfully!');
      navigate('/');
    } catch (error) {
      message.error('Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const handleMediaUpload = (files) => {
    const newMedia = files.map(file => ({
      id: `media-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      url: URL.createObjectURL(file),
      type: file.type.startsWith('image/') ? 'image' : 'video',
      name: file.name,
      size: file.size,
    }));
    setMediaFiles([...mediaFiles, ...newMedia]);
  };

  const handlePreview = () => {
    const values = form.getFieldsValue();
    setEventData(values);
    // Show preview modal or navigate to preview page
    message.info('Preview feature coming soon!');
  };

  const steps = [
    {
      title: 'Basic Info',
      content: (
        <Card title="Basic Information" className="upload-section">
          <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
            <Form.Item
              name="title"
              label="Event Title"
              rules={[{ required: true, message: 'Please enter event title' }]}
            >
              <Input placeholder="Give your event a catchy title..." maxLength={100} />
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
                  <InputNumber
                    placeholder="Unlimited"
                    min={1}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="price"
                  label="Price"
                  tooltip="Leave 0 for free events"
                >
                  <InputNumber
                    placeholder="0"
                    min={0}
                    step={0.01}
                    style={{ width: '100%' }}
                    formatter={value => `$ ${value}`}
                    parser={value => value.replace('$ ', '')}
                  />
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
        <Card title="Location & Time" className="upload-section">
          <Form form={form} layout="vertical">
            <Form.Item
              name="location"
              label="Location"
              rules={[{ required: true, message: 'Please enter event location' }]}
            >
              <Input placeholder="Enter venue or address" />
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="date"
                  label="Event Date"
                  rules={[{ required: true, message: 'Please select event date' }]}
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    disabledDate={(current) => current && current < new Date().setHours(0, 0, 0, 0)}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="time"
                  label="Event Time"
                  rules={[{ required: true, message: 'Please select event time' }]}
                >
                  <TimePicker style={{ width: '100%' }} format="HH:mm" />
                </Form.Item>
              </Col>
            </Row>

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
        <Card title="Event Media" className="upload-section">
          <MediaUpload
            onUpload={handleMediaUpload}
            accept="image/*,video/*"
            multiple
            maxCount={10}
            maxSize={50 * 1024 * 1024} // 50MB
          />

          {mediaFiles.length > 0 && (
            <div className="media-preview-section">
              <Divider>Uploaded Media</Divider>
              <Row gutter={[16, 16]}>
                {mediaFiles.map((media) => (
                  <Col key={media.id} xs={24} sm={12} md={8} lg={6}>
                    <Card
                      hoverable
                      className="media-card"
                      cover={
                        <div className="media-preview">
                          {media.type === 'image' ? (
                            <img
                              src={media.url}
                              alt={media.name}
                              className="media-image"
                            />
                          ) : (
                            <video
                              src={media.url}
                              className="media-video"
                              controls
                            />
                          )}
                        </div>
                      }
                    >
                      <Card.Meta
                        title={media.name}
                        description={`${(media.size / 1024 / 1024).toFixed(2)} MB`}
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          )}
        </Card>
      ),
    },
    {
      title: 'Settings',
      content: (
        <Card title="Event Settings" className="upload-section">
          <Form form={form} layout="vertical">
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="isPublic"
                  label="Event Visibility"
                  valuePropName="checked"
                  initialValue={true}
                >
                  <Switch
                    checkedChildren="Public"
                    unCheckedChildren="Private"
                    defaultChecked
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="requiresApproval"
                  label="Require Approval"
                  valuePropName="checked"
                  initialValue={false}
                >
                  <Switch
                    checkedChildren="Yes"
                    unCheckedChildren="No"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="additionalInfo"
              label="Additional Information"
              tooltip="Any special instructions or requirements"
            >
              <TextArea
                rows={4}
                placeholder="Special instructions, what to bring, etc."
              />
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      title: 'Review & Publish',
      content: (
        <Card title="Review & Publish" className="upload-section">
          <div className="review-section">
            <Title level={4}>Review Your Event</Title>
            <Text type="secondary">
              Please review all the information before publishing your event.
            </Text>

            <div className="review-actions">
              <Space>
                <Button
                  type="default"
                  icon={<EyeOutlined />}
                  onClick={handlePreview}
                >
                  Preview
                </Button>
                <Button
                  type="default"
                  icon={<SaveOutlined />}
                  onClick={() => message.info('Draft saved!')}
                >
                  Save Draft
                </Button>
              </Space>
            </div>
          </div>

          <Divider />

          <div className="publish-actions">
            <Space>
              <Button
                type="default"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/')}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                size="large"
                loading={loading}
                onClick={() => form.submit()}
                icon={<CheckOutlined />}
              >
                Publish Event
              </Button>
            </Space>
          </div>
        </Card>
      ),
    },
  ];

  return (
    <div className="event-upload">
      <div className="upload-header">
        <Title level={2} className="gradient-text">
          Create New Event
        </Title>
        <Text type="secondary">
          Share your experience with the community
        </Text>
      </div>

      <Steps
        current={currentStep}
        onChange={handleStepChange}
        className="upload-steps"
      >
        {steps.map((step) => (
          <Step key={step.title} title={step.title} />
        ))}
      </Steps>

      <div className="step-content">
        {steps[currentStep].content}
      </div>
    </div>
  );
};

export default EventUpload;