import React, { useState, useEffect } from "react";

const OAuth2Login = ({ onUserChange }) => {
  const [user, setUser] = useState(null); // User information
  const [loading, setLoading] = useState(true);

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
      })
      .finally(() => setLoading(false));
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

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div style={styles.navbar}>
        {user ? (
          <>
            <span style={styles.user}>Hello, {user.name}</span>
            <button onClick={logout} style={styles.button}>Logout</button>
          </>
        ) : (
          <button onClick={login} style={styles.button}>Login</button>
        )}
      </div>
      <div style={styles.content}>
        {user ? (
          <div>
            <h1>Welcome, {user.name}!</h1>
            <p>Email: {user.email}</p>
            <p>fullinfo: {JSON.stringify(user)}</p>
          </div>
        ) : (
          <h1>You need to log in.</h1>
        )}
      </div>
    </div>
  );
};

const styles = {
  navbar: {
    position: "fixed",
    top: 0,
    right: 0,
    backgroundColor: "#282c34",
    color: "white",
    padding: "10px",
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },
  button: {
    backgroundColor: "#61dafb",
    border: "none",
    padding: "10px",
    cursor: "pointer",
  },
  user: {
    marginRight: "10px",
  },
  content: {
    marginTop: "50px",
    textAlign: "center",
  },
};

export default OAuth2Login;
