// server.js - Secure backend for client credentials flow
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Secure endpoint to get token using client credentials
app.post('/api/token', async (req, res) => {
  try {
    // Get configuration from environment variables (not exposed to client)
    const keycloakUrl = process.env.KEYCLOAK_URL;
    const realm = process.env.KEYCLOAK_REALM;
    const clientId = process.env.KEYCLOAK_CLIENT_ID;
    const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET;

    // Log request (without sensitive data)
    console.log(`Token request for realm: ${realm}`);

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

    // Return the token response to the client
    // Note: In a production environment, you might want to limit what's returned
    res.json(response.data);
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

// Start the server
app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Configured for realm: ${process.env.KEYCLOAK_REALM}`);
});
