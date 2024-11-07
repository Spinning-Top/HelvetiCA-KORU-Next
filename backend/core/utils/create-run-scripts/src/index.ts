import * as fs from "node:fs";

const CORE_SERVICES = "./backend/config/core/services.json";
const FEATURE_SERVICES = "./backend/config/feature/services.json";

const DEV_SCRIPT_PATH = "./backend/scripts/dev.sh";
const PROD_SCRIPT_PATH = "./backend/scripts/prod.sh";

const SCRIPT_TEMPLATE = `#!/bin/bash

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
cd %PATH% && deno task %MODE% & %PID_NAME%=$!
echo "%NAME% started with PID $%PID_NAME%"`;

function main() {
  console.log("################################");
  console.log("###    Create Run Scripts    ###");
  console.log("################################");
  console.log("");

  const modes: string[] = ["dev", "prod"];

  for (const mode of modes) {
    const renderedServices: string[] = [];
    const pids: string[] = [];

    const sections: string[] = ["core", "feature"];
    let isFirst: boolean = true;

    for (const section of sections) {
      renderedServices.push(`# ${section.toUpperCase()}`);

      let services: { name: string; path: string; devPort: string; prodPort: string; enabled: boolean }[] = [];

      if (section === "feature") {
        services = JSON.parse(fs.readFileSync(FEATURE_SERVICES, "utf-8"));
      } else {
        services = JSON.parse(fs.readFileSync(CORE_SERVICES, "utf-8"));
      }

      for (const service of services.filter((service) => service.enabled === true)) {
        renderedServices.push(renderService(mode, service));

        if (isFirst) {
          renderedServices.push("sleep 1");
          isFirst = false;
        }

        pids.push("$" + service.name.toUpperCase().replace(/ /g, "_"));
      }
    }

    const renderedFile: string = SCRIPT_TEMPLATE.replace(/%SERVICES%/g, renderedServices.join("\n\n")).replace(/%PIDS%/g, pids.join(" "));

    if (mode === "dev") {
      fs.writeFileSync(DEV_SCRIPT_PATH, renderedFile);
      console.log("Dev script created successfully");
    } else {
      fs.writeFileSync(PROD_SCRIPT_PATH, renderedFile);
      console.log("Prod script created successfully");
    }
  }
}

function renderService(mode: string, service: { name: string; path: string; devPort: string; prodPort: string; enabled: boolean }): string {
  return SERVICE_TEMPLATE.replace(/%COMMENT_NAME%/g, service.name.toLowerCase())
    .replace(/%PATH%/g, service.path)
    .replace(/%MODE%/g, mode)
    .replace(/%SERVICE_NAME%/g, service.name.toLowerCase().replace(/ /g, "-"))
    .replace(/%PID_NAME%/g, service.name.toUpperCase().replace(/ /g, "_"))
    .replace(/%NAME%/g, service.name);
}

main();
