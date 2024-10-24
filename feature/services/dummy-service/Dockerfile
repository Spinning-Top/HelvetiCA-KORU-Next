FROM alpine:3.20.3

WORKDIR /app

COPY ./build/service /app/service
COPY ../../../.env /app/.env

RUN chmod +x /app/service

CMD ["/app/service"]