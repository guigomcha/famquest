import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Modal, Avatar, List, Card, Tag, Button, Spin, Input, Space, Typography, message } from 'antd';
import { CompassOutlined, SearchOutlined, EnvironmentOutlined } from '@ant-design/icons';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { mockLocations, mockEvents, mockUsers, mockMedia } from '../utils/mockData';
import { getCategoryColor, getCategoryIcon } from '../utils/helpers';
import { useTranslation } from 'react-i18next';
import EventCard from '../components/EventCard';
import CommentSystem from '../components/CommentSystem';

const { Title, Text } = Typography;
const { Search } = Input;

// TODO: when zoom out makes the markers overlap, better to show a group with a number

/* ----------  fix default leaflet icons  ---------- */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

/* ----------  styles  ---------- */
const purple = '#8b5cf6';
const mapCss = `
  .leaflet-container     { height:100vh; width:100vw; }
  .user-avatar-icon      { border:3px solid ${purple}; border-radius:50%; animation:blink 1.5s infinite; }
  @keyframes blink       { 50%{box-shadow:0 0 12px 6px ${purple}90;} }
`;
const style = document.createElement('style');
style.innerHTML = mapCss;
document.head.appendChild(style);

/* ----------  small comps  ---------- */
const MapViewController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => { map.setView(center, zoom); }, [center, zoom, map]);
  return null;
};

const UserMarker = ({ pos }) => {
  if (!pos) return null;
  const icon = L.divIcon({
    className: 'user-avatar-icon',
    html: `<img src="resources/images/user1.png" width="36" height="36" style="border-radius:50%"/>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
  return <Marker position={pos} icon={icon} />;
};

/* ----------  main component  ---------- */
const FeedMap = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [userPos, setUserPos] = useState(null);
  const [mapCenter, setMapCenter] = useState([37.7749, -122.4194]);
  const [mapZoom, setMapZoom] = useState(10);

  /* modal state */
  const [modalEvent, setModalEvent] = useState(null);

  /* popup state – we store only the events for the open location */
  const [popupEvents, setPopupEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);

  const openComments = (event) => {
    setCurrentEvent(event);
    setCommentModalVisible(true);
  };

  /* ----------  filter locations  ---------- */
  const filteredLocs = useMemo(() => {
    const s = search.toLowerCase();
    return mockLocations.filter(loc => {
      /* keep location if ANY of its events matches search */
      const evs = mockEvents.filter(e => e.location === loc.id);
      if (!s) return true;
      return evs.some(e =>
        e.title.toLowerCase().includes(s) ||
        e.description.toLowerCase().includes(s) ||
        (e.tags || []).some(t => t.toLowerCase().includes(s))
      );
    });
  }, [search]);

  /* ----------  geo-location  ---------- */
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      p => {
        const pos = [p.coords.latitude, p.coords.longitude];
        setUserPos(pos);
        setMapCenter(pos);
        setMapZoom(13);
      },
      () => message.error('Location not available')
    );
  }, []);

  /* ----------  fetch events for a location (lazy)  ---------- */
  const loadEventsForLoc = useCallback(async (locId) => {
    setLoadingEvents(true);
    await new Promise(r => setTimeout(r, 300)); // fake network
    const evs = mockEvents
      .filter(e => e.location === locId)
      .map(e => ({
        ...e,
        ownerUser: mockUsers.find(u => u.id === e.owner) || null,
        coverMedia: e.media?.length ? mockMedia.find(m => m.id === e.media[0]) || null : null,
      }));
    setPopupEvents(evs);
    setLoadingEvents(false);
  }, []);

  /* ----------  icons  ---------- */
  const locIcon = L.divIcon({
    className: 'location-marker',
    html: `<div style="background:${purple};width:32px;height:32px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 6px #0003;"></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  /* ----------  render  ---------- */
  return (
    <>
      <div style={{ 
        position: 'relative',
        maxWidth: 'calc(100vw - 48px)', 
        maxHeight: 'calc(100vh - 48px)',
        overflow: 'hidden',
        boxShadow: '0 8px 24px #00000026'
      }}>
        {/* search bar */}
        <Card
          size="small"
          style={{
            position: 'absolute',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            width: 340,
          }}
        >
          <Space>
            <Search
              allowClear
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('common.search')}
              style={{ width: 260 }}
            />
            <Button icon={<CompassOutlined />} onClick={() => userPos && setMapCenter(userPos)} />
          </Space>
        </Card>

        {/* map */}
        <MapContainer center={mapCenter} zoom={mapZoom} scrollWheelZoom>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapViewController center={mapCenter} zoom={mapZoom} />
          <UserMarker pos={userPos} />

          {filteredLocs.map(loc => (
            <Marker
              key={loc.id}
              position={[loc.lat, loc.lng]}
              icon={locIcon}
              eventHandlers={{
                click: () => loadEventsForLoc(loc.id),
              }}
            >
              {/* Show the number of events in the location  */}
              <Popup maxWidth={280}>
                <Title level={5} style={{ margin: 0, marginBottom: 8 }}>
                  {loc.address}
                </Title>
                {loadingEvents && <Spin size="small" />}
                {!loadingEvents && (
                  <List
                    size="small"
                    dataSource={popupEvents}
                    renderItem={e => (
                      <List.Item
                        style={{ padding: '6px 0', cursor: 'pointer' }}
                        onClick={() => setModalEvent(e)}
                      >
                        <List.Item.Meta
                          avatar={
                            e.coverMedia ? (
                              <Avatar shape="square" size={48} src={e.coverMedia.url} />
                            ) : (
                              <Avatar shape="square" size={48} icon={<EnvironmentOutlined />} />
                            )
                          }
                          title={
                            <Space>
                              <Tag color={getCategoryColor(e.tags?.[0])}>{getCategoryIcon(e.tags?.[0])}</Tag>
                              <Text strong>{e.title}</Text>
                            </Space>
                          }
                          description={`${new Date(e.startTime).toLocaleDateString()} · ${e.ownerUser?.name || ''}`}
                        />
                      </List.Item>
                    )}
                  />
                )}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* ----------  event detail modal  ---------- */}
      {modalEvent && (
        <Modal
          open
          onCancel={() => setModalEvent(null)}
          footer={null}
          width={720}
          centered
          styles={{ padding: 0 }}
        >
          <EventCard
            event={modalEvent}
            showActions={true}
            onComment={() => openComments(modalEvent)}
            onEdit={() => message.info('Edit coming soon')}
            onDelete={() => message.info('Delete coming soon')}
          />
        </Modal>
      )}

      {/* Comment Modal */}
      <CommentSystem
        visible={commentModalVisible}
        onClose={() => setCommentModalVisible(false)}
        event={currentEvent}
        onCommentAdded={(comment) => {
          // Handle new comment
          // TODO G: render outside or won't work
          message.success(t('comment.commentAdded'));
        }}
      />
    </>
  );
};

export default FeedMap;