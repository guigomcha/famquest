import React, { useState } from 'react';
import '../css/UserInfo.css'; // Import your CSS for styling
import React, { useState, useRef, useEffect } from 'react';
import '../css/UserInfo.css'; 
import * as L from 'leaflet';
import { message, Space } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { FloatButton } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { Button } from 'antd';

const UserInfo = ({ user, spots, tasks }) => {
  const [isTasksExpanded, setIsTasksExpanded] = useState(false);
  const userLocationsLayer = useRef(null);
  const [messageApi, contextHolder] = message.useMessage();

  const toggleTasks = () => {
    setIsTasksExpanded(!isTasksExpanded);
  };

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

  const renderProgressBar = ({ title, visible, total }) => {
    const progress = (visible / total) * 100 || 0; // Calculate progress
    return (
      <div className="progress-bar" key={title}>
        <label>{title}: {visible}/{total}</label>
        <div className="progress">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
    );
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
      <FloatButton.Group
        trigger="click"
        type="primary"
        style={{
          insetInlineEnd: 24,
        }}
        icon={<UserOutlined />}
      >
        <div className="user-info">
          <h3>User Profile</h3>
          <Button trigger="click"
            type="default"
            icon={<ReloadOutlined />}
            onClick={handleReload}
          >Reload</Button>
          <p>Welcome, {user?.preferredUsername}!</p>
          <p>Email: {user?.email}</p>
          <h3>User Progress</h3>
          {renderProgressBar(spots)}
          <div className="progress-bar">
            <label onClick={toggleTasks} className="collapsible-label">
              Tasks: {tasks.visible}/{tasks.total} {isTasksExpanded ? '▼' : '▲'}
            </label>
            <div className="progress">
              <div className="progress-fill" style={{ width: `${(tasks.visible / tasks.total) * 100 || 0}%` }}></div>
            </div>
            {isTasksExpanded && (
              <div className="subtask-container">
                {renderProgressBar({ title: 'Movies', visible: tasks.subtasks.movies.visible, total: tasks.subtasks.movies.total })}
                {renderProgressBar({ title: 'Adulting', visible: tasks.subtasks.adulting.visible, total: tasks.subtasks.adulting.total })}
                {renderProgressBar({ title: 'Technology', visible: tasks.subtasks.technology.visible, total: tasks.subtasks.technology.total })}
              </div>
            )}
          </div>
          <div className="progress-bar">
            <label>Te falta calle</label>
            <div className="progress">
              <div className="progress-fill" style={{ width: '0%' }}></div>
            </div>
          </div>
  
        </div>
      </FloatButton.Group>
    </>
  );
};

export default UserInfo;
