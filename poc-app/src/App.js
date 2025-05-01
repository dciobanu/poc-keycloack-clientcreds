// App.js - POC Keycloak Authentication App with Client Credentials Flow
import React, { useState } from 'react';
import './App.css';

function App() {
  const [token, setToken] = useState(null);
  const [tokenInfo, setTokenInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Keycloak configuration
  const keycloakConfig = {
    url: process.env.REACT_APP_KEYCLOAK_URL || 'http://localhost:8080',
    realm: process.env.REACT_APP_KEYCLOAK_REALM || 'sentinel-poc',
    clientId: process.env.REACT_APP_KEYCLOAK_CLIENT_ID || 'poc-ios-client',
    clientSecret: process.env.REACT_APP_KEYCLOAK_CLIENT_SECRET || '267GvXWbwgppYoqcNsRVseg9JuXmqdoK'
  };

  // Function to get token using client credentials flow
  const getClientToken = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Create form data for the token request
      const formData = new URLSearchParams();
      formData.append('grant_type', 'client_credentials');
      formData.append('client_id', keycloakConfig.clientId);
      formData.append('client_secret', keycloakConfig.clientSecret);

      console.log('Requesting token with config:', keycloakConfig);
      
      // Make the token request
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
        setToken(data.access_token);
        
        // Try to decode the JWT token to display its contents
        try {
          const tokenPayload = JSON.parse(atob(data.access_token.split('.')[1]));
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
            raw: data
          });
        }
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

  return (
    <div className="App">
      <header className="App-header">
        <h1>Keycloak Authentication POC</h1>
        <p>This POC demonstrates the client credentials flow with Keycloak</p>
        
        <div className="config-info">
          <h3>Configuration:</h3>
          <p><strong>Keycloak URL:</strong> {keycloakConfig.url}</p>
          <p><strong>Realm:</strong> {keycloakConfig.realm}</p>
          <p><strong>Client ID:</strong> {keycloakConfig.clientId}</p>
        </div>
        
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}
        
        {!token && (
          <button 
            onClick={getClientToken} 
            className="login-button" 
            disabled={loading}
          >
            {loading ? 'Getting token...' : 'Get Client Token'}
          </button>
        )}
        
        {token && (
          <div className="token-info">
            <h2>Token Received!</h2>
            
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
            
            <button 
              onClick={() => {
                setToken(null);
                setTokenInfo(null);
              }} 
              className="logout-button"
            >
              Clear Token
            </button>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;