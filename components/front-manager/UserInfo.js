import React from 'react';
import './css/UserInfo.css'; // Import your CSS for styling

const UserInfo = ({ totalSpots, visibleSpots, totalTasks, visibleTasks }) => {
  const spotsProgress = (visibleSpots / totalSpots) * 100 || 0; // Calculate progress for spots
  const tasksProgress = (visibleTasks / totalTasks) * 100 || 0; // Calculate progress for tasks

  return (
    <div className="user-profile">
      <h3>User Profile</h3>
      <div className="progress-bar">
        <label>Spots: {visibleSpots}/{totalSpots}</label>
        <div className="progress">
          <div className="progress-fill" style={{ width: `${spotsProgress}%` }}></div>
        </div>
      </div>
      <div className="progress-bar">
        <label>Tasks: {visibleTasks}/{totalTasks}</label>
        <div className="progress">
          <div className="progress-fill" style={{ width: `${tasksProgress}%` }}></div>
        </div>
      </div>
      <div className="progress-bar">
        <label>Te falta calle</label>
        <div className="progress">
          <div className="progress-fill" style={{ width: '0%' }}></div>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
