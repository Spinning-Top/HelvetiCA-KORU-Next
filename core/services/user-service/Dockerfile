FROM alpine:3.20.3

WORKDIR /app

COPY ./build/service /app/service

RUN chmod +x /app/service

# copy .env file

CMD ["/app/service"]