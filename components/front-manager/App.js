import React, { useRef, useState, useEffect } from "react";
import { Layout, Tabs, Select, Row, Col, Typography, Button, Spin, Flex } from 'antd';
import { ArrowDownOutlined } from '@ant-design/icons';
import MapManager from './components/MapManager';
import UserButton from './components/UserButton';
import FamilyTabs from './components/FamilyTabs';
import OAuth2 from './components/Oauth2';
import { renderDescription } from './functions/render_message';
import { updateDiscoveredConditionsForUser } from './functions/db_manager_api';
import { useTranslation } from "react-i18next";
import i18next from "./i18n";
import { GlobalMessage } from './functions/components_helper';
import './css/App.css';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const HEADER_HEIGHT = 60;
const TABS_HEIGHT = 40;

const isLocal = false;

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState({});
  const [key, setKey] = useState('home');
  const mapRef = useRef(null);
  const [isImageAboveText, setIsImageAboveText] = useState(false);
  const textRef = useRef(null);

  const handleArrowClick = () => {
    if (textRef.current) {
      textRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleUserChange = async (userInfo) => {
    setUser(userInfo);
    const resp = await updateDiscoveredConditionsForUser(userInfo);
    if (resp.length > 0) {
      GlobalMessage(`${resp.length}x ${t('discoveredUpdate')}`, "info");
    }
  };

  const transferHandleMapRef = (map) => {
    mapRef.current = map.current;
  };

  const selectTab = (key) => {
    if ((key === "map" || key === "user") && !user && !isLocal) {
      GlobalMessage(t('privateArea'), "warning");
      return;
    }
    setKey(key);
  };

  const changeLanguage = (value) => {
    i18n.changeLanguage(value);
  };

  useEffect(() => {
    const checkLayout = () => {
      setIsImageAboveText(window.innerWidth < 768);
    };
    window.addEventListener('resize', checkLayout);
    checkLayout();
    return () => window.removeEventListener('resize', checkLayout);
  }, []);

  return (
    <Layout style={{ height: '100vh' }}>
      <Header style={{ height: HEADER_HEIGHT, padding: '0 16px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Title level={5} style={{ margin: 0 }}>FamQuest</Title>
        <Flex gap="small" align="center">
          <Select
            defaultValue={i18n.language}
            style={{ width: 80 }}
            onChange={changeLanguage}
            options={[
              { value: 'en', label: 'EN' },
              { value: 'es', label: 'ESP' }
            ]}
          />
          <OAuth2 onUserChange={handleUserChange} setIsLoading={setIsLoading} />
          {(user || isLocal) && <Text>{t('signedAs')}: {user?.name}</Text>}
        </Flex>
      </Header>
      <Content style={{ height: `calc(100vh - ${HEADER_HEIGHT}px)` }}>
        {isLoading ? (
          <Spin tip={t('loading')} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }} />
        ) : (
          <Tabs
            activeKey={key}
            onChange={selectTab}
            style={{ height: '100%' }}
            animated={false}
            items={[
              {
                key: 'home',
                label: t('home'),
                children: (
                  <div style={{ height: `calc(100vh - ${HEADER_HEIGHT + TABS_HEIGHT}px)`, overflow: 'auto', padding: 16 }}>
                    <Row gutter={[16, 16]} align="middle" justify="center">
                      <Col xs={24} md={12} style={{ textAlign: 'center' }}>
                        <img src="assets/famquest-logo.png" alt="FamQuest" style={{ maxWidth: '100%' }} />
                        {isImageAboveText && (
                          <Button icon={<ArrowDownOutlined />} onClick={handleArrowClick} style={{ marginTop: 8 }}>{t('callToAction')}</Button>
                        )}
                      </Col>
                      <Col xs={24} md={12}>
                        <div ref={textRef}>
                          <Text>{renderDescription(t('frontDescription'))}</Text>
                          <Title level={5}>{t('coreObjectivesTitle')}</Title>
                          <ul>
                            <li>{renderDescription(t('coreObjective1'))}</li>
                            <li>{renderDescription(t('coreObjective2'))}</li>
                            <li>{renderDescription(t('coreObjective3'))}</li>
                            <li>{renderDescription(t('coreObjective4'))}</li>
                            <li>{renderDescription(t('coreObjective5'))}</li>
                            <li>{renderDescription(t('coreObjective6'))}</li>
                          </ul>
                        </div>
                      </Col>
                    </Row>
                  </div>
                )
              },
              {
                key: 'map',
                label: t('map'),
                children: user?.id ? (
                  <div style={{ height: `calc(100vh - ${HEADER_HEIGHT + TABS_HEIGHT}px)`, position: 'relative' }}>
                    <MapManager handleMapRef={transferHandleMapRef} user={user} />
                    <UserButton user={user} mapRef={mapRef} />
                  </div>
                ) : null
              },
              {
                key: 'user',
                label: t('family'),
                children: user?.id ? (
                  <div style={{ padding: 16, height: `calc(100vh - ${HEADER_HEIGHT + TABS_HEIGHT}px)`, overflow: 'auto' }}>
                    <FamilyTabs user={user} />
                  </div>
                ) : null
              }
            ]}
          />
        )}
      </Content>
    </Layout>
  );
}
