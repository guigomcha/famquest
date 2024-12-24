import { View } from 'react-native';
import { QueryClient, QueryClientProvider, useQuery } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools';
import React, { useRef, useState } from "react";
import 'leaflet/dist/leaflet.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Row from 'react-bootstrap/Row';
import Card from 'react-bootstrap/Card';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';


import MapManager from './components/MapManager';
import UserButton from './components/UserButton';
import UserInfo from './components/UserInfo';
import OAuth2 from './components/Oauth2';

const queryClient = new QueryClient()

const spots = {
  title: 'Spots',
  visible: 7,
  total: 10,
};

const tasks = {
  title: 'Tasks',
  visible: 3,
  total: 5,
  subtasks: {
    movies: { visible: 1, total: 2 },
    adulting: { visible: 1, total: 1 },
    technology: { visible: 1, total: 2 },
  },
};
const isLocal = true;

export default function App() { 
  const [user, setUser] = useState(null);
  const [key, setKey] = useState('home');
  const mapRef = useRef(null);
  const handleUserChange = (userInfo) => {
    setUser(userInfo); // Transfer data from compoennt to component
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

  return (   
    <>
      <Navbar className="bg-body-tertiary">
        <Container>
          <Navbar.Brand>FamQuest App</Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
            {(user || isLocal ) ?
              (
                <Navbar.Text>
                  Signed in as: {user?.preferredUsername}
                  <OAuth2 onUserChange={handleUserChange} />
                </Navbar.Text>
              ):
              (
                <Navbar.Text>
                  <OAuth2 onUserChange={handleUserChange} />
                </Navbar.Text>
              )
            }
          </Navbar.Collapse>
        </Container>
      </Navbar>
        <Tabs
          id="controlled-tab-example"
          activeKey={key}
          onSelect={(k) => selectTab(k)}
          className="mb-3"
        >
          <Tab eventKey="home" title="Home">
            <Container >
              <Row>
                <Card fluid>
                  <Card.Img variant="top" src="assets/famquest-logo.png" />
                  <Card.Body>
                    <Card.Title>Welcome to the FamQuest App</Card.Title>
                    <Card.Text>
                    "FamQuest" is born as the 1-year-old birthday present for my first nephew. 
                    It is a map which guides users on an adventure to uncover family memories and carry out a gamified quest to resolve adulting tasks.
                    <br></br>
                    In short, it is a location-based media-storage service with a few differences from other apps and keeping it very clear that <b>this is not another social network</b>. 
                    Instead, it aims to be more similar to a very private gamified family photo album and journal shared between family members:
                    <ul>
                      <li>Your family members pre-populate your world with memories and tasks.</li>
                      <li>The target user has to physically be in a place to visualize something (or proof it via google-maps). The map of the world is not fully visible, you have to discover it "fog-of-war-style" (age-of-empire).</li>
                      <li>It is a way to share memories and pass them down in this new era of technology, lack of family time and globalization.</li>
                    </ul>
                    </Card.Text>
                    <Card.Text>
                    In the long term I want it to transition into a gamified-adulting app which provides the required knowledge to live in the modern world, focusing on those issues that
                    the traditional schools do not provide (unfortunately):
                    <ul>
                      <li>Goverment-related tasks.</li>
                      <li>Take benefit of your city offers and sourrounding.</li>
                      <li>Do not fall for the same issues that have already happened in the history.</li>
                      <li>Family-related nice-to-know and lessons learnt.</li>
                    </ul>
                    </Card.Text>
                  </Card.Body>
                  <Card.Footer>
                  This is a private instance of a publicly available service. Check <a href="https://github.com/guigomcha/famquest" class="fa fa-github"></a> and run your own instance.
                  </Card.Footer>
                </Card>
              </Row>
            </Container>
          </Tab>
          <Tab eventKey="map" title="Map">
            <Container fluid>
              <QueryClientProvider client={queryClient}>
              <View >
                <MapManager handleMapRef={transferHandleMapRef}/>
              </View>
              <UserButton user={user} spots={spots} tasks={tasks} mapRef={mapRef}/>
              <ReactQueryDevtools initialIsOpen={true} />
              </QueryClientProvider>
            </Container>
          </Tab>
          <Tab eventKey="user" title="User Info">
            <Container fluid>
              <UserInfo user={user} spots={spots} tasks={tasks} mapRef={mapRef}/>
            </Container>
          </Tab>
        </Tabs>
    </> 
  );
}
