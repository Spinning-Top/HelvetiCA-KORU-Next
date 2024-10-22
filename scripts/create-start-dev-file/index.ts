import { dirname, join, fromFileUrl } from "@std/path";

const CORE_SERVICES = "../../config/core/services.json";
const FEATURE_SERVICES = "../../config/feature/services.json";

const START_DEV_TEMPLATE = `#!/bin/bash

%SERVICES%

wait %PIDS%`;

const SERVICE_TEMPLATE = `# %COMMENT_NAME%
pnpm --filter @koru/%SERVICE_NAME% run dev & %PID_NAME%=$!
echo "%NAME% started with PID $%PID_NAME%"`;

async function main() {
  console.log("###############################");
  console.log("###  Create Start Dev File  ###");
  console.log("###############################");
  console.log("");

  const renderedServices: string[] = [];
  const pids: string[] = [];

  const sections: string[] = ["core", "feature"];

  for (const section of sections) {
    renderedServices.push(`# ${section.toUpperCase()}`);

    let services: { name: string; path: string; port: string; enabled: boolean }[] = [];

    if (section === "feature") {
      services = (await import(FEATURE_SERVICES, { with: { type: "json" } })).default;
    } else {
      services = (await import(CORE_SERVICES, { with: { type: "json" } })).default;
    }
  
    for (const service of services.filter((service) => service.enabled === true)) {
      renderedServices.push(renderService(service));
      pids.push("$" + service.name.toUpperCase().replace(" ", "_"));
    }
  }

  const renderedStartDevFile: string = START_DEV_TEMPLATE.replace(/%SERVICES%/g, renderedServices.join("\n\n")).replace(/%PIDS%/g, pids.join(" "));

  const currentDir = dirname(fromFileUrl(import.meta.url));  
  const filePath = join(currentDir, "../start-dev.sh");
  Deno.writeTextFileSync(filePath, renderedStartDevFile);

  console.log(`Start dev file created successfully`);
}

function renderService(service: { name: string; path: string; port: string; enabled: boolean }): string {
  return SERVICE_TEMPLATE.replace(/%COMMENT_NAME%/g, service.name.toLowerCase())
    .replace(/%SERVICE_NAME%/g, service.name.toLowerCase().replace(" ", "-"))
    .replace(/%PID_NAME%/g, service.name.toUpperCase().replace(" ", "_"))
    .replace(/%NAME%/g, service.name);
}

main();
