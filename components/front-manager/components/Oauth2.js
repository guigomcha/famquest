import React, { useState, useEffect } from "react";
import Button from 'react-bootstrap/Button';

const isLocal = true;

const OAuth2Login = ({ onUserChange }) => {
  const [user, setUser] = useState(null); // User information

  useEffect(() => {
    // Fetch user info to check if logged in
    fetch("https://auth.famquest.REPLACE_BASE_DOMAIN/oauth2/userinfo", { credentials: "include" })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Not logged in");
      })
      .then((data) => {
        setUser(data);
        console.info(JSON.stringify(data));
        onUserChange(data); // Notify parent component
      })
      .catch(() => {
        setUser(null);
        onUserChange(null); // Notify parent component
      });
  }, []);

  const login = () => {
    const frontendUrl = window.location.origin; // Get current frontend URL
    const loginUrl = `https://auth.famquest.REPLACE_BASE_DOMAIN/oauth2/sign_in?rd=${encodeURIComponent(frontendUrl)}`;
    window.location.href = loginUrl;
  };


  const logout = () => {
    fetch("https://auth.famquest.REPLACE_BASE_DOMAIN/oauth2/sign_out", { method: "GET", credentials: "include" })
      .then(() => {
        setUser(null);
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
