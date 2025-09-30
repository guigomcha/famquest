import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Modal,
  message,
  Tabs,
  Timeline,
  Badge,
  Divider,
  Tooltip,
  Tag,
  Switch
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  CarOutlined,
  UserOutlined,
  GlobalOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  ShareAltOutlined,
  SaveOutlined,
  CloseOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined
} from '@ant-design/icons';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';
import { mockEvents, mockLocations } from '../utils/mockData';
import EventCard from '../components/EventCard';
import './Trips.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = require('antd/lib/date-picker/generatePicker');

const Trips = () => {
  const { t } = useTranslation();
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('list');
  const [mapCenter, setMapCenter] = useState([37.7749, -122.4194]);
  const [mapZoom, setMapZoom] = useState(8);

  const transportationModes = [
    { key: 'car', label: t('trip.car'), icon: <CarOutlined /> },
    { key: 'walking', label: t('trip.walking'), icon: <GlobalOutlined /> },
    { key: 'cycling', label: t('trip.cycling'), icon: <GlobalOutlined /> },
    { key: 'publicTransport', label: t('trip.publicTransport'), icon: <GlobalOutlined /> },
    { key: 'plane', label: t('trip.plane'), icon: <GlobalOutlined /> }
  ];

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = () => {
    // Mock trips data
    const mockTrips = [
      {
        id: 'trip-1',
        name: 'California Coast Adventure',
        description: 'A scenic road trip along the California coast',
        startLocation: {
          name: 'San Francisco, CA',
          lat: 37.7749,
          lng: -122.4194,
          address: 'San Francisco, California'
        },
        endLocation: {
          name: 'Los Angeles, CA',
          lat: 34.0522,
          lng: -118.2437,
          address: 'Los Angeles, California'
        },
        waypoints: [
          {
            id: 'wp-1',
            name: 'Monterey, CA',
            lat: 36.6002,
            lng: -121.8947,
            order: 1,
            events: [mockEvents[0]] // Yoga retreat
          },
          {
            id: 'wp-2',
            name: 'San Luis Obispo, CA',
            lat: 35.2828,
            lng: -120.6596,
            order: 2,
            events: []
          },
          {
            id: 'wp-3',
            name: 'Santa Barbara, CA',
            lat: 34.4208,
            lng: -119.6982,
            order: 3,
            events: [mockEvents[2]] // Art exhibition
          }
        ],
        transportation: 'car',
        startDate: '2024-03-15',
        endDate: '2024-03-20',
        totalDistance: 380,
        estimatedTime: '6 hours',
        budget: 1200,
        isPublic: true,
        status: 'planned',
        createdAt: new Date().toISOString(),
        createdBy: 'user-1'
      },
      {
        id: 'trip-2',
        name: 'Tech Conference Tour',
        description: 'Visiting tech conferences across major cities',
        startLocation: {
          name: 'New York, NY',
          lat: 40.7128,
          lng: -74.0060,
          address: 'New York, New York'
        },
        endLocation: {
          name: 'San Francisco, CA',
          lat: 37.7749,
          lng: -122.4194,
          address: 'San Francisco, California'
        },
        waypoints: [
          {
            id: 'wp-4',
            name: 'Boston, MA',
            lat: 42.3601,
            lng: -71.0589,
            order: 1,
            events: []
          },
          {
            id: 'wp-5',
            name: 'Chicago, IL',
            lat: 41.8781,
            lng: -87.6298,
            order: 2,
            events: []
          }
        ],
        transportation: 'plane',
        startDate: '2024-04-10',
        endDate: '2024-04-15',
        totalDistance: 2900,
        estimatedTime: '8 hours',
        budget: 2500,
        isPublic: false,
        status: 'active',
        createdAt: new Date().toISOString(),
        createdBy: 'user-1'
      }
    ];

    setTrips(mockTrips);
  };

  const showAddModal = () => {
    setModalMode('add');
    setModalVisible(true);
    form.resetFields();
    form.setFieldsValue({
      transportation: 'car',
      isPublic: true,
      waypoints: []
    });
  };

  const showEditModal = (trip) => {
    setModalMode('edit');
    setSelectedTrip(trip);
    setModalVisible(true);
    
    form.setFieldsValue({
      name: trip.name,
      description: trip.description,
      startLocation: trip.startLocation.name,
      endLocation: trip.endLocation.name,
      transportation: trip.transportation,
      startDate: trip.startDate,
      endDate: trip.endDate,
      budget: trip.budget,
      isPublic: trip.isPublic,
      waypoints: trip.waypoints || []
    });
  };

  const handleSubmit = async (values) => {
    try {
      if (modalMode === 'add') {
        // Create new trip
        const newTrip = {
          id: uuidv4(),
          name: values.name,
          description: values.description,
          startLocation: {
            name: values.startLocation,
            lat: 37.7749 + (Math.random() - 0.5) * 2,
            lng: -122.4194 + (Math.random() - 0.5) * 2,
            address: values.startLocation
          },
          endLocation: {
            name: values.endLocation,
            lat: 37.7749 + (Math.random() - 0.5) * 2,
            lng: -122.4194 + (Math.random() - 0.5) * 2,
            address: values.endLocation
          },
          waypoints: values.waypoints || [],
          transportation: values.transportation,
          startDate: values.startDate,
          endDate: values.endDate,
          budget: values.budget || 0,
          isPublic: values.isPublic,
          status: 'planned',
          createdAt: new Date().toISOString(),
          createdBy: 'current-user'
        };

        // Calculate trip details
        newTrip.totalDistance = calculateDistance(newTrip);
        newTrip.estimatedTime = calculateEstimatedTime(newTrip);

        setTrips([...trips, newTrip]);
        message.success('Trip created successfully!');
      } else {
        // Update existing trip
        const updatedTrips = trips.map(trip => 
          trip.id === selectedTrip.id 
            ? { 
                ...trip, 
                name: values.name,
                description: values.description,
                transportation: values.transportation,
                startDate: values.startDate,
                endDate: values.endDate,
                budget: values.budget || 0,
                isPublic: values.isPublic,
                updatedAt: new Date().toISOString()
              }
            : trip
        );

        setTrips(updatedTrips);
        message.success('Trip updated successfully!');
      }

      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to save trip');
    }
  };

  const calculateDistance = (trip) => {
    // Mock distance calculation
    return Math.floor(Math.random() * 500) + 100;
  };

  const calculateEstimatedTime = (trip) => {
    // Mock time calculation based on transportation
    const timeMap = {
      car: '6 hours',
      plane: '2 hours',
      train: '4 hours',
      cycling: '3 days',
      walking: '1 week'
    };
    return timeMap[trip.transportation] || 'Unknown';
  };

  const handleDelete = (tripId) => {
    Modal.confirm({
      title: 'Delete Trip',
      content: 'Are you sure you want to delete this trip?',
      okText: 'Delete',
      okType: 'danger',
      onOk: () => {
        setTrips(trips.filter(trip => trip.id !== tripId));
        message.success('Trip deleted successfully!');
      }
    });
  };

  const addWaypoint = () => {
    const currentWaypoints = form.getFieldValue('waypoints') || [];
    const newWaypoint = {
      id: uuidv4(),
      name: '',
      lat: 37.7749,
      lng: -122.4194,
      order: currentWaypoints.length + 1,
      events: []
    };
    
    form.setFieldsValue({
      waypoints: [...currentWaypoints, newWaypoint]
    });
  };

  const removeWaypoint = (index) => {
    const currentWaypoints = form.getFieldValue('waypoints') || [];
    const updatedWaypoints = currentWaypoints.filter((_, i) => i !== index);
    
    // Update order
    updatedWaypoints.forEach((wp, i) => {
      wp.order = i + 1;
    });
    
    form.setFieldsValue({
      waypoints: updatedWaypoints
    });
  };

  const renderTripCard = (trip) => {
    const statusColors = {
      planned: 'blue',
      active: 'green',
      completed: 'gray',
      cancelled: 'red'
    };

    const transportationConfig = transportationModes.find(t => t.key === trip.transportation);

    return (
      <Card
        key={trip.id}
        className="trip-card"
        hoverable
        cover={
          <div className="trip-map-preview">
            <img
              src={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s-a+3b82f6(${trip.startLocation.lng},${trip.startLocation.lat}),pin-s-b+ef4444(${trip.endLocation.lng},${trip.endLocation.lat})/auto/400x200?access_token=pk.placeholder`}
              alt={trip.name}
              className="trip-preview-image"
            />
            <div className="trip-overlay">
              <div className="trip-stats">
                <Space>
                  <Text>
                    <GlobalOutlined /> {trip.totalDistance} km
                  </Text>
                  <Text>
                    <ClockCircleOutlined /> {trip.estimatedTime}
                  </Text>
                  <Text>
                    <DollarOutlined /> ${trip.budget}
                  </Text>
                </Space>
              </div>
            </div>
          </div>
        }
        actions={[
          <Tooltip title={t('common.view')}>
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedTrip(trip);
                setActiveTab('map');
              }}
            />
          </Tooltip>,
          <Tooltip title={t('common.edit')}>
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => showEditModal(trip)}
            />
          </Tooltip>,
          <Tooltip title={t('common.share')}>
            <Button
              type="text"
              icon={<ShareAltOutlined />}
              onClick={() => message.success('Trip shared!')}
            />
          </Tooltip>,
          <Tooltip title={t('common.delete')}>
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(trip.id)}
            />
          </Tooltip>
        ]}
      >
        <div className="trip-content">
          <div className="trip-header">
            <Title level={4} className="trip-title">
              {trip.name}
            </Title>
            <div className="trip-status">
              <Badge
                status={statusColors[trip.status]}
                text={trip.status}
              />
            </div>
          </div>
          
          <Paragraph
            className="trip-description"
            ellipsis={{ rows: 2 }}
          >
            {trip.description}
          </Paragraph>
          
          <div className="trip-details">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div className="trip-locations">
                <Space>
                  <EnvironmentOutlined />
                  <Text>{trip.startLocation.name}</Text>
                  <Text type="secondary">→</Text>
                  <Text>{trip.endLocation.name}</Text>
                </Space>
              </div>
              
              <div className="trip-transportation">
                <Space>
                  {transportationConfig?.icon}
                  <Text>{transportationConfig?.label}</Text>
                </Space>
              </div>
              
              <div className="trip-dates">
                <Space>
                  <CalendarOutlined />
                  <Text>{trip.startDate}</Text>
                  <Text type="secondary">→</Text>
                  <Text>{trip.endDate}</Text>
                </Space>
              </div>
              
              {trip.waypoints && trip.waypoints.length > 0 && (
                <div className="trip-waypoints">
                  <Text type="secondary">
                    {trip.waypoints.length} {t('trip.waypoints')}
                  </Text>
                </div>
              )}
            </Space>
          </div>
        </div>
      </Card>
    );
  };

  const renderTripTimeline = (trip) => {
    const timelineItems = [
      {
        dot: <EnvironmentOutlined style={{ color: '#3b82f6' }} />,
        children: (
          <div>
            <Title level={5}>{t('trip.startLocation')}</Title>
            <Text>{trip.startLocation.name}</Text>
            <br />
            <Text type="secondary">{trip.startDate}</Text>
          </div>
        )
      }
    ];

    // Add waypoints
    if (trip.waypoints) {
      trip.waypoints.forEach((waypoint, index) => {
        timelineItems.push({
          dot: <GlobalOutlined style={{ color: '#8b5cf6' }} />,
          children: (
            <div>
              <Title level={5}>{t('trip.waypoint')} {index + 1}</Title>
              <Text>{waypoint.name}</Text>
              {waypoint.events && waypoint.events.length > 0 && (
                <div className="waypoint-events">
                  <Text type="secondary">
                    {waypoint.events.length} {t('event.events')}
                  </Text>
                </div>
              )}
            </div>
          )
        });
      });
    }

    timelineItems.push({
      dot: <EnvironmentOutlined style={{ color: '#ef4444' }} />,
      children: (
        <div>
          <Title level={5}>{t('trip.endLocation')}</Title>
          <Text>{trip.endLocation.name}</Text>
          <br />
          <Text type="secondary">{trip.endDate}</Text>
        </div>
      )
    });

    return timelineItems;
  };

  const renderMap = (trip) => {
    if (!trip) return null;

    const positions = [
      [trip.startLocation.lat, trip.startLocation.lng],
      ...trip.waypoints.map(wp => [wp.lat, wp.lng]),
      [trip.endLocation.lat, trip.endLocation.lng]
    ];

    return (
      <div className="trip-map">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '400px', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <Polyline
            positions={positions}
            color="#8b5cf6"
            weight={4}
            opacity={0.8}
          />
          
          {/* Start marker */}
          <Marker position={[trip.startLocation.lat, trip.startLocation.lng]}>
            <Popup>
              <div>
                <strong>Start:</strong> {trip.startLocation.name}
              </div>
            </Popup>
          </Marker>
          
          {/* Waypoint markers */}
          {trip.waypoints.map((waypoint, index) => (
            <Marker key={waypoint.id} position={[waypoint.lat, waypoint.lng]}>
              <Popup>
                <div>
                  <strong>Waypoint {index + 1}:</strong> {waypoint.name}
                </div>
              </Popup>
            </Marker>
          ))}
          
          {/* End marker */}
          <Marker position={[trip.endLocation.lat, trip.endLocation.lng]}>
            <Popup>
              <div>
                <strong>End:</strong> {trip.endLocation.name}
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    );
  };

  return (
    <div className="trips-page">
      <div className="page-header">
        <div className="header-content">
          <Title level={2} className="gradient-text">
            <GlobalOutlined /> {t('trip.trips')}
          </Title>
          <Text type="secondary">
            {t('trip.manageTrips')}
          </Text>
        </div>
        
        <div className="header-actions">
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={showAddModal}
            >
              {t('trip.createTrip')}
            </Button>
          </Space>
        </div>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        className="trips-tabs"
      >
        <TabPane
          tab={
            <span>
              <GlobalOutlined />
              {t('trip.trips')} ({trips.length})
            </span>
          }
          key="list"
        >
          <div className="trips-list">
            <Row gutter={[16, 16]}>
              {trips.map(trip => (
                <Col key={trip.id} xs={24} sm={12} lg={8}>
                  {renderTripCard(trip)}
                </Col>
              ))}
            </Row>
          </div>
        </TabPane>

        {selectedTrip && (
          <TabPane
            tab={
              <span>
                <EyeOutlined />
                {selectedTrip.name}
              </span>
            }
            key="detail"
          >
            <div className="trip-detail">
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={16}>
                  <Card
                    title={
                      <div className="detail-header">
                        <Title level={3}>{selectedTrip.name}</Title>
                        <Space>
                          <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => showEditModal(selectedTrip)}
                          >
                            {t('common.edit')}
                          </Button>
                          <Button
                            icon={<ShareAltOutlined />}
                            onClick={() => message.success('Trip shared!')}
                          >
                            {t('common.share')}
                          </Button>
                        </Space>
                      </div>
                    }
                  >
                    <Paragraph>{selectedTrip.description}</Paragraph>
                    
                    <Divider />
                    
                    <div className="trip-info-grid">
                      <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12}>
                          <div className="info-item">
                            <Text strong>{t('trip.startLocation')}:</Text>
                            <br />
                            <Text>{selectedTrip.startLocation.name}</Text>
                          </div>
                        </Col>
                        <Col xs={24} sm={12}>
                          <div className="info-item">
                            <Text strong>{t('trip.endLocation')}:</Text>
                            <br />
                            <Text>{selectedTrip.endLocation.name}</Text>
                          </div>
                        </Col>
                        <Col xs={24} sm={12}>
                          <div className="info-item">
                            <Text strong>{t('trip.transportation')}:</Text>
                            <br />
                            <Text>
                              {transportationModes.find(t => t.key === selectedTrip.transportation)?.label}
                            </Text>
                          </div>
                        </Col>
                        <Col xs={24} sm={12}>
                          <div className="info-item">
                            <Text strong>{t('trip.totalDistance')}:</Text>
                            <br />
                            <Text>{selectedTrip.totalDistance} km</Text>
                          </div>
                        </Col>
                        <Col xs={24} sm={12}>
                          <div className="info-item">
                            <Text strong>{t('trip.estimatedTime')}:</Text>
                            <br />
                            <Text>{selectedTrip.estimatedTime}</Text>
                          </div>
                        </Col>
                        <Col xs={24} sm={12}>
                          <div className="info-item">
                            <Text strong>{t('trip.budget')}:</Text>
                            <br />
                            <Text>${selectedTrip.budget}</Text>
                          </div>
                        </Col>
                      </Row>
                    </div>
                    
                    <Divider />
                    
                    <div className="trip-timeline">
                      <Title level={4}>{t('trip.tripTimeline')}</Title>
                      <Timeline items={renderTripTimeline(selectedTrip)} />
                    </div>
                  </Card>
                </Col>
                
                <Col xs={24} lg={8}>
                  <Card title={t('trip.tripMap')}>
                    {renderMap(selectedTrip)}
                  </Card>
                  
                  {selectedTrip.waypoints && selectedTrip.waypoints.length > 0 && (
                    <Card 
                      title={t('trip.waypoints')} 
                      className="waypoints-card"
                      style={{ marginTop: 16 }}
                    >
                      <Timeline
                        items={selectedTrip.waypoints.map((wp, index) => ({
                          dot: <GlobalOutlined style={{ color: '#8b5cf6' }} />,
                          children: (
                            <div className="waypoint-item">
                              <Title level={5}>{wp.name}</Title>
                              {wp.events && wp.events.length > 0 && (
                                <div className="waypoint-events">
                                  {wp.events.map(event => (
                                    <Tag key={event.id} color="blue">
                                      {event.title}
                                    </Tag>
                                  ))}
                                </div>
                              )}
                            </div>
                          )
                        }))}
                      />
                    </Card>
                  )}
                </Col>
              </Row>
            </div>
          </TabPane>
        )}
      </Tabs>

      {/* Add/Edit Modal */}
      <Modal
        title={modalMode === 'add' ? t('trip.createTrip') : t('trip.editTrip')}
        visible={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="name"
                label={t('trip.tripName')}
                rules={[{ required: true, message: 'Please enter trip name' }]}
              >
                <Input placeholder="Enter trip name" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="transportation"
                label={t('trip.transportation')}
                rules={[{ required: true, message: 'Please select transportation' }]}
              >
                <Select placeholder="Select transportation">
                  {transportationModes.map(mode => (
                    <Option key={mode.key} value={mode.key}>
                      <Space>
                        {mode.icon}
                        <span>{mode.label}</span>
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label={t('trip.tripDescription')}
            rules={[{ required: true, message: 'Please enter trip description' }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Describe your trip..."
            />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="startLocation"
                label={t('trip.startLocation')}
                rules={[{ required: true, message: 'Please enter start location' }]}
              >
                <Input placeholder="Enter start location" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="endLocation"
                label={t('trip.endLocation')}
                rules={[{ required: true, message: 'Please enter end location' }]}
              >
                <Input placeholder="Enter end location" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="startDate"
                label={t('event.startDate')}
                rules={[{ required: true, message: 'Please select start date' }]}
              >
                <Input type="date" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="endDate"
                label={t('event.endDate')}
                rules={[{ required: true, message: 'Please select end date' }]}
              >
                <Input type="date" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="budget"
                label={t('trip.budget')}
              >
                <InputNumber
                  min={0}
                  step={0.01}
                  style={{ width: '100%' }}
                  prefix="$"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="isPublic"
                label={t('event.publicEvent')}
                valuePropName="checked"
              >
                <Switch
                  checkedChildren="Public"
                  unCheckedChildren="Private"
                  defaultChecked
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Button
              type="dashed"
              onClick={addWaypoint}
              icon={<PlusOutlined />}
              style={{ width: '100%' }}
            >
              {t('trip.addWaypoint')}
            </Button>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
              >
                {modalMode === 'add' ? t('trip.createTrip') : t('common.save')}
              </Button>
              <Button
                onClick={() => {
                  setModalVisible(false);
                  form.resetFields();
                }}
              >
                {t('common.cancel')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Trips;