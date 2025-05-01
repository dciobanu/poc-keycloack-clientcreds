#!/bin/bash
set -e

echo "Waiting for Keycloak to be ready..."
# Using a more reliable health check by checking master realm
until curl -s --fail http://keycloak:8080/realms/master > /dev/null; do
  echo "Keycloak not ready yet, waiting..."
  sleep 5
done
echo "Keycloak is ready!"

# Get an admin token for the master realm
echo "Getting admin token..."
ADMIN_TOKEN=$(curl -s -X POST http://keycloak:8080/realms/master/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin" \
  -d "password=admin" \
  -d "grant_type=password" \
  -d "client_id=admin-cli" \
  | jq -r '.access_token')

if [ -z "$ADMIN_TOKEN" ] || [ "$ADMIN_TOKEN" == "null" ]; then
  echo "Failed to get admin token. Exiting."
  exit 1
fi

echo "Successfully obtained admin token."

# Check if realm exists
echo "Checking if sentinel-poc realm exists..."
REALM_EXISTS=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://keycloak:8080/admin/realms/sentinel-poc)

# Create the realm if it doesn't exist
if [ "$REALM_EXISTS" == "404" ]; then
  echo "Creating sentinel-poc realm..."
  curl -s -X POST http://keycloak:8080/admin/realms \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "realm": "sentinel-poc",
      "enabled": true,
      "displayName": "Sentinel POC"
    }'
  echo "Realm created successfully."
else
  echo "Realm sentinel-poc already exists."
fi

# Configure poc-ios-client
echo "Configuring poc-ios-client..."
# Check if client exists
CLIENT_EXISTS=$(curl -s \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://keycloak:8080/admin/realms/sentinel-poc/clients \
  | jq '.[] | select(.clientId=="poc-ios-client") | .id')

if [ -z "$CLIENT_EXISTS" ] || [ "$CLIENT_EXISTS" == "null" ]; then
  echo "Creating poc-ios-client..."
  # Create client with secret directly in the creation request
  curl -s -X POST http://keycloak:8080/admin/realms/sentinel-poc/clients \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "clientId": "poc-ios-client",
      "enabled": true,
      "clientAuthenticatorType": "client-secret",
      "secret": "267GvXWbwgppYoqcNsRVseg9JuXmqdoK",
      "redirectUris": ["http://localhost:3000/*", "http://localhost/*"],
      "webOrigins": ["*"],
      "publicClient": false,
      "protocol": "openid-connect",
      "serviceAccountsEnabled": true,
      "authorizationServicesEnabled": false,
      "implicitFlowEnabled": true,
      "directAccessGrantsEnabled": true,
      "standardFlowEnabled": true
    }'
  
  echo "poc-ios-client created with secret."
else
  echo "poc-ios-client already exists, updating secret..."
  # For existing clients, get the client ID and update the secret
  curl -s -X PUT "http://keycloak:8080/admin/realms/sentinel-poc/clients/${CLIENT_EXISTS}/client-secret" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "type": "secret",
      "value": "267GvXWbwgppYoqcNsRVseg9JuXmqdoK"
    }'
fi

# Configure mobile-client
echo "Configuring mobile-client..."
CLIENT_EXISTS=$(curl -s \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://keycloak:8080/admin/realms/sentinel-poc/clients \
  | jq '.[] | select(.clientId=="mobile-client") | .id')

if [ -z "$CLIENT_EXISTS" ] || [ "$CLIENT_EXISTS" == "null" ]; then
  echo "Creating mobile-client..."
  # Create client with secret directly in the creation request
  curl -s -X POST http://keycloak:8080/admin/realms/sentinel-poc/clients \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "clientId": "mobile-client",
      "enabled": true,
      "clientAuthenticatorType": "client-secret",
      "secret": "mobileClientSecretExample",
      "redirectUris": ["http://localhost:3000/*", "http://localhost/*"],
      "webOrigins": ["*"],
      "publicClient": false,
      "protocol": "openid-connect",
      "serviceAccountsEnabled": true,
      "authorizationServicesEnabled": false,
      "implicitFlowEnabled": true,
      "directAccessGrantsEnabled": true,
      "standardFlowEnabled": true
    }'
  
  echo "mobile-client created with secret."
else
  echo "mobile-client already exists, updating secret..."
  # For existing clients, get the client ID and update the secret
  curl -s -X PUT "http://keycloak:8080/admin/realms/sentinel-poc/clients/${CLIENT_EXISTS}/client-secret" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "type": "secret",
      "value": "mobileClientSecretExample"
    }'
fi

# Configure web-client
echo "Configuring web-client..."
CLIENT_EXISTS=$(curl -s \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://keycloak:8080/admin/realms/sentinel-poc/clients \
  | jq '.[] | select(.clientId=="web-client") | .id')

if [ -z "$CLIENT_EXISTS" ] || [ "$CLIENT_EXISTS" == "null" ]; then
  echo "Creating web-client..."
  # Create client with secret directly in the creation request
  curl -s -X POST http://keycloak:8080/admin/realms/sentinel-poc/clients \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "clientId": "web-client",
      "enabled": true,
      "clientAuthenticatorType": "client-secret",
      "secret": "webClientSecretExample",
      "redirectUris": ["http://localhost:3000/*", "http://localhost/*"],
      "webOrigins": ["*"],
      "publicClient": false,
      "protocol": "openid-connect",
      "serviceAccountsEnabled": true,
      "authorizationServicesEnabled": false,
      "implicitFlowEnabled": true,
      "directAccessGrantsEnabled": true,
      "standardFlowEnabled": true
    }'
  
  echo "web-client created with secret."
else
  echo "web-client already exists, updating secret..."
  # For existing clients, get the client ID and update the secret
  curl -s -X PUT "http://keycloak:8080/admin/realms/sentinel-poc/clients/${CLIENT_EXISTS}/client-secret" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "type": "secret",
      "value": "webClientSecretExample"
    }'
fi

echo "Keycloak configuration completed successfully!"