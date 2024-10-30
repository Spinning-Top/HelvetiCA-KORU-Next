#!/bin/bash

# Funzione per gestire la chiusura dei servizi
cleanup() {
  echo "Terminating all services..."
  kill $API_GATEWAY $AUTH_SERVICE $ROLE_SERVICE $USER_SERVICE
  wait $API_GATEWAY $AUTH_SERVICE $ROLE_SERVICE $USER_SERVICE
  echo "All services terminated."
}

# Intercetta SIGINT (CTRL+C) e chiama la funzione cleanup
trap cleanup SIGINT

# CORE

# api gateway
cd backend/core/services/api-gateway && deno task dev & API_GATEWAY=$!
echo "API Gateway started with PID $API_GATEWAY"

sleep 1

# auth service
cd backend/core/services/auth-service && deno task dev & AUTH_SERVICE=$!
echo "Auth Service started with PID $AUTH_SERVICE"

# role service
cd backend/core/services/role-service && deno task dev & ROLE_SERVICE=$!
echo "Role Service started with PID $ROLE_SERVICE"

# # user service
cd backend/core/services/user-service && deno task dev & USER_SERVICE=$!
echo "User Service started with PID $USER_SERVICE"

wait $API_GATEWAY $AUTH_SERVICE $ROLE_SERVICE $USER_SERVICE
