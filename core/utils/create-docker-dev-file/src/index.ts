import { dirname, join, fromFileUrl } from "@std/path";

const CORE_SERVICES = "../../../../config/core/services.json";
const FEATURE_SERVICES = "../../../../config/feature/services.json";

const DOCKER_COMPOSE_TEMPLATE = `name: koru-backend-dev

services:
  # core
%CORE_SERVICES%

  # feature
%FEATURE_SERVICES%

networks:
  koru-network:
    external: true`;

const DOCKER_COMPOSE_SERVICE_TEMPLATE = `  %SERVICE_NAME%:
    image: denoland/deno:2
    command: ["deno", "task", "run"]
    volumes:
      - ./%PATH%:/app
    working_dir: /app
    ports:
      - "%PORT%:%PORT%"
    networks:
      - koru-network`;

/*
  environment:
    - ENV_PATH=/service/.env
*/

async function main() {
  console.log("####################################");
  console.log("###    Create Docker Dev File    ###");
  console.log("####################################");
  console.log("");

  let renderedDockerCompose: string = DOCKER_COMPOSE_TEMPLATE;

  const sections: string[] = ["core", "feature"];

  for (const section of sections) {
    renderedDockerCompose = await createDockerDevFile(section, renderedDockerCompose);
  }

  const currentDir = dirname(fromFileUrl(import.meta.url));  
  const filePath = join(currentDir, `../../../../docker/compose/docker-compose.dev.yaml`);
  Deno.writeTextFileSync(filePath, renderedDockerCompose);

  console.log("Dev docker compose file created successfully");
}

async function createDockerDevFile(section: string, renderedDockerCompose: string): Promise<string> {
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
        .replace(/%PATH%/g, service.path || "")
        .replace(/%PORT%/g, service.port || "");
    });

  if (section === "feature") {
    renderedDockerCompose = renderedDockerCompose.replace(
      /%FEATURE_SERVICES%/g,
      renderedServices.join("\n")
    );
  } else {
    renderedDockerCompose = renderedDockerCompose.replace(
      /%CORE_SERVICES%/g,
      renderedServices.join("\n")
    );
  }

  return renderedDockerCompose;
}

main();
