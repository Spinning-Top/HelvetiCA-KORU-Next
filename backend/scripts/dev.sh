#!/bin/bash

# Funzione per terminare i processi che occupano una specifica porta
terminate_process_on_port() {
  local port=$1
  pid=$(lsof -ti :"$port")
  if [ -n "$pid" ]; then
    echo "Terminazione processo sulla porta $port (PID: $pid)"
    kill -9 "$pid"
  else
    echo "Nessun processo trovato sulla porta $port"
  fi
}

# CORE

# api gateway
terminate_process_on_port 9100
cd backend/core/services/api-gateway && deno task dev & API_GATEWAY=$!
echo "API Gateway started with PID $API_GATEWAY"

sleep 2

# auth service
terminate_process_on_port 9201
cd backend/core/services/auth-service && deno task dev & AUTH_SERVICE=$!
echo "Auth Service started with PID $AUTH_SERVICE"

# role service
# terminate_process_on_port 9205
# cd backend/core/services/role-service && deno task dev & ROLE_SERVICE=$!
# echo "Role Service started with PID $ROLE_SERVICE"

# # user service
# terminate_process_on_port 9206
# cd backend/core/services/user-service && deno task dev & USER_SERVICE=$!
# echo "User Service started with PID $USER_SERVICE"

# # FEATURE

# # dummy service
# terminate_process_on_port 9301
# cd backend/feature/services/dummy-service && deno task dev & DUMMY_SERVICE=$!
# echo "Dummy Service started with PID $DUMMY_SERVICE"

wait $API_GATEWAY $AUTH_SERVICE # $ROLE_SERVICE $USER_SERVICE $DUMMY_SERVICE
