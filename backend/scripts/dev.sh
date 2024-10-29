#!/bin/bash

# Funzione per terminare i processi che occupano una specifica porta
porta_inizio=9100
porta_fine=9400

# Loop attraverso l'intervallo di porte
for ((porta=porta_inizio; porta<=porta_fine; porta++))
do
  # Trova il PID del processo che sta usando la porta specifica
  pid=$(lsof -t -i :$porta)

  # Se esiste un PID, termina il processo
  if [ -n "$pid" ]; then
    echo "Killing process $pid on port $porta"
    kill -9 $pid
  fi
done

sleep 2

# CORE

# api gateway
cd backend/core/services/api-gateway && deno task dev & API_GATEWAY=$!
echo "API Gateway started with PID $API_GATEWAY"

sleep 2

# auth service
cd backend/core/services/auth-service && deno task dev & AUTH_SERVICE=$!
echo "Auth Service started with PID $AUTH_SERVICE"

# role service
cd backend/core/services/role-service && deno task dev & ROLE_SERVICE=$!
echo "Role Service started with PID $ROLE_SERVICE"

# # user service
cd backend/core/services/user-service && deno task dev & USER_SERVICE=$!
echo "User Service started with PID $USER_SERVICE"

# # FEATURE

# # dummy service
# cd backend/feature/services/dummy-service && deno task dev & DUMMY_SERVICE=$!
# echo "Dummy Service started with PID $DUMMY_SERVICE"

wait $API_GATEWAY $AUTH_SERVICE $ROLE_SERVICE $USER_SERVICE # $DUMMY_SERVICE
