# Keycloak Client Credentials POC with Docker Compose

This project demonstrates two approaches to implementing the Client Credentials flow with Keycloak, all running in Docker containers:

1. **Client-side implementation**: Direct authentication from the browser (not secure for production)
2. **Backend implementation**: Secure authentication through a backend service (recommended for production)

## Project Structure

```
keycloak-demo/
├── docker-compose.yml     # Docker compose configuration for all services
├── Makefile               # Helper commands for Docker Compose
├── poc-app/               # React frontend application
│   ├── Dockerfile         # Docker configuration for the frontend
│   ├── public/
│   ├── src/
│   │   ├── App.js         # React application with both auth methods
│   │   ├── App.css        # Styles for the application
│   │   └── ...
│   └── ...
└── backend/               # Secure backend service
    ├── Dockerfile         # Docker configuration for the backend
    ├── server.js          # Express server for secure auth
    └── package.json       # Backend dependencies
```

## Prerequisites

- Docker and Docker Compose installed on your system
- Make (optional, for using the Makefile commands)

## Running the Application with Docker Compose

### Quick Start

The easiest way to run everything is using the provided Makefile:

```bash
# Build and start all services
make build

# Or, if you want to also open the app in your browser
make run
```

If you don't have Make installed, you can use Docker Compose directly:

```bash
# Build and start all services
docker-compose up -d --build
```

### Accessing the Application

- React Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Keycloak Admin Console: http://localhost:8080/admin
  - Username: `admin`
  - Password: `admin`

### Managing the Services

Using the Makefile (recommended):

```bash
# View logs
make logs

# Stop all services
make down

# Restart all services
make restart

# Check service status
make status

# Clean up everything (including volumes)
make clean
```

Using Docker Compose directly:

```bash
# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Restart all services
docker-compose restart
```

## Configuring Keycloak for Client Credentials Flow

After the services are running, you need to configure Keycloak:

1. Access the Keycloak admin console at http://localhost:8080/admin
2. Login with username `admin` and password `admin`
3. Create a new realm named `sentinel-poc`
4. Create a new client with ID `poc-ios-client`
5. Configure the client:
   - Set Access Type to "confidential"
   - Enable "Service Accounts"
   - Set Client Secret to `267GvXWbwgppYoqcNsRVseg9JuXmqdoK` (or update the environment variables in docker-compose.yml)
   - Add valid redirect URIs: http://localhost:3000/*
   - Set Web Origins to `*` (for development only)

## Using the Application

1. Open http://localhost:3000 in your browser
2. Choose your authentication method:
   - **Client-side (Insecure)**: Direct authentication from the browser
   - **Backend (Secure)**: Authentication through the backend service
3. Click "Get Token" to authenticate using the selected method
4. View the token information displayed on the screen

## Troubleshooting

### Services Not Starting

Check the logs for any errors:

```bash
make logs
# or for specific service
make logs-keycloak
make logs-poc-app
make logs-backend
```

### Network Issues

If services can't communicate with each other:

1. Ensure all services are on the same Docker network
2. Check the environment variables in docker-compose.yml
3. For the backend method, make sure the backend service is running

### CORS Issues

If you encounter CORS errors:

1. Ensure your Keycloak instance has the proper Web Origins configured
2. Check that the backend server has CORS middleware enabled

## Security Notes

- The client-side implementation exposes the client secret in the browser and is NOT secure for production
- The backend implementation keeps the client secret secure and is recommended for production use
- In a real-world application, you would typically use the obtained token to access protected resources