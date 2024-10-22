# build stage
FROM node:20-alpine AS build

WORKDIR /service

COPY . .

RUN npm install -g pnpm

RUN pnpm install --frozen-lockfile

RUN pnpm --filter=@koru/auth-service --prod deploy ./deploy

# runtime stage
FROM node:20-alpine

WORKDIR /service

COPY --from=build /service/deploy ./

COPY .env.docker ./.env

CMD ["node", "dist/index.js"]