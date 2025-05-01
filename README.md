# Complete Keycloak POC Authentication Setup

This guide provides comprehensive instructions for setting up and running the Keycloak authentication demo with Docker Compose.

## Project Structure

Create the following directory structure:

```
keycloak-demo/
├── docker-compose.yml     # Main Docker Compose file
├── poc-app/
│   ├── public/
│   │   ├── index.html
│   │   ├── silent-check-sso.html
│   ├── src/
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   ├── .env
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
```

## Step 1: Set Up Keycloak and POC App

1. Create the `keycloak-demo` directory and navigate into it:
   ```bash
   mkdir -p keycloak-demo/poc-app
   cd keycloak-demo
   ```

2. Copy the `docker-compose.yml` file into the root directory.

3. Create the POC app structure:
   ```bash
   mkdir -p poc-app/public poc-app/src
   ```

4. Copy the Dockerfile, nginx.conf, and .env files into the `poc-app` directory.

5. Create a silent check SSO HTML file for silent token refresh:
   ```bash
   echo '<html><body><script>parent.postMessage(location.href, location.origin);</script></body></html>' > poc-app/public/silent-check-sso.html
   ```

6. Copy all the React files (App.js, index.js, etc.) into their respective directories in the `poc-app` folder.

## Step 2: Run the Application

1. Start the Docker Compose services:
   ```bash
   docker-compose up -d
   ```

2. Wait for all services to initialize. You can check the logs with:
   ```bash
   docker-compose logs -f
   ```

3. Access Keycloak at http://localhost:8080/admin
   - Username: `admin`
   - Password: `admin`

4. Access the React app at http://localhost:3000

## Step 3: Configure Keycloak

1. Log in to the Keycloak Admin Console (http://localhost:8080/admin)

2. Create the "sentinel-poc" realm:
   - Hover over the realm dropdown in the top-left corner
   - Click "Create Realm"
   - Enter "sentinel-poc" as the realm name
   - Click "Create"

3. Create and configure the client:
   - Go to "Clients" > "Create client"
   - Client ID: `poc-ios-client`
   - Client Authentication: ON
   - Authentication flow: Check both "Standard flow" and "Implicit flow"
   - Click "Next"

3. On the Capability config screen:
   - Client authentication: ON
   - Click "Next"

4. On the Login settings screen:
   - Root URL: `http://localhost:3000/`
   - Valid redirect URIs: `http://localhost:3000/*`
   - Web origins: `http://localhost:3000` (or use `*` for development)
   - Click "Save"

5. Go to "Credentials" tab and set the client secret:
   - Client secret: `267GvXWbwgppYoqcNsRVseg9JuXmqdoK`
   - You may need to click "Regenerate" and then manually update it

6. Create a test user:
   - Go to "Users" > "Add user"
   - Username: `testuser`
   - Email: `testuser@example.com`
   - Create the user
   - Go to "Credentials" tab
   - Set password: `password` (uncheck "Temporary")

## Step 4: Test the Application

1. Go to http://localhost:3000

2. Click "Login with Keycloak"

3. You will be redirected to the Keycloak login page

4. Log in with the test user credentials

5. Upon successful login, you will be redirected back to the POC app with your user information displayed

## Troubleshooting

### CORS Issues

If you encounter CORS errors:

1. Check the Web Origins settings in your Keycloak client configuration
2. Verify the nginx.conf file has proper CORS headers
3. Ensure Docker Compose network is properly configured

### Authentication Failures

If login fails:

1. Check browser console for errors
2. Verify client ID and secret match between Keycloak and the POC app
3. Ensure redirect URIs are properly configured
4. Check that implicit flow is enabled in Keycloak

### Container Connectivity Issues

If containers can't communicate:

1. Check the network settings in docker-compose.yml
2. Verify service names are correctly referenced in environment variables
3. Make sure ports are properly exposed

### POC App Not Loading

If the POC app doesn't build or run:

1. Check the Docker build logs:
   ```bash
   docker-compose logs -f poc-app
   ```
2. Verify dependencies in package.json
3. Check for syntax errors in the React code

