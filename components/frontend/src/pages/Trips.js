/* Trips.jsx  –  full location objects + lazy load + mobile responsive */
import React, { useState, useMemo } from 'react';
import {
  Card, Button, Space, Typography, Row, Col, Modal, Form, Input, InputNumber, Select, message, Tabs, Tag, Timeline,
} from 'antd';
import {
  PlusOutlined, EditOutlined, CloseOutlined, EyeOutlined, DeleteOutlined, GlobalOutlined, CalendarOutlined, DollarOutlined, SaveOutlined, EnvironmentOutlined, ClockCircleOutlined,
} from '@ant-design/icons';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';
import { mockTrips, mockEvents, mockLocations, mockUsers } from '../utils/mockData';
import EventCard from '../components/EventCard';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const PURPLE_MAIN = '#8b5cf6';

/* ---- transportation modes  ---- */
const transportationModes = [
  { key: 'car',   label: 'Car',   icon: '🚗' },
  { key: 'plane', label: 'Plane', icon: '✈️' },
  { key: 'train', label: 'Train', icon: '🚂' },
  { key: 'bus',   label: 'Bus',   icon: '🚌' },
  { key: 'bike',  label: 'Bike',  icon: '🚴' },
];

/* ---- haversine km  ---- */
const haversine = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const toRad = x => x * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/* ---- lookup helper  ---- */
const findLocationByAddress = (addr) => {
  return mockLocations.find(l => l.address === addr) || {
    id: uuidv4(),
    address: addr,
    lat: 37.77 + (Math.random() - 0.5) * 2,   // fallback
    lng: -122.4 + (Math.random() - 0.5) * 2,
  };
};

/* ---- backend-ready DTO  ---- */
const prepareTripForBackend = (vals, mode, id) => ({
  id: mode === 'add' ? uuidv4() : id,
  name: vals.name,
  description: vals.description,
  owner: 'user-1',
  involvedUsers: vals.involvedUsers || [],
  transportation: vals.transportation,
  budget: vals.budget || 0,
  isPublic: vals.isPublic,
  status: 'planned',
  startTime: vals.startDate + 'T00:00:00Z',
  endTime: vals.endDate + 'T23:59:59Z',
  startLocation: findLocationByAddress(vals.startLocation),
  endLocation: findLocationByAddress(vals.endLocation),
  stops: vals.stops.map((s, idx) => ({ eventId: s.eventId, order: idx })),
  createdAt: new Date().toISOString(),
});

/* ---- reorderable stop editor  ---- */
const StopEditor = ({ value = [], onChange }) => {
  const [stops, setStops] = useState(value);

  const move = (from, to) => {
    const clone = [...stops];
    const [item] = clone.splice(from, 1);
    clone.splice(to, 0, item);
    setStops(clone);
    onChange(clone);
  };

  const addStop = () => {
    const next = [...stops, { eventId: '', order: stops.length }];
    setStops(next);
    onChange(next);
  };

  const removeStop = (idx) => {
    const next = stops.filter((_, i) => i !== idx);
    onChange(next);
  };

  return (
    <div>
      <Button type="dashed" onClick={addStop} icon={<PlusOutlined />} style={{ width: '100%', marginBottom: 8 }}>
        Add Stop
      </Button>
      {stops.map((s, idx) => (
        <Card key={idx} size="small" style={{ marginBottom: 8 }}>
          <Space align="center" style={{ width: '100%' }}>
            <Button
              size="small"
              icon="⋮"
              onClick={() => {
                const dir = window.prompt('Move up (u) / down (d)?');
                if (dir === 'u' && idx > 0) move(idx, idx - 1);
                if (dir === 'd' && idx < stops.length - 1) move(idx, idx + 1);
              }}
            />
            <Select
              value={s.eventId}
              onChange={(id) => {
                const next = [...stops];
                next[idx] = { ...next[idx], eventId: id };
                setStops(next);
                onChange(next);
              }}
              placeholder="Choose stop (event)"
              style={{ flex: 1 }}
              showSearch
            >
              {mockEvents.map(ev => (
                <Option key={ev.id} value={ev.id}>
                  {ev.title}
                </Option>
              ))}
            </Select>
            <Button size="small" icon={<CloseOutlined />} onClick={() => removeStop(idx)} />
          </Space>
        </Card>
      ))}
    </div>
  );
};

/* ---- trip card with real map + stop list  ---- */
const TripCard = ({ trip, onEdit, onDelete, onStopClick }) => {
  // TODO G: bring here the fetch
  const mode = transportationModes.find(m => m.key === trip.transportation);

  const stops = useMemo(() => {
    return trip.stops
      .map(s => mockEvents.find(e => e.id === s.eventId))
      .filter(Boolean)
      .map(e => ({ ...e, fullLocation: mockLocations.find(l => l.id === e.location) }))
      .filter(s => s.fullLocation); // drop if location missing
  }, [trip]);

  /* open stop event card  */
  const openStop = (stop) => {
    if (stop.event) onStopClick(stop.event);
  };

  return (
    <Card
      hoverable
      style={{
            zIndex: 1000,
            height: "100vh", 
            width: "100vw"
          }}
      actions={[
        <Button type="text" icon={<EditOutlined />} onClick={() => onEdit(trip)} />,
        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => onDelete(trip)} />,
      ]}
    >
      <Title level={5}>{trip.name}</Title>
      <Text type="secondary">{trip.description}</Text>
      <br />
      <Space>
        <Tag>{trip.startTime.slice(0, 10)} → {trip.endTime.slice(0, 10)}</Tag>
        <Tag>{trip.stops.length} stops</Tag>
      </Space>
      <Space>
          <MapContainer center={[stops[0].fullLocation.lat, stops[0].fullLocation.lng]} zoom={6} style={{ height: 200, width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Polyline positions={stops.map(s => [s.fullLocation.lat, s.fullLocation.lng])} color={PURPLE_MAIN} weight={4} />
            {stops.map((s, idx) => (
              <Marker
                key={s.fullLocation.id}
                position={[s.fullLocation.lat, s.fullLocation.lng]}
                eventHandlers={{ click: () => openStop(s) }}
                color={idx % 2 ? 'blue' : 'orange'}
              >
                <Popup>
                  <strong>Stop {idx + 1}</strong><br />
                  {s.fullLocation.name}<br />
                  <Space>
                    <Text type="secondary">+XX km</Text>
                    <Text type="secondary">XX time spent</Text>
                  </Space>
                  <Button size="small" onClick={() => openStop(s)}>Open Stop</Button>
                </Popup>
              </Marker>
            // TODO G: draw line from one to the next
            ))}
          </MapContainer>
      </Space>
    </Card>
  );
};

/* ----------  main component  ---------- */
const Trips = () => {
  const { t } = useTranslation();
  const [trips, setTrips] = useState(mockTrips);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [viewModal, setViewModal] = useState(null);
  const [form] = Form.useForm();

  /* ---- CRUD  ---- */
  const showAdd = () => {
    setModalMode('add');
    form.resetFields();
    form.setFieldsValue({ stops: [], involvedUsers: [], isPublic: true });
    setModalVisible(true);
  };
  const showEdit = (trip) => {
    setModalMode('edit');
    setSelectedTrip(trip);
    form.setFieldsValue({
      name: trip.name,
      description: trip.description,
      transportation: trip.transportation,
      budget: trip.budget,
      isPublic: trip.isPublic,
      startDate: trip.startTime.slice(0, 10),
      endDate: trip.endTime.slice(0, 10),
      involvedUsers: trip.involvedUsers,
      startLocation: trip.startLocation.address,   // full object → address string
      endLocation: trip.endLocation.address,
      stops: trip.stops.map(s => ({ eventId: s.eventId })),
    });
    setModalVisible(true);
  };
  const handleSubmit = (vals) => {
    if (vals.stops.length < 2) return message.error('At least 2 stops are required');
    const dto = prepareTripForBackend(vals, modalMode, selectedTrip?.id);
    if (modalMode === 'add') setTrips([...trips, dto]);
    else setTrips(trips.map(t => (t.id === selectedTrip.id ? dto : t)));
    message.success('Trip saved');
    setModalVisible(false);
  };
  const handleDelete = (trip) => {
    Modal.confirm({ title: 'Delete trip?', onOk: () => setTrips(trips.filter(t => t.id !== trip.id)) });
  };

  /* ---- open stop event card  ---- */
  const handleStopClick = (stop) => {
    setViewModal({ stop });
  };

  /* ---- render  ---- */
  return (
    <div className="trips-page">
      <Row align="middle" style={{ marginBottom: 16 }}>
        <Col flex="auto">
          <Title level={3}><GlobalOutlined /> {t('trip.trips')}</Title>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={showAdd}>
            {t('trip.createTrip')}
          </Button>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {trips.map(t => (
          <Col key={t.id} xs={24} sm={12} lg={8}>
            <TripCard trip={t} onEdit={showEdit} onDelete={handleDelete} onStopClick={handleStopClick} />
          </Col>
        ))}
      </Row>

      {/* ---- Add / Edit Modal ---- */}
      <Modal
        title={modalMode === 'add' ? t('trip.createTrip') : t('trip.editTrip')}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col xs={24} sm={12}><Form.Item name="name" label="Name" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col xs={24} sm={12}><Form.Item name="transportation" label="Transport" rules={[{ required: true }]}><Select>{transportationModes.map(m => <Option key={m.key} value={m.key}>{m.label}</Option>)}</Select></Form.Item></Col>
          </Row>
          <Form.Item name="description" label="Description" rules={[{ required: true }]}><Input.TextArea rows={3} /></Form.Item>
          <Row gutter={16}>
            <Col xs={24} sm={12}><Form.Item name="startDate" label="Start" rules={[{ required: true }]}><Input type="date" /></Form.Item></Col>
            <Col xs={24} sm={12}><Form.Item name="endDate" label="End" rules={[{ required: true }]}><Input type="date" /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}><Form.Item name="budget" label="Budget"><InputNumber min={0} prefix="$" style={{ width: '100%' }} /></Form.Item></Col>
            <Col xs={24} sm={12}><Form.Item name="involvedUsers" label="Who's coming?"><Select mode="multiple" placeholder="Pick users">{mockUsers.map(u => <Option key={u.id} value={u.id}>{u.name}</Option>)}</Select></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}><Form.Item name="startLocation" label="Start Location" rules={[{ required: true, message: 'Pick or type a location' }]}><Input placeholder="2800 E Observatory Rd, Los Angeles, CA 90027" /></Form.Item></Col>
            <Col xs={24} sm={12}><Form.Item name="endLocation" label="End Location" rules={[{ required: true, message: 'Pick or type a location' }]}><Input placeholder="123 Market St, San Francisco, CA 94105" /></Form.Item></Col>
          </Row>

          <Form.Item label="Stops (events)"><StopEditor /></Form.Item>

          <Space>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>{modalMode === 'add' ? 'Create' : 'Save'}</Button>
            <Button onClick={() => setModalVisible(false)}>Cancel</Button>
          </Space>
        </Form>
      </Modal>

      {/* ---- View Modal (3 tabs) ---- */}
      {viewModal && (
        <Modal
          open
          onCancel={() => setViewModal(null)}
          footer={null}
          width={800}
          centered
          title={viewModal.event.name}
        >
          <EventCard event={viewModal.stop} showActions={false} />
        </Modal>
      )}
    </div>
  );
};

export default Trips;