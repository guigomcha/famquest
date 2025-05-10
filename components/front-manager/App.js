import React, { useRef, useState, useEffect } from "react";
import 'leaflet/dist/leaflet.css';
import {
  Layout,
  Card,
  Row,
  Col,
  Select,
  Button,
  Spin,
  Typography,
  Tooltip,
} from 'antd';
import {
  HomeOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';

import MapManager from './components/MapManager';
import UserButton from './components/UserButton';
import FamilyTabs from './components/FamilyTabs';
import OAuth2 from './components/Oauth2';
import { renderDescription } from './functions/render_message';
import { updateDiscoveredConditionsForUser } from './functions/db_manager_api';
import { useTranslation } from "react-i18next";
import i18next from "./i18n";
import { GlobalMessage } from './functions/components_helper';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState({});
  const [activeTab, setActiveTab] = useState('home');
  const mapRef = useRef(null);
  const textRef = useRef(null);
  const [isImageAboveText, setIsImageAboveText] = useState(false);

  const handleArrowClick = () => {
    if (textRef.current) {
      textRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleUserChange = async (userInfo) => {
    setUser(userInfo);
    if (userInfo?.role === "target") {
      const resp = await updateDiscoveredConditionsForUser(userInfo);
      if (resp.length > 0) {
        GlobalMessage(`${resp.length}x ${t('discoveredUpdate')}`, "info");
      }
    }
  };

  const transferHandleMapRef = (map) => {
    mapRef.current = map.current;
  };

  const changeLanguage = (value) => {
    i18n.changeLanguage(value);
  };

  useEffect(() => {
    const checkLayout = () => {
      const isSmallScreen = window.innerWidth < 768;
      setIsImageAboveText(isSmallScreen);
    };
    window.addEventListener('resize', checkLayout);
    checkLayout();
    return () => window.removeEventListener('resize', checkLayout);
  }, []);

  const renderContent = () => {
    if (activeTab === 'home') {
      return (
        <div style={
          { 
            padding: '0 0.5rem',
            position: 'relative',
            width: '100%',
            height: '100%',
            overflow: 'auto',
          }
        }>
          <Card variant={"outlined"}  bodyPadding={0}>
            <Title level={4} style={{ padding: '0.5rem 0' }}>{t('welcomeTitle')}</Title>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <img alt="logo" src="assets/famquest-logo.png" style={{ width: '100%', height: 'auto' }} />
              </Col>
              <Col xs={24} md={12} >
                <div ref={textRef}>
                  <p>{renderDescription(t('frontDescription'))}</p>
                  <Title level={5}>{t('coreObjectivesTitle')}</Title>
                  <ul>
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <li key={i}>{renderDescription(t(`coreObjective${i}`))}</li>
                    ))}
                  </ul>
                </div>
              </Col>
            </Row>
          </Card>
        </div>
      );
    } else if (activeTab === 'map') {
      return (user?.id &&
        <div style={
          { 
            position: 'relative',
            width: '100%',
            height: '100%',
            overflowY: 'hidden',
            overflowX: 'hidden',
          }
        }>
          <MapManager handleMapRef={transferHandleMapRef} user={user} />
          <UserButton user={user} mapRef={mapRef} />
        </div>
      );
    } else if (activeTab === 'user') {
      return (user?.id &&
        <div style={
          { 
            position: 'relative',
            width: '100%',
            height: '100%',
            overflowY: 'hidden',
            overflowX: 'hidden',
          }}
        >
          <FamilyTabs user={user} />
        </div>
      );
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ height: '10vh', background: 'rgba(240, 240, 240, 1)', padding: '0 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><strong>FamQuest</strong></div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Select
            defaultValue={i18n.language}
            style={{ width: 80 }}
            onChange={changeLanguage}
            options={[
              { value: 'en', label: 'EN' },
              { value: 'es', label: 'ESP' },
            ]}
          />
          <OAuth2 onUserChange={handleUserChange} setIsLoading={setIsLoading} />
        </div>
      </Header>

      <Content style={{
        height: '80vh',
        padding: '0.5rem 0',
      }}>
        {isLoading ? <Spin>{t('loading')}</Spin> : renderContent()}
      </Content>

      <Footer style={{ zIndex: 99999999, bottom: 0, height: '10vh', width: '100%', padding: '0.5rem 0', background: 'rgb(240, 240, 240)'}}>
        <Row justify="space-around">
          <Col>
            <Tooltip title="Home">
              <Button
                type="text"
                icon={<HomeOutlined style={{ fontSize: '6vh' }}/>}
                onClick={() => setActiveTab("home")}
                style={{ color: activeTab === 'home' ? 'rgb(24, 144, 255)' : 'rgb(100, 100, 100)', height: '100%' }}
              />
            </Tooltip>
          </Col>
          <Col>
            <Tooltip title="Map">    
              <Button
                type="text"
                icon={<EnvironmentOutlined style={{ fontSize: '6vh' }}/>}
                onClick={() => setActiveTab("map")}
                style={{ color: activeTab === 'map' ? 'rgb(24, 144, 255)' : 'rgb(100, 100, 100)', height: '100%', }}
              />
            </Tooltip>
          </Col>
          <Col>
            <Tooltip title="Family">    
              <Button
                type="text"
                icon={<TeamOutlined style={{ fontSize: '6vh' }}/>}
                onClick={() => setActiveTab("user")}
                style={{ color: activeTab === 'user' ? 'rgb(24, 144, 255)' : 'rgb(100, 100, 100)', height: '100%', }}
              />
            </Tooltip>
          </Col>
        </Row>
      </Footer>
    </Layout>
  );
}
