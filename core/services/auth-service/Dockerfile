FROM alpine:latest

WORKDIR /app

COPY ./build/service /app/service

RUN chmod +x /app/service

CMD ["/app/service"]
