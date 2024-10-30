import * as fs from "node:fs";

const CORE_SERVICES = "./config/core/services.json";
const FEATURE_SERVICES = "./config/feature/services.json";

const DEV_SCRIPT_PATH = "./backend/scripts/dev.sh";

const DEV_SCRIPT_TEMPLATE = `#!/bin/bash

# function to cleanup services
cleanup() {
  echo "Gracefully stopping services..."
  kill %PIDS%
  wait %PIDS%
  echo "All services terminated"
}

# intercept SIGINT signal and call cleanup function
trap cleanup SIGINT

%SERVICES%

wait %PIDS%
`;

const SERVICE_TEMPLATE = `# %COMMENT_NAME%
cd %PATH% && deno task dev & %PID_NAME%=$!
echo "%NAME% started with PID $%PID_NAME%"`;

function main() {
  console.log("###############################");
  console.log("###    Create Dev Script    ###");
  console.log("###############################");
  console.log("");

  const renderedServices: string[] = [];
  const pids: string[] = [];

  const sections: string[] = ["core", "feature"];

  for (const section of sections) {
    renderedServices.push(`# ${section.toUpperCase()}`);

    let services: { name: string; path: string; port: string; enabled: boolean }[] = [];

    if (section === "feature") {
      services = JSON.parse(fs.readFileSync(FEATURE_SERVICES, "utf-8"));
    } else {
      services = JSON.parse(fs.readFileSync(CORE_SERVICES, "utf-8"));
    }

    for (const service of services.filter((service) => service.enabled === true)) {
      renderedServices.push(renderService(service));
      pids.push("$" + service.name.toUpperCase().replace(" ", "_"));
    }
  }

  const renderedStartDevFile: string = DEV_SCRIPT_TEMPLATE.replace(/%SERVICES%/g, renderedServices.join("\n\n")).replace(/%PIDS%/g, pids.join(" "));

  fs.writeFileSync(DEV_SCRIPT_PATH, renderedStartDevFile);

  console.log("Dev script created successfully");
}

function renderService(service: { name: string; path: string; port: string; enabled: boolean }): string {
  return SERVICE_TEMPLATE.replace(/%COMMENT_NAME%/g, service.name.toLowerCase())
    .replace(/%PATH%/g, service.path)
    .replace(/%SERVICE_NAME%/g, service.name.toLowerCase().replace(" ", "-"))
    .replace(/%PID_NAME%/g, service.name.toUpperCase().replace(" ", "_"))
    .replace(/%NAME%/g, service.name);
}

main();
