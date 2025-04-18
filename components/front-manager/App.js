
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
import { renderDescription } from './functions/render_message';
import { updateDiscoveredConditionsForUser } from './functions/db_manager_api';
import { useTranslation } from "react-i18next";
import i18next from "./i18n";
import { GlobalMessage } from './functions/components_helper';


const isLocal = true;

export default function App() { 
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState(null);
  const [key, setKey] = useState('home');
  const mapRef = useRef(null);


  const handleUserChange = async (userInfo) => {
    setUser(userInfo);
    console.info("updating app.js to ", userInfo);
    if (userInfo?.role == "target"){
      const resp = await updateDiscoveredConditionsForUser(userInfo);
      console.info("requested discover update: ", resp);
      if (resp.length >0) {
        GlobalMessage(resp.length + "x" +t('discoveredUpdate'), "info");
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
      } else {
        GlobalMessage(t('privateArea'), "warning");
      }
    } else {
      setKey(key);
    }
  };
  const changeLanguage = (value) => {
    i18n.changeLanguage(value);
  };
  
  useEffect(() => {
  }, [user]);
  
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
        <Tabs
          id="controlled-tab-example"
          activeKey={key}
          onSelect={(k) => selectTab(k)}
          className="mb-3"
        >
          <Tab eventKey="home" title={t('home')}>
            <Container fluid>
                <Card>
                  <Card.Title>{t('welcomeTitle')}</Card.Title>
                  <Card.Body>
                    <Card.Text>
                      {renderDescription(t('footerText'))} <a href="https://github.com/guigomcha/famquest" className="fa fa-github" />
                    </Card.Text>
                    <Card.Img variant="top" src="assets/famquest-logo.png" />
                </Card.Body>
                </Card>
            </Container>
          </Tab>
          <Tab eventKey="map" title={t('map')}>
            <Container fluid>
              <View >
                <MapManager handleMapRef={transferHandleMapRef} user={user}/>
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
