// App.js - POC Keycloak Authentication App
import React, { useState, useEffect } from 'react';
import Keycloak from 'keycloak-js';
import './App.css';

function App() {
  const [keycloak, setKeycloak] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Initialize Keycloak instance using environment variables
    const keycloakConfig = {
      url: process.env.REACT_APP_KEYCLOAK_URL || 'http://localhost:8080',
      realm: process.env.REACT_APP_KEYCLOAK_REALM || 'sentinel-poc',
      clientId: process.env.REACT_APP_KEYCLOAK_CLIENT_ID || 'poc-ios-client',
    };

    console.log('Keycloak config:', keycloakConfig);
    const keycloakInstance = new Keycloak(keycloakConfig);
    setKeycloak(keycloakInstance);
  }, []);

  const login = () => {
    if (keycloak) {
      keycloak.init({
        flow: 'implicit', // Using implicit flow as requested
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
        responseMode: 'fragment',
        checkLoginIframe: false
      }).then((authenticated) => {
        setAuthenticated(authenticated);
        
        if (authenticated) {
          console.log('User is authenticated');
          setToken(keycloak.token);
          console.log('Token expires in', Math.round(keycloak.tokenParsed.exp + keycloak.timeSkew - new Date().getTime() / 1000), 'seconds');
          
          // Fetch user info
          keycloak.loadUserInfo().then(userInfo => {
            setUserInfo(userInfo);
            console.log('User info:', userInfo);
          });

          // Set up token refresh
          keycloak.onTokenExpired = () => {
            console.log('Token expired, refreshing...');
            keycloak.updateToken(30).then((refreshed) => {
              if (refreshed) {
                console.log('Token refreshed');
                setToken(keycloak.token);
              } else {
                console.log('Token not refreshed, still valid');
              }
            }).catch(() => {
              console.error('Failed to refresh token');
              logout();
            });
          };
        } else {
          console.log('User authentication failed');
        }
      }).catch((error) => {
        console.error('Authentication failed:', error);
      });
    } else {
      console.error('Keycloak instance not initialized');
    }
  };

  const logout = () => {
    if (keycloak) {
      keycloak.logout();
      setAuthenticated(false);
      setUserInfo(null);
      setToken(null);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Keycloak Authentication POC</h1>
        <p>This POC demonstrates the implicit flow authentication with Keycloak</p>
        
        {!authenticated && (
          <button onClick={login} className="login-button">
            Login with Keycloak
          </button>
        )}
        
        {authenticated && (
          <div className="user-info">
            <h2>You are logged in!</h2>
            {userInfo && (
              <div className="user-details">
                <p><strong>Name:</strong> {userInfo.name}</p>
                <p><strong>Email:</strong> {userInfo.email}</p>
                <p><strong>Username:</strong> {userInfo.preferred_username}</p>
              </div>
            )}
            
            {token && (
              <div className="token-info">
                <h3>Access Token (first 20 chars):</h3>
                <p className="token-preview">{token.substring(0, 20)}...</p>
              </div>
            )}
            
            <button onClick={logout} className="logout-button">
              Logout
            </button>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;