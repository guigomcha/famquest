
import { View } from 'react-native';
import React, { useRef, useState, useEffect } from "react";
import 'leaflet/dist/leaflet.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Card from 'react-bootstrap/Card';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

import MapManager from './components/MapManager';
import UserButton from './components/UserButton';
import FamilyTab from './components/Family';
import OAuth2 from './components/Oauth2';

// const queryClient = new QueryClient()

const isLocal = true;

export default function App() { 
  const [user, setUser] = useState(null);
  const [key, setKey] = useState('home');
  const mapRef = useRef(null);

  const handleUserChange = (userInfo) => {
    setUser(userInfo);
    console.info("updating app.js to ", userInfo);
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
                  Signed in as: {user?.name}
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
            <Container fluid>
                <Card>
                  <Card.Img variant="top" src="assets/famquest-logo.png" />
                  <Card.Body>
                    <Card.Title>Welcome to the FamQuest App</Card.Title>
                    <Card.Text>
                    <b>"FamQuest"</b> is born as the 1-year bday present for my first nephew, Jaime, with the initial objective of telling my story in his city as he discovers it (I live in a different city now).
                    It has eventually grown out to host the story of the whole family around the world, <b>as a location-based media-storage application</b> that is similar to a very private family photo album
                    and journal shared between family members, keeping it very clear that <b>this is not another social network</b>. 
                    It is a way to share memories and pass them down in this new era of technology, lack of family time and globalization.
                    <br></br>
                    </Card.Text>
                    Some of the core objectives:
                    <ul>
                      <li>Your family members pre-populate your world with memories from their past. E.g., old family house, school, important trips, where the parents met...</li>
                      <li>The target user has to physically be in a spot to visualize something (or proof it via google-maps). The map of the world is not fully visible, you have to discover it "fog-of-war-style" (age-of-empire). E.g., A notification alerts the user of a new spot found.</li>
                      <li>Older generations have a way to quickly record an audio describing a spot or photo so that their voices are can be heard by future generations of the family.</li>
                      <li>Keep lists of things that would be nice to be shared in a later time. E.g., Important movies, tips and tricks...</li>
                      <li>Each family will be able to host their own instance of the application in an old laptop/miniPC without the need to sell of of their private memories to a big tech.</li>
                    </ul>
                  </Card.Body>
                  <Card.Footer>
                  This is a private instance of a publicly available service. Check <a href="https://github.com/guigomcha/famquest" className="fa fa-github"></a> and run your own instance.
                  </Card.Footer>
                </Card>
            </Container>
          </Tab>
          <Tab eventKey="map" title="Map">
            <Container fluid>
              <View >
                <MapManager handleMapRef={transferHandleMapRef}/>
              </View>
              <UserButton user={user} mapRef={mapRef}/>
            </Container>
          </Tab>
          <Tab eventKey="user" title="Family">
            <Container fluid>
              <FamilyTab user={user}></FamilyTab>
            </Container>
          </Tab>
        </Tabs>
    </> 
  );
}
