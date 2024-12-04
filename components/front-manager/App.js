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
          <Navbar.Brand href="#home">FamQuest App</Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
          {(user || isLocal ) ?
            (
              <Navbar.Text>
                Signed in as: {user?.preferredName}
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
            <Card style={{ width: '18rem' }}>
              <Card.Img variant="top" src="assets/marker-icon.png" />
              <Card.Body>
                <Card.Title>This is an intro to the FamQuest App</Card.Title>
                <Card.Text>
                  Something 
                </Card.Text>
              </Card.Body>
            </Card>
          </Row>
        </Container>
        )
      }
    </> 
  );
}
