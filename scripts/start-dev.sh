#!/bin/bash

# CORE

# api gateway
cd core/services/api-gateway
deno task run & API_GATEWAY=$!
echo "API Gateway started with PID $API_GATEWAY"
sleep 1

cd ../../..
# auth service
cd core/services/auth-service
deno task run & AUTH_SERVICE=$!
echo "Auth Service started with PID $AUTH_SERVICE"

wait $API_GATEWAY $AUTH_SERVICE
