
import { View } from 'react-native';
import React, { useRef, useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Card from 'react-bootstrap/Card';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Select } from 'antd';
import { useTranslation } from "react-i18next";
import { renderDescription } from './utils/render_message';
import i18next from "./i18n";

export default function App() { 
  const { t, i18n } = useTranslation();
  const [key, setKey] = useState('home');

  
  const selectTab = (key) => {
    setKey(key);
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
                  <Row>
                    <Col>
                      <Card.Img variant="top" src="assets/famquest-logo.png" />
                    </Col>
                    <Col>
                      <Card.Body>
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
                    </Card.Body>
                    </Col>
                  </Row>
                </Card>
            </Container>
          </Tab>
          <Tab eventKey="participate" title={t('participate')}>
            <Container fluid>
                <Card>
                  <Card.Title>{t('downloadTitle')}</Card.Title>
                  <Card.Body>
                    <Card.Text>
                      {renderDescription(t('downloadBody'))}
                    </Card.Text>
                  </Card.Body>
                </Card>
            </Container>
          </Tab>
          <Tab eventKey="instances" title={t('instances')}>
            <Container fluid>
                <Card>
                  <Card.Title>{t('instances')}</Card.Title>
                  <Card.Body>
                    <Card.Text>
                      <ul>
                        <li><a href="https://portal.jaime.famquest.dynv6.net" target="_blank" rel="Gomez Chavez family">Jaime</a></li>
                      </ul>
                    </Card.Text>
                  </Card.Body>
                </Card>
            </Container>
          </Tab>
        </Tabs>
    </> 
  );
}
