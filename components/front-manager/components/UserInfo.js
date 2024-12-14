import React, { useState, useRef, useEffect } from 'react';
import * as L from 'leaflet';
import { message } from 'antd';
import Card from 'react-bootstrap/Card';
import { ReloadOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { Flex, Progress } from 'antd';

const UserInfo = ({ user, spots, tasks, mapRef }) => {
  const userLocationsLayer = useRef(null);
  const [messageApi, contextHolder] = message.useMessage();

  const handleReload = (event) => {
    event.preventDefault();
    event.stopPropagation();
    window.location.reload();
  };
  
  const warning = () => {
    messageApi.open({
      type: 'warning',
      content: 'Live location error',
    });
  };

  const progressBarPercentage = ({ visible, total }) => {
    return (visible / total) * 100 || 0; // Calculate progress
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
          .on('locationfound', function(e){
            // Chekc if the position was already loaded
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
          })
         .on('locationerror', function(e){
            warning();
            console.info("live location error", e);
          });
  }, [mapRef.current]);
  

  return (
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
        <Card.Title>User Profile</Card.Title>
        <Card.Body>
          <Card.Text>Welcome, {user?.preferredUsername}!</Card.Text>
          <Card.Text>Email: {user?.email}</Card.Text>
          <Flex
            vertical
            gap="small"
            style={{
              width: 180,
            }}
          >
            <Progress percent={progressBarPercentage(tasks.visible, tasks.total)} size="small" status="active" />
            <Progress percent={40} size="small" status="active" />
            <Progress percent={100} size="small" status="active" />
          </Flex>
        </Card.Body>
        <Card.Footer>
          <Button trigger="click"
            type="default"
            icon={<ReloadOutlined />}
            onClick={handleReload}
          >Reload</Button>
        </Card.Footer>
      </Card>
    </>
  );
};

export default UserInfo;
