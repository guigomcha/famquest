import React, { useState, useRef, useEffect } from 'react';
import { UserOutlined } from '@ant-design/icons';
import { FloatButton } from 'antd';
import UserInfo from './UserInfo';

const UserButton = ({ user, spots, tasks, mapRef }) => {

  return (
      <FloatButton.Group
        trigger="click"
        type="primary"
        icon={<UserOutlined />}
        tooltip={<div>User Info</div>}
      >
       <UserInfo user={user} spots={spots} tasks={tasks} mapRef={mapRef} /> 
      </FloatButton.Group>
  );
};

export default UserButton;
