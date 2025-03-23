import React, { useState, useRef, useEffect } from 'react';
import * as L from 'leaflet';
import { message, Button, FloatButton } from 'antd';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import { UserOutlined, ReloadOutlined, AimOutlined, FrownOutlined } from '@ant-design/icons';
import { createInDB, updateDiscoveredConditionsForUser } from '../backend_interface/db_manager_api';
import { GlobalMessage } from '../backend_interface/components_helper';
import { collectLogs } from '../backend_interface/utils';
import { useTranslation } from "react-i18next";

const UserButton = ({ user,  mapRef }) => {
  const { t, i18n } = useTranslation();
  const userLocationsLayer = useRef(null);

  const handleReport = () => {
    collectLogs();
    GlobalMessage(t('sendEmail'), "info", 30);
  };

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
      GlobalMessage(t('noPreviousLocation'), "warning");
    }
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
              return;
            }
            console.info("New live location found ", e, userLocationsLayer.current.getLayers());
            var marker = L.marker([e.latitude, e.longitude], {
              icon: L.icon({
                iconUrl: 'assets/marker-icon.png',
                iconSize: [24, 36],
                iconAnchor: [12, 36],
              }),
            }).bindPopup(t('liveLocationInfo')+' '+ Date()); 
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
              return;
            }
            console.info("sent location", locationDb)
            if (user?.role == "target"){
              const resp = await updateDiscoveredConditionsForUser(user);
              console.info("requested discover update: ", resp);
              if (resp.length >0) {
                GlobalMessage(resp.length + "x" +t('discoveredUpdate'), "info");
              }
            }
          })
         .on('locationerror', function(e){
            GlobalMessage(t('liveLocationError'), "error");
            console.info("live location error", e);
          });
  }, [mapRef.current]);
  
  return (
      <FloatButton.Group
        trigger="click"
        type="primary"
        icon={<UserOutlined />}
        tooltip={<div>{t('userInfo')}</div>}
      >
      <>
        <Card style={{
          position: "fixed",
          bottom: "80px",
          right: "70px",
          border: "1px solid #ddd",
          padding: "15px",
          width: "250px",
        }}>
          <Card.Title>{t('userInfo')}</Card.Title>
          <Card.Body>
            <Card.Text>{t('welcome')}: {user?.name}!</Card.Text>
            <Card.Text>{t('email')}: {user?.email}</Card.Text>
          </Card.Body>
          <Card.Footer>
            <Row>
              <Button trigger="click"
                type="default"
                icon={<ReloadOutlined />}
                onClick={handleReload}
              >{t('reload')}</Button>
              <Button trigger="click"
                type="default"
                icon={<AimOutlined />}
                onClick={handleLocate}
              >{t('location')}</Button>
            </Row>
            <Row>
            <Button trigger="click"
              type="default"
              icon={<FrownOutlined />}
              onClick={handleReport}
            >{t('report')}</Button>
            </Row>
          </Card.Footer>
        </Card>
      </> 
      </FloatButton.Group>
  );
};

export default UserButton;
