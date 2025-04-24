import { View } from 'react-native';
import React, { useRef, useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/App.css';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Card from 'react-bootstrap/Card';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Accordion from 'react-bootstrap/Accordion';
import { Select } from 'antd';
import { useTranslation } from "react-i18next";
import { renderDescription } from './utils/render_message';
import i18next from "./i18n";
import { Button } from 'antd';
import { ArrowDownOutlined } from '@ant-design/icons';

export default function App() { 
  const { t, i18n } = useTranslation();
  const [key, setKey] = useState('home');
  const [isImageAboveText, setIsImageAboveText] = useState(false); // Track layout change
  const textRef = useRef(null); // Reference to scroll to the text

  const selectTab = (key) => {
    setKey(key);
  };

  const changeLanguage = (value) => {
    i18n.changeLanguage(value);
  };

  const handleArrowClick = () => {
    if (textRef.current) {
      textRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    const checkLayout = () => {
      const isSmallScreen = window.innerWidth < 768; // Adjust based on your needs
      setIsImageAboveText(isSmallScreen);
    };
    window.addEventListener('resize', checkLayout);
    checkLayout(); // Run once on mount
    return () => window.removeEventListener('resize', checkLayout);
  }, []);

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
              <Row className={`card-row ${isImageAboveText ? 'stacked' : ''}`}>
                <Col md={isImageAboveText ? 12 : 6}>
                  <Card.Img variant="top" src="assets/famquest-logo.png" />
                  {isImageAboveText && (
                    <Card.ImgOverlay bsPrefix="card-row">
                      <Button trigger="click"
                        type="default"
                        icon={<ArrowDownOutlined />}
                        onClick={handleArrowClick}
                        >{t('callToAction')}</Button>
                    </Card.ImgOverlay>
                  )}
                </Col>
                <Col md={isImageAboveText ? 12 : 6}>
                  <Card.Body ref={textRef}>
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
                  <Row>
                    <Card.Body>
                      <Card.Text>
                        {renderDescription(t('downloadHead'))}
                      </Card.Text>
                    </Card.Body>
                  </Row>
                  <Row className={`card-row ${isImageAboveText ? 'stacked' : ''}`}>
                    <Accordion defaultActiveKey="0">
                      <Accordion.Item eventKey="0" md={isImageAboveText ? 12 : 6}>
                        <Accordion.Header>{t('downloadFreeHead')}</Accordion.Header>
                        <Accordion.Body>
                          <Col >
                            <Card.Text>
                              {renderDescription(t('downloadFreeBody'))}
                            </Card.Text>
                            <Card.Img variant="top" src="assets/opensource-version.png" />
                          </Col>
                        </Accordion.Body>
                      </Accordion.Item>
                      <Accordion.Item eventKey="1" md={isImageAboveText ? 12 : 6}>
                        <Accordion.Header>{t('downloadPublicHead')}</Accordion.Header>
                        <Accordion.Body>
                          <Col>
                            <Card.Text>
                                {renderDescription(t('downloadPublicBody'))}
                              </Card.Text>
                            <Card.Img variant="top" src="assets/public-version.png" />
                          </Col>
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>
                  </Row>
                </Card>
            </Container>
          </Tab>
      </Tabs>
    </> 
  );
}
