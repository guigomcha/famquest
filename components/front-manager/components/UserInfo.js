import React, { useState } from 'react';
import '../css/UserInfo.css'; // Import your CSS for styling
import { UserOutlined } from '@ant-design/icons';
import { FloatButton } from 'antd';
const UserInfo = ({ user, spots, tasks }) => {
  const [isTasksExpanded, setIsTasksExpanded] = useState(false);

  const toggleTasks = () => {
    setIsTasksExpanded(!isTasksExpanded);
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
