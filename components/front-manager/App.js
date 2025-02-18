
import { View } from 'react-native';
import React, { useRef, useState, useEffect } from "react";
import 'leaflet/dist/leaflet.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Card from 'react-bootstrap/Card';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Select } from 'antd';

import MapManager from './components/MapManager';
import UserButton from './components/UserButton';
import FamilyTab from './components/Family';
import OAuth2 from './components/Oauth2';
import { renderDescription } from './utils/render_message';
import { updateDiscoveredConditionsForUser } from './backend_interface/db_manager_api';
import { useTranslation } from "react-i18next";
import i18next from "./i18n";
import { message } from 'antd';

// const queryClient = new QueryClient()

const isLocal = true;

export default function App() { 
  const { t, i18n } = useTranslation();
  const [messageApi, contextHolder] = message.useMessage();
  const [user, setUser] = useState(null);
  const [key, setKey] = useState('home');
  const mapRef = useRef(null);

  const successMessage = (msg) => {
    messageApi.open({
      type: 'success',
      content: msg,
    });
  };

  const handleUserChange = async (userInfo) => {
    setUser(userInfo);
    console.info("updating app.js to ", userInfo);
    if (userInfo?.role == "target"){
      const resp = await updateDiscoveredConditionsForUser(userInfo);
      console.info("requested discover update: ", resp);
      if (resp.length >0) {
        successMessage(resp.length + "x" +t('discoveredUpdate'));
      }
    }
  };

  const transferHandleMapRef = (map) => {
    mapRef.current = map.current;
  };
  
  const selectTab = (key) => {
    if (key == "map" || key == "user") {
      if (user || isLocal) {
        setKey(key);
      }
    } else {
      setKey(key);
    }
  };
  const changeLanguage = (value) => {
    i18n.changeLanguage(value);
  };
  
  return (   
    <>
      <Navbar className="bg-body-tertiary">
        <Container>
          <Navbar.Brand>FamQuest App</Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
          <Row className="mb-3">
            <Col>
              <Select
                defaultValue={i18n.language}
                style={{ width: 80 }}
                onChange={changeLanguage}
                options={[
                  { value: 'en', label: 'EN' },
                  { value: 'es', label: 'ESP' },
                ]}
              />
            </Col>
            <Col>
              {(user || isLocal ) ?
                (
                  <Navbar.Text>
                    {t('signedAs')}: {user?.name}
                    <OAuth2 onUserChange={handleUserChange} />
                  </Navbar.Text>
                ):
                (
                  <Navbar.Text>
                    <OAuth2 onUserChange={handleUserChange} />
                  </Navbar.Text>
                )
              }
            </Col>
          </Row>
          </Navbar.Collapse>
        </Container>
      </Navbar>
        {contextHolder}
        <Tabs
          id="controlled-tab-example"
          activeKey={key}
          onSelect={(k) => selectTab(k)}
          className="mb-3"
        >
          <Tab eventKey="home" title={t('home')}>
            <Container fluid>
                <Card>
                  <Card.Img variant="top" src="assets/famquest-logo.png" />
                  <Card.Body>
                  <Card.Title>{t('welcomeTitle')}</Card.Title>
                  <Card.Text>
                    {renderDescription(t('introText'))}
                  </Card.Text>
                  <Card.Text>{t('coreObjectivesTitle')}</Card.Text>
                  <ul>
                    <li>{renderDescription(t('coreObjective1'))}</li>
                    <li>{renderDescription(t('coreObjective2'))}</li>
                    <li>{renderDescription(t('coreObjective3'))}</li>
                    <li>{renderDescription(t('coreObjective4'))}</li>
                    <li>{renderDescription(t('coreObjective5'))}</li>
                  </ul>
                  <Card.Footer>
                    {renderDescription(t('footerText'))}{' '}<a href="https://github.com/guigomcha/famquest" className="fa fa-github" />
                  </Card.Footer>
                </Card.Body>
                </Card>
            </Container>
          </Tab>
          <Tab eventKey="map" title={t('map')}>
            <Container fluid>
              <View >
                <MapManager handleMapRef={transferHandleMapRef}/>
              </View>
              <UserButton user={user} mapRef={mapRef}/>
            </Container>
          </Tab>
          <Tab eventKey="user" title={t('family')}>
            <Container fluid>
              <FamilyTab user={user}></FamilyTab>
            </Container>
          </Tab>
        </Tabs>
    </> 
  );
}
