import { dirname, join, fromFileUrl } from "@std/path";

const CORE_SERVICES = "../../config/core/services.json";
const FEATURE_SERVICES = "../../config/feature/services.json";

const DOCKER_COMPOSE_TEMPLATE = `name: koru-%SECTION%

services:
%SERVICES%

networks:
  koru-network:
    external: true`;

const DOCKER_COMPOSE_SERVICE_TEMPLATE = `  %SERVICE_NAME%:
    container_name: %CONTAINER_NAME%
    image: %IMAGE_NAME%:latest
    environment:
      - ENV_PATH=/service/.env
    networks:
      - koru-network`;

const DOCKER_COMPOSE_SERVICE_TEMPLATE_WITH_PORT = `  %SERVICE_NAME%:
    container_name: %CONTAINER_NAME%
    image: %IMAGE_NAME%:latest
    environment:
      - ENV_PATH=/service/.env
    ports:
      - "%PORT%:%PORT%"
    networks:
      - koru-network`;

const DOCKER_FILE_TEMPLATE = `# build stage
FROM node:20-alpine AS build

WORKDIR /service

COPY . .

RUN npm install -g pnpm

RUN pnpm install --frozen-lockfile

RUN pnpm --filter=@koru/%NAME% --prod deploy ./deploy

# runtime stage
FROM node:20-alpine

WORKDIR /service

COPY --from=build /service/deploy ./

COPY .env.docker ./.env

CMD ["node", "dist/index.js"]`;

async function main() {
  console.log("##############################");
  console.log("###  Create Docker Files  ###");
  console.log("##############################");
  console.log("");

  const sections: string[] = ["core", "feature"];

  for (const section of sections) {
    await createDockerComposeFile(section);
    await createDockerFiles(section);
  }
}

async function createDockerComposeFile(section: string): Promise<void> {
  let services: { name: string; path: string; port: string | undefined; enabled: boolean }[] = [];

  if (section === "feature") {
    services = (await import(FEATURE_SERVICES, { with: { type: "json" } })).default;
  } else {
    services = (await import(CORE_SERVICES, { with: { type: "json" } })).default;
  }

  const renderedServices: string[] = services
    .filter((service) => service.enabled === true)
    .map((service) => {
      const template: string = service.port == undefined ? DOCKER_COMPOSE_SERVICE_TEMPLATE : DOCKER_COMPOSE_SERVICE_TEMPLATE_WITH_PORT;
      return template
        .replace(/%SERVICE_NAME%/g, service.name.toLowerCase().replace(" ", "-"))
        .replace(/%IMAGE_NAME%/g, `koru-${section}-${service.name.toLowerCase().replace(" ", "-")}`)
        .replace(/%CONTAINER_NAME%/g, service.name.replace(" ", "-"))
        .replace(/%PORT%/g, service.port || "");
    });

  const renderedDockerCompose: string = DOCKER_COMPOSE_TEMPLATE.replace(/%SECTION%/g, section.toLowerCase()).replace(
    /%SERVICES%/g,
    renderedServices.join("\n")
  );

  const currentDir = dirname(fromFileUrl(import.meta.url));  
  const filePath = join(currentDir, `../../docker-compose.${section}.yaml`);
  Deno.writeTextFileSync(filePath, renderedDockerCompose);

  console.log(`${section.toUpperCase()} docker compose file created successfully`);
}

async function createDockerFiles(section: string): Promise<void> {
  let services: { name: string; path: string; port: string | undefined; enabled: boolean }[] = [];

  if (section === "feature") {
    services = (await import(FEATURE_SERVICES, { with: { type: "json" } })).default;
  } else {
    services = (await import(CORE_SERVICES, { with: { type: "json" } })).default;
  }

  for (const service of services.filter((service) => service.enabled === true)) {
    const renderedDockerFile: string = DOCKER_FILE_TEMPLATE.replace(/%NAME%/g, service.name.toLowerCase().replace(" ", "-"));

    const currentDir = dirname(fromFileUrl(import.meta.url));  
    const filePath = join(currentDir, `../../${service.path}/Dockerfile`);
    Deno.writeTextFileSync(filePath, renderedDockerFile);
  }

  console.log(`${section.toUpperCase()} docker files created successfully`);
}

main();
