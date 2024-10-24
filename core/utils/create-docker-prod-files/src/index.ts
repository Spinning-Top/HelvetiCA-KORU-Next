import { dirname, join, fromFileUrl } from "@std/path";

const CORE_SERVICES = "../../../../config/core/services.json";
const FEATURE_SERVICES = "../../../../config/feature/services.json";

const DOCKER_COMPOSE_TEMPLATE = `name: koru-backend-prod-%SECTION%

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
    ports:
      - "%PORT%:%PORT%"
    networks:
      - koru-network`;

async function main() {
  console.log("####################################");
  console.log("###   Create Docker Prod Files   ###");
  console.log("####################################");
  console.log("");

  const sections: string[] = ["core", "feature"];

  for (const section of sections) {
    await createDockerProdFiles(section);
  }
}

async function createDockerProdFiles(section: string): Promise<void> {
  let services: { name: string; path: string; port: string | undefined; enabled: boolean }[] = [];

  if (section === "feature") {
    services = (await import(FEATURE_SERVICES, { with: { type: "json" } })).default;
  } else {
    services = (await import(CORE_SERVICES, { with: { type: "json" } })).default;
  }

  const renderedServices: string[] = services
    .filter((service) => service.enabled === true)
    .map((service) => {
      return DOCKER_COMPOSE_SERVICE_TEMPLATE
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
  const filePath = join(currentDir, `../../../../docker/compose/docker-compose.prod.${section}.yaml`);
  Deno.writeTextFileSync(filePath, renderedDockerCompose);

  console.log(`${section.toUpperCase()} docker compose file created successfully`);
}

main();
