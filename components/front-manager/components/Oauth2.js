import React, { useState, useEffect } from "react";
import Button from 'react-bootstrap/Button';
import { registerUser, getUserInfo } from '../backend_interface/db_manager_api';

const isLocal = true;

const OAuth2Login = ({ onUserChange }) => {
  const [user, setUser] = useState(null); // User information
  
  const transformToDBUser = async (data) => {
    console.info("fetching users to find", data);
    const tempUsers = await getUserInfo(0);
    console.info("obtained tempUsers ", tempUsers);
    const foundUser = tempUsers.find(item => item.extRef === data.user);
    console.info("connected as ", foundUser);
    setUser(foundUser);
    return foundUser;
  }

  useEffect(() => {
    // Fetch user info to check if logged in
    fetch("https://auth.REPLACE_TARGET_USER.famquest.REPLACE_BASE_DOMAIN/oauth2/userinfo", { credentials: "include" })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Not logged in");
      })
      .then(async (data) => {
        setUser(data);
        console.info(JSON.stringify(data));
        // Register the user in the backend if it does not exist
        const resp = await registerUser(data);
        console.info("Response from registerUser: ", resp)
        const userInfo = await transformToDBUser(data);
        onUserChange(userInfo); // Notify parent component
      })
      .catch(() => {
        setUser(null);
        console.info("did not find userinfo");
        onUserChange(null); // Notify parent component
      });
  }, []);

  const login = () => {
    const frontendUrl = window.location.origin; // Get current frontend URL
    const loginUrl = `https://auth.REPLACE_TARGET_USER.famquest.REPLACE_BASE_DOMAIN/oauth2/sign_in?rd=${encodeURIComponent(frontendUrl)}`;
    window.location.href = loginUrl;
  };


  const logout = () => {
    fetch("https://auth.REPLACE_TARGET_USER.famquest.REPLACE_BASE_DOMAIN/oauth2/sign_out", { method: "GET", credentials: "include" })
      .then(() => {
        setUser(null);
        onUserChange(null); // Notify parent component
        console.info("Logout ok");
      })
      .catch(() => {
        setUser(null);
        onUserChange(null); // Notify parent component
        console.info("Logout error");
      });
    window.location.reload();
  };
  
  return (
      <div >
        {(user || isLocal) ? (
          <Button variant="primary" onClick={logout}>Logout</Button>
        ) : (
          <Button variant="primary" onClick={login}>Login</Button>
        )}
      </div>
  );
};

export default OAuth2Login;
