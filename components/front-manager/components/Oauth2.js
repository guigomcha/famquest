import React, { useState, useEffect } from "react";
import { Button } from 'antd';
import { registerUser, getUserInfo, getConfigure } from '../functions/db_manager_api';
import { useTranslation } from "react-i18next";

const isLocal = true;

const OAuth2Login = ({ onUserChange, setIsLoading }) => {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState(null); // User information
  
  useEffect(() => {
    console.info("Should get it: ", user)
    setIsLoading(true)
    // Fetch user info to check if logged in
    fetch("https://auth.REPLACE_TARGET_USER.famquest.REPLACE_BASE_DOMAIN/oauth2/userinfo", { credentials: "include" })
      .then((res) => {
        if (res.ok) {
          console.info("was ok at least");
          setIsLoading(false)
          return res.json();
        }
        console.info("Not logged in");
        throw new Error("Not logged in");
      })
      .then(async (data) => {
        // Make sure the idle connections are cleaned up
        await getConfigure();
        // we have to call twice to force reload
        await getConfigure();
        console.info("Received from proxy: " + JSON.stringify(data));
        // Register the user in the backend if it does not exist
        const tempUsers = await getUserInfo(0);
        console.info("obtained tempUsers ", tempUsers);
        const foundUser = tempUsers.find(item => item.extRef === data.user);
        console.info("connected as: ", foundUser);
        if (!foundUser) {
          const resp = await registerUser(data);
          console.info("Response from registerUser: ", resp)
          setUser(resp);
          onUserChange(resp); // Notify parent component
          setIsLoading(false)
          return;
        }
        setUser(foundUser);
        onUserChange(foundUser); // Notify parent component
      })
      .catch(() => {
        setUser(null);
        console.info("did not find userinfo");
        onUserChange(null); // Notify parent component
        setIsLoading(false)
      });
  }, []);

  const login = () => {
    const frontendUrl = window.location.origin; // Get current frontend URL
    const loginUrl = `https://auth.REPLACE_TARGET_USER.famquest.REPLACE_BASE_DOMAIN/oauth2/sign_in?rd=${encodeURIComponent(frontendUrl)}`;
    window.location.href = loginUrl;
  };
  
  
  const logout = () => {
    
    fetch(`https://auth.REPLACE_TARGET_USER.famquest.REPLACE_BASE_DOMAIN/oauth2/sign_out`, { method: "GET", credentials: "include" })
    .then(() => {
      console.info("Logout ok");
    })
    .catch((error) => {
      console.info("Logout error", error);
    });
    setUser(null);
    onUserChange(null);
    
    // Fetch does not work and ?post_logout_redirect_uri in keycloak's endpoint requires some Id to be automatic
    const keycloakLogout = `https://keycloak.common.REPLACE_BASE_DOMAIN/realms/REPLACE_TARGET_USER/protocol/openid-connect/logout`;
    window.location.href = keycloakLogout;
  };
  
  return (
      <div >
        {(user || isLocal) ? (
          <Button           
            color="default" 
            variant="outlined"
            onClick={logout}
          >{t('logout')}</Button>
        ) : (
          <Button 
            color="primary" 
            variant="solid"
            onClick={login}
          >{t('login')}</Button>
        )}
      </div>
  );
};

export default OAuth2Login;
