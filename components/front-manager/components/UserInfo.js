import React, { useState, useRef, useEffect } from 'react';
import '../css/UserInfo.css'; 
import * as L from 'leaflet';
import { UserOutlined } from '@ant-design/icons';
import { FloatButton } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { Button } from 'antd';

const UserInfo = ({ user, spots, tasks, mapRef }) => {
  const [isTasksExpanded, setIsTasksExpanded] = useState(false);

  const toggleTasks = () => {
    setIsTasksExpanded(!isTasksExpanded);
  };

  const handleReload = (event) => {
    event.preventDefault();
    event.stopPropagation();
    window.location.reload();
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
    console.info("User mapRef: ", mapRef.current);
    // Get user location
    mapRef.current.locate({setView: false, watch: true})
          // Probably better to try to save the location if it does not exist something close and the get the markers
          .on('locationfound', function(e){
              var marker = L.marker([e.latitude, e.longitude], {
                icon: L.icon({
                  iconUrl: 'assets/marker-icon.png',
                  iconSize: [24, 36],
                  iconAnchor: [12, 36],
                }),
              }).bindPopup('Your are here :)'); 
              var circle = L.circle([e.latitude, e.longitude], Math.min(e.accuracy/2, 100), {
                  weight: 1,
                  color: 'blue',
                  fillColor: '#light-blue',
                  fillOpacity: 0.2
              });
              mapRef.current.addLayer(marker);
              mapRef.current.addLayer(circle);
          })
         .on('locationerror', function(e){
            // Replace with message
          });
  }, [mapRef.current]);
  

  return (
    <>
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
