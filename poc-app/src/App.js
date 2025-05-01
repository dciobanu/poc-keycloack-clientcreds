// App.js - POC Keycloak Authentication App
import React, { useState, useEffect } from 'react';
import Keycloak from 'keycloak-js';
import './App.css';

function App() {
  const [keycloak, setKeycloak] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [token, setToken] = useState(null);
  const [initializationError, setInitializationError] = useState(null);

  useEffect(() => {
    // Initialize Keycloak instance using environment variables
    const keycloakConfig = {
      url: process.env.REACT_APP_KEYCLOAK_URL || 'http://localhost:8080',
      realm: process.env.REACT_APP_KEYCLOAK_REALM || 'sentinel-poc',
      clientId: process.env.REACT_APP_KEYCLOAK_CLIENT_ID || 'poc-ios-client',
    };

    console.log('Keycloak config:', keycloakConfig);
    const keycloakInstance = new Keycloak(keycloakConfig);

    // Initialize Keycloak on component mount
    keycloakInstance.init({
      flow: 'implicit', // Using implicit flow as requested
      redirectUri: window.location.origin,
      checkLoginIframe: false, // Disable iframe usage completely
      onLoad: 'check-sso' // Only check if already logged in, don't force login
    }).then(authenticated => {
      console.log('Keycloak initialized, authenticated:', authenticated);
      setKeycloak(keycloakInstance);
      setAuthenticated(authenticated);
      
      if (authenticated) {
        setToken(keycloakInstance.token);
        
        // Fetch user info
        keycloakInstance.loadUserInfo().then(userInfo => {
          setUserInfo(userInfo);
          console.log('User info loaded:', userInfo);
        }).catch(error => {
          console.error('Failed to load user info:', error);
        });
        
        // Set up token refresh
        keycloakInstance.onTokenExpired = () => {
          console.log('Token expired, refreshing...');
          keycloakInstance.updateToken(30).then(refreshed => {
            if (refreshed) {
              console.log('Token refreshed');
              setToken(keycloakInstance.token);
            } else {
              console.log('Token not refreshed, still valid');
            }
          }).catch(error => {
            console.error('Failed to refresh token:', error);
            setAuthenticated(false);
            setUserInfo(null);
            setToken(null);
          });
        };
      }
    }).catch(error => {
      console.error('Failed to initialize Keycloak:', error);
      setInitializationError(error.toString());
    });
    
    // Clean up function to handle component unmounting
    return () => {
      console.log('Component unmounting, cleaning up Keycloak instance');
      // No specific cleanup needed for Keycloak
    };
  }, []); // Empty dependency array ensures this runs only once

  const login = () => {
    if (keycloak) {
      console.log('Redirecting to Keycloak login page...');
      keycloak.login({
        redirectUri: window.location.origin
      });
    } else {
      console.error('Keycloak instance not available');
    }
  };

  const logout = () => {
    if (keycloak) {
      keycloak.logout({
        redirectUri: window.location.origin
      });
      setAuthenticated(false);
      setUserInfo(null);
      setToken(null);
    }
  };

  const logout = () => {
    if (keycloak && authenticated) {
      keycloak.logout();
      setAuthenticated(false);
      setUserInfo(null);
      setToken(null);
      // We don't set initialized to false here because we don't want to re-initialize Keycloak
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