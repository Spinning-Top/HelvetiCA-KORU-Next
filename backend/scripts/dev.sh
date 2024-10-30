#!/bin/bash

# function to cleanup services
cleanup() {
  echo "Gracefully stopping services..."
  kill $API_GATEWAY $AUTH_SERVICE $CRON_SERVICE $MAIL_SERVICE $NOTIFICATION_SERVICE $ROLE_SERVICE $USER_SERVICE $DUMMY_SERVICE
  wait $API_GATEWAY $AUTH_SERVICE $CRON_SERVICE $MAIL_SERVICE $NOTIFICATION_SERVICE $ROLE_SERVICE $USER_SERVICE $DUMMY_SERVICE
  echo "All services terminated"
}

# intercept SIGINT signal and call cleanup function
trap cleanup SIGINT

# CORE

# api gateway
cd core/services/api-gateway && deno task dev & API_GATEWAY=$!
echo "API Gateway started with PID $API_GATEWAY"

# auth service
cd core/services/auth-service && deno task dev & AUTH_SERVICE=$!
echo "Auth Service started with PID $AUTH_SERVICE"

# cron service
cd backend/core/services/cron-service && deno task dev & CRON_SERVICE=$!
echo "Cron Service started with PID $CRON_SERVICE"

# mail service
cd backend/core/services/mail-service && deno task dev & MAIL_SERVICE=$!
echo "Mail Service started with PID $MAIL_SERVICE"

# notification service
cd backend/core/services/notification-service && deno task dev & NOTIFICATION_SERVICE=$!
echo "Notification Service started with PID $NOTIFICATION_SERVICE"

# role service
cd backend/core/services/role-service && deno task dev & ROLE_SERVICE=$!
echo "Role Service started with PID $ROLE_SERVICE"

# user service
cd backend/core/services/user-service && deno task dev & USER_SERVICE=$!
echo "User Service started with PID $USER_SERVICE"

# FEATURE

# dummy service
cd backend/feature/services/dummy-service && deno task dev & DUMMY_SERVICE=$!
echo "Dummy Service started with PID $DUMMY_SERVICE"

wait $API_GATEWAY $AUTH_SERVICE $CRON_SERVICE $MAIL_SERVICE $NOTIFICATION_SERVICE $ROLE_SERVICE $USER_SERVICE $DUMMY_SERVICE
