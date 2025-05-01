# Keycloak Client Credentials Flow Demo

This project demonstrates a complete implementation of Keycloak authentication using the client credentials flow. It includes both a direct client-side implementation and a secure backend implementation.

## Features

- **Automated Setup**: One-command setup and configuration of all components
- **Multiple Clients**: Support for multiple client IDs with secure secret storage
- **Two Authentication Methods**:
  - Direct client-side implementation (for demonstration only)
  - Secure backend implementation (recommended for production)
- **Docker-based**: All components run in Docker containers for easy deployment

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)
- Bash shell (Git Bash on Windows)

## Quick Start

To start the entire demo with a single command:

```bash
# Make the startup script executable
chmod +x start-demo.sh

# Run the startup script
./start-demo.sh
```

This script will:
1. Build and start all services (Keycloak, database, initializer, backend, frontend)
2. Configure Keycloak with the necessary realm and clients
3. Open the application in your default browser

## Manual Setup

If you prefer to run each step manually:

```bash
# Create the scripts directory
mkdir -p scripts

# Copy the initialization script
cp keycloak-init.sh scripts/

# Build and start all services
docker-compose up -d --build

# Check the logs to see if initialization is complete
docker-compose logs -f initializer
```

## Accessing the Services

- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Keycloak Admin Console**: http://localhost:8080/admin
  - Username: `admin`
  - Password: `admin`

## Preconfigured Clients

The demo comes with the following preconfigured clients:

| Client ID | Client Secret | Description |
|-----------|---------------|-------------|
| poc-ios-client | 267GvXWbwgppYoqcNsRVseg9JuXmqdoK | Default client |
| mobile-client | mobileClientSecretExample | Example mobile client |
| web-client | webClientSecretExample | Example web client |

## Project Structure

```
keycloak-demo/
├── docker-compose.yml     # Docker compose configuration
├── scripts/               # Configuration scripts
│   ├── keycloak-init.sh   # Keycloak initialization script
│   └── Dockerfile.initializer # Docker image for initializer
├── poc-app/               # React frontend application
│   ├── Dockerfile
│   ├── src/
│   │   ├── App.js
│   │   └── ...
│   └── ...
└── backend/               # Secure backend service
    ├── Dockerfile
    ├── server.js
    └── ...
```

## Using the Application

1. When the application loads, you'll see two authentication methods:
   - **Client-side (Insecure)**: Direct authentication from the browser
   - **Backend (Secure)**: Authentication through the backend service

2. Select a client ID from the dropdown menu

3. Click "Get Token" to authenticate using the selected method

4. View the token information displayed on the screen

## Troubleshooting

### Services Not Starting

Check the logs for any errors:

```bash
docker-compose logs -f
# Or for a specific service
docker-compose logs -f keycloak
```

### Reset the Environment

To completely reset the environment:

```bash
docker-compose down -v
./start-demo.sh
```

### Network Issues

If containers can't communicate:

```bash
# Check if all containers are running
docker ps

# Check the network
docker network inspect keycloak-demo_keycloak-network
```

## Extending the Demo

### Adding New Clients

1. Add the client secret to the backend environment variables in `docker-compose.yml`
2. Update the client mapping in `server.js`
3. Add the client to the Keycloak initialization script (`keycloak-init.sh`)

### Customizing the Client Configuration

Modify the client configuration in `keycloak-init.sh` to adjust settings like:
- Redirect URIs
- Web Origins
- Flows (standard, implicit, direct access)
- Service accounts

## Security Notes

- The client-side implementation exposes client secrets in the browser and is NOT secure for production
- The backend implementation keeps client secrets secure and is recommended for production systems
- In a real-world application, you would use the obtained token to access protected resources