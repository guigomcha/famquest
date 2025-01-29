import React, { useState, useRef, useEffect } from 'react';
import * as L from 'leaflet';
import { message, Button, FloatButton } from 'antd';
import Card from 'react-bootstrap/Card';
import { UserOutlined, ReloadOutlined, AimOutlined } from '@ant-design/icons';
import { createInDB } from '../backend_interface/db_manager_api';

const UserButton = ({ user,  mapRef }) => {
  const userLocationsLayer = useRef(null);
  const [messageApi, contextHolder] = message.useMessage();

  const handleReload = (event) => {
    event.preventDefault();
    event.stopPropagation();
    window.location.reload();
  };

  const handleLocate = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const locations = userLocationsLayer.current.getLayers();
    if (locations.length > 0) {
      console.info("traveling to last known location: ", locations[locations.length -1].getLatLng());
      mapRef.current.flyTo([locations[locations.length -1].getLatLng().lat, locations[locations.length -1].getLatLng().lng], 13);
    } else {
      console.info("No previous locations known: ", locations);
      warning('No previous locations known');
    }
  };
  
  const warning = (msg) => {
    messageApi.open({
      type: 'warning',
      content: msg,
    });
  };


  useEffect(() => {
    if (!mapRef.current) {
      return;
    } 
    if (!userLocationsLayer.current){
      userLocationsLayer.current = L.layerGroup().addTo(mapRef.current);
      // Create overlay controls
      const overlays = {
        "live locations": userLocationsLayer.current,
      };
      L.control.layers(null, overlays, { collapsed: false }).addTo(mapRef.current);
    }
    console.info("User mapRef: ", mapRef.current);
    
    // Get user location
    mapRef.current.locate({setView: false, watch: true})
          // Probably better to try to save the location if it does not exist something close and the get the markers
          .on('locationfound', async function(e){
            // Check if the position was already loaded
            const matches = userLocationsLayer.current.getLayers().filter(layer => layer.getLatLng().lat === e.latitude && layer.getLatLng().lng === e.longitude);
            if (matches.length > 0) {
              console.log("Current location exists:", matches);
              return;
            }
            console.info("Live location found ", e, userLocationsLayer.current.getLayers());
            var marker = L.marker([e.latitude, e.longitude], {
              icon: L.icon({
                iconUrl: 'assets/marker-icon.png',
                iconSize: [24, 36],
                iconAnchor: [12, 36],
              }),
            }).bindPopup('Your were here at '+ Date()); 
            var circle = L.circle([e.latitude, e.longitude], Math.min(e.accuracy/2, 100), {
                weight: 1,
                color: 'blue',
                fillColor: '#light-blue',
                fillOpacity: 0.2
            });
            userLocationsLayer.current.addLayer(marker);
            userLocationsLayer.current.addLayer(circle);
            // Add to DB
            var locationBody = {
              "name": "live location",
              "longitude": e.longitude,
              "latitude": e.latitude
            }
            // It is a new one
            const locationDb = await createInDB(locationBody, 'location');
            if (!locationDb){
              console.info("unable to push live location");
            }
            console.info("sent location", locationDb)
          })
         .on('locationerror', function(e){
            warning('Live location error');
            console.info("live location error", e);
          });
  }, [mapRef.current]);
  
  return (
      <FloatButton.Group
        trigger="click"
        type="primary"
        icon={<UserOutlined />}
        tooltip={<div>User Info</div>}
      >
      <>
        {contextHolder}
        <Card style={{
          position: "fixed",
          bottom: "40px",
          right: "70px",
          border: "1px solid #ddd",
          padding: "15px",
          width: "250px",
        }}>
          <Card.Title>User Info</Card.Title>
          <Card.Body>
            <Card.Text>Welcome, {user?.preferredUsername}!</Card.Text>
            <Card.Text>Email: {user?.email}</Card.Text>
          </Card.Body>
          <Card.Footer>
            <Button trigger="click"
              type="default"
              icon={<ReloadOutlined />}
              onClick={handleReload}
            >Reload</Button>
            <Button trigger="click"
              type="default"
              icon={<AimOutlined />}
              onClick={handleLocate}
            >Location</Button>
          </Card.Footer>
        </Card>
      </> 
      </FloatButton.Group>
  );
};

export default UserButton;
