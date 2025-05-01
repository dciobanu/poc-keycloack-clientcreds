// server.js - Secure backend for client credentials flow with client ID mapping
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables from .env.server file
dotenv.config({ path: '.env.server' });

const app = express();
const port = process.env.SERVER_PORT || 3001;

// Enable CORS for your React app
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST'],
  credentials: true
}));

// Parse JSON body
app.use(express.json());

// Client secrets mapping - in a real app, this could be stored in a database
// or loaded from a secure configuration system
const clientSecrets = {
  'poc-ios-client': process.env.KEYCLOAK_CLIENT_SECRET || '267GvXWbwgppYoqcNsRVseg9JuXmqdoK',
  'mobile-client': process.env.MOBILE_CLIENT_SECRET || 'mobileClientSecretExample',
  'web-client': process.env.WEB_CLIENT_SECRET || 'webClientSecretExample',
  // Add more client mappings as needed
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Secure endpoint to get token using client credentials
app.post('/api/token', async (req, res) => {
  try {
    // Get the client ID from the request body
    const { clientId } = req.body;

    if (!clientId) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'Client ID is required'
      });
    }

    // Look up the client secret based on the provided client ID
    const clientSecret = clientSecrets[clientId];

    if (!clientSecret) {
      // Log attempt with unknown client ID (for security monitoring)
      console.warn(`Token request with unknown client ID: ${clientId}`);
      
      return res.status(400).json({
        error: 'invalid_client',
        error_description: 'Unknown client ID'
      });
    }

    // Get configuration from environment variables (not exposed to client)
    const keycloakUrl = process.env.KEYCLOAK_URL;
    const realm = process.env.KEYCLOAK_REALM;

    // Log request (without sensitive data)
    console.log(`Token request for client ID: ${clientId}, realm: ${realm}`);

    // Create form data for the token request
    const formData = new URLSearchParams();
    formData.append('grant_type', 'client_credentials');
    formData.append('client_id', clientId);
    formData.append('client_secret', clientSecret);

    // Make the token request to Keycloak
    const response = await axios.post(
      `${keycloakUrl}/realms/${realm}/protocol/openid-connect/token`,
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    // Add client identifier to the response for tracking purposes
    const tokenResponse = {
      ...response.data,
      client_identifier: clientId // Add client ID for frontend reference
    };

    // Return the token response to the client
    res.json(tokenResponse);
  } catch (error) {
    console.error('Token request failed:', error.response?.data || error.message);
    
    // Send appropriate error response
    if (error.response) {
      // Keycloak returned an error
      res.status(error.response.status).json({
        error: error.response.data.error || 'token_error',
        error_description: error.response.data.error_description || 'Failed to obtain token from Keycloak'
      });
    } else {
      // Server error
      res.status(500).json({
        error: 'server_error',
        error_description: 'Internal server error while processing token request'
      });
    }
  }
});

// Optional: Add an endpoint to get available client IDs (without secrets)
app.get('/api/clients', (req, res) => {
  const availableClients = Object.keys(clientSecrets).map(clientId => ({
    id: clientId,
    description: `Client ID: ${clientId}`
    // Add more metadata as needed (but never expose secrets)
  }));
  
  res.json(availableClients);
});

// Start the server
app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Configured for realm: ${process.env.KEYCLOAK_REALM}`);
  console.log(`Available client IDs: ${Object.keys(clientSecrets).join(', ')}`);
});