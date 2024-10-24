import { dirname, join, fromFileUrl } from "@std/path";

const CORE_SERVICES = "../../../../config/core/services.json";
const FEATURE_SERVICES = "../../../../config/feature/services.json";

const DOCKER_FILE_TEMPLATE = `FROM alpine:3.20.3

WORKDIR /app

COPY ./build/service /app/service
COPY ../../../.env /app/.env

RUN chmod +x /app/service

CMD ["/app/service"]`;

async function main() {
  console.log("##################################");
  console.log("### Create Services Dockerfile ###");
  console.log("##################################");
  console.log("");

  const sections: string[] = ["core", "feature"];

  for (const section of sections) {
    await createServicesDockerFile(section);
  }
}

async function createServicesDockerFile(section: string): Promise<void> {
  let services: { name: string; path: string; port: string | undefined; enabled: boolean }[] = [];

  if (section === "feature") {
    services = (await import(FEATURE_SERVICES, { with: { type: "json" } })).default;
  } else {
    services = (await import(CORE_SERVICES, { with: { type: "json" } })).default;
  }

  for (const service of services.filter((service) => service.enabled === true)) {
    const renderedDockerFile: string = DOCKER_FILE_TEMPLATE;

    const currentDir = dirname(fromFileUrl(import.meta.url));  
    const filePath = join(currentDir, `../../../../${service.path}/Dockerfile`);
    Deno.writeTextFileSync(filePath, renderedDockerFile);
  }

  console.log(`${section.toUpperCase()} services dockerfile created successfully`);
}

main();
