import { View } from 'react-native';
import { QueryClient, QueryClientProvider, useQuery } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools';
import React, { useState } from "react";
import 'leaflet/dist/leaflet.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';

import MapManager from './components/MapManager';
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
const isLocal = false;

export default function App() { 
  const [user, setUser] = useState(null);
  const handleUserChange = (userInfo) => {
    setUser(userInfo); // Update parent state with user info
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
      {(user || isLocal ) ?
        (
          <Container fluid>
            <UserInfo user={user} spots={spots} tasks={tasks} />
            <QueryClientProvider client={queryClient}>
            <View >
              <MapManager/>
            </View>
            <ReactQueryDevtools initialIsOpen={true} />
            </QueryClientProvider>
          </Container>
        ): 
        (
        <Container >
          <Row>
            <Card fluid>
              <Card.Img variant="top" src="assets/famquest-logo.png" />
              <Card.Body>
                <Card.Title>Welcome to the FamQuest App</Card.Title>
                <Card.Text>
                "FamQuest" is born as the 1-year birthday present for my first nephew. 
                A map guiding users on an adventure to uncover family memories and carry out a gamified quest to resolve adulting tasks.
                <br></br>
                In short, it is a location-based media-storage service with a few differences from other apps and keeping it very clear that <b>this is not another social network</b>. 
                Instead, it aims to be more similar to a very private gamified family photo album and journal shared between family members:
                <ul>
                  <li>Your family members pre-populate your world with memories and tasks.</li>
                  <li>You have to physically be in a place to post something (or proof it via google-maps). The map of the world is not fully visible, you have to discover it "fog-of-war-style" (age-of-empire).</li>
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
        )
      }
    </> 
  );
}
