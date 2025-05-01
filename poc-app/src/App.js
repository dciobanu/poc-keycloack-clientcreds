// App.js - POC Keycloak Authentication App with Multiple Options - Docker Configuration Update
import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [token, setToken] = useState(null);
  const [tokenInfo, setTokenInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [authMethod, setAuthMethod] = useState('client'); // 'client' or 'backend'
  const [backendUrl, setBackendUrl] = useState('');

  // Initialize backend URL based on environment or Docker configuration
  useEffect(() => {
    // Get backend URL from environment variable or determine it dynamically
    const envBackendUrl = process.env.REACT_APP_BACKEND_URL;
    
    // When running in Docker, we need to replace localhost with the correct service name
    // or use window.location.hostname to get the current hostname
    if (envBackendUrl && envBackendUrl.includes('localhost') && window.location.hostname !== 'localhost') {
      // Replace localhost with the current hostname for Docker networking
      const dockerBackendUrl = envBackendUrl.replace('localhost', window.location.hostname);
      console.log(`Running in Docker environment. Using backend URL: ${dockerBackendUrl}`);
      setBackendUrl(dockerBackendUrl);
    } else {
      console.log(`Using configured backend URL: ${envBackendUrl}`);
      setBackendUrl(envBackendUrl || 'http://localhost:3001');
    }
  }, []);

  // Keycloak configuration
  const keycloakConfig = {
    url: process.env.REACT_APP_KEYCLOAK_URL || 'http://localhost:8080',
    realm: process.env.REACT_APP_KEYCLOAK_REALM || 'sentinel-poc',
    clientId: process.env.REACT_APP_KEYCLOAK_CLIENT_ID || 'poc-ios-client',
    clientSecret: process.env.REACT_APP_KEYCLOAK_CLIENT_SECRET || '267GvXWbwgppYoqcNsRVseg9JuXmqdoK'
  };

  // Function to get token directly from client (NOT SECURE FOR PRODUCTION)
  const getClientToken = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Create form data for the token request
      const formData = new URLSearchParams();
      formData.append('grant_type', 'client_credentials');
      formData.append('client_id', keycloakConfig.clientId);
      formData.append('client_secret', keycloakConfig.clientSecret);

      console.log('Requesting token with client-side flow');
      
      // Make the token request directly to Keycloak
      const response = await fetch(
        `${keycloakConfig.url}/realms/${keycloakConfig.realm}/protocol/openid-connect/token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData,
        }
      );

      // Parse the response
      const data = await response.json();
      
      if (response.ok) {
        console.log('Token received successfully');
        processToken(data.access_token);
      } else {
        console.error('Error getting token:', data);
        setError(`Error: ${data.error} - ${data.error_description}`);
      }
    } catch (err) {
      console.error('Request failed:', err);
      setError(`Request failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Function to get token through secure backend
  const getBackendToken = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Requesting token through secure backend at ${backendUrl}`);
      
      // Make the token request to our secure backend
      const response = await fetch(
        `${backendUrl}/api/token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          // We could add additional context here if needed
          body: JSON.stringify({}),
        }
      );

      // Parse the response
      const data = await response.json();
      
      if (response.ok) {
        console.log('Token received successfully from backend');
        processToken(data.access_token);
      } else {
        console.error('Error getting token from backend:', data);
        setError(`Error: ${data.error} - ${data.error_description}`);
      }
    } catch (err) {
      console.error('Backend request failed:', err);
      setError(`Backend request failed: ${err.message}. Please ensure the backend service is running at ${backendUrl}.`);
    } finally {
      setLoading(false);
    }
  };

  // Process and decode the token
  const processToken = (accessToken) => {
    setToken(accessToken);
    
    // Try to decode the JWT token to display its contents
    try {
      const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));
      setTokenInfo({
        issuedAt: new Date(tokenPayload.iat * 1000).toLocaleString(),
        expiresAt: new Date(tokenPayload.exp * 1000).toLocaleString(),
        clientId: tokenPayload.client_id || tokenPayload.azp,
        scopes: tokenPayload.scope || 'N/A',
        issuer: tokenPayload.iss,
      });
    } catch (err) {
      console.error('Error decoding token:', err);
      setTokenInfo({
        raw: 'Error decoding token'
      });
    }
  };

  // Get token based on selected method
  const getToken = () => {
    if (authMethod === 'client') {
      getClientToken();
    } else {
      getBackendToken();
    }
  };

  // Change authentication method
  const toggleAuthMethod = () => {
    setAuthMethod(authMethod === 'client' ? 'backend' : 'client');
    // Clear previous results when switching methods
    setToken(null);
    setTokenInfo(null);
    setError(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Keycloak Authentication POC</h1>
        <p>This POC demonstrates the client credentials flow with Keycloak</p>
        
        <div className="auth-toggle">
          <div className="toggle-container">
            <button 
              className={`toggle-button ${authMethod === 'client' ? 'active' : ''}`}
              onClick={() => toggleAuthMethod()}
            >
              {authMethod === 'client' ? '✓ Client-side (Insecure)' : 'Client-side (Insecure)'}
            </button>
            <button 
              className={`toggle-button ${authMethod === 'backend' ? 'active' : ''}`}
              onClick={() => toggleAuthMethod()}
            >
              {authMethod === 'backend' ? '✓ Backend (Secure)' : 'Backend (Secure)'}
            </button>
          </div>
          <p className="auth-description">
            {authMethod === 'client' ? 
              'Client-side: Direct authentication with client secret exposed in browser (Not secure for production)' : 
              'Backend: Authentication through secure backend service (Recommended for production)'}
          </p>
        </div>
        
        <div className="config-info">
          <h3>Configuration:</h3>
          <p><strong>Keycloak URL:</strong> {keycloakConfig.url}</p>
          <p><strong>Realm:</strong> {keycloakConfig.realm}</p>
          <p><strong>Client ID:</strong> {keycloakConfig.clientId}</p>
          {authMethod === 'backend' && (
            <p><strong>Backend URL:</strong> {backendUrl}</p>
          )}
        </div>
        
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}
        
        {!token && (
          <button 
            onClick={getToken} 
            className="login-button" 
            disabled={loading || (authMethod === 'backend' && !backendUrl)}
          >
            {loading ? 'Getting token...' : `Get Token (${authMethod === 'client' ? 'Client-side' : 'Backend'})`}
          </button>
        )}
        
        {token && (
          <div className="token-info">
            <h2>Token Received!</h2>
            <p className="token-source">Token obtained via: <strong>{authMethod === 'client' ? 'Client-side Flow' : 'Secure Backend'}</strong></p>
            
            <div className="token-details">
              <h3>Access Token:</h3>
              <p className="token-preview">{token.substring(0, 20)}...</p>
              
              {tokenInfo && (
                <div className="token-meta">
                  <h3>Token Information:</h3>
                  <p><strong>Client ID:</strong> {tokenInfo.clientId}</p>
                  <p><strong>Issued At:</strong> {tokenInfo.issuedAt}</p>
                  <p><strong>Expires At:</strong> {tokenInfo.expiresAt}</p>
                  <p><strong>Scopes:</strong> {tokenInfo.scopes}</p>
                  <p><strong>Issuer:</strong> {tokenInfo.issuer}</p>
                </div>
              )}
            </div>
            
            <div className="button-group">
              <button 
                onClick={() => {
                  setToken(null);
                  setTokenInfo(null);
                }} 
                className="reset-button"
              >
                Reset
              </button>
              
              <button 
                onClick={toggleAuthMethod} 
                className="switch-button"
              >
                Try {authMethod === 'client' ? 'Backend' : 'Client-side'} Method
              </button>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;