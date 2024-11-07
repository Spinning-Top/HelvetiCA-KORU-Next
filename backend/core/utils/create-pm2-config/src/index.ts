// third party
import * as fs from "node:fs";
import * as path from "node:path";

const ASSETS_PATH = "./backend/assets/";
const BUILD_PATH = "./backend/build/";
const CONFIG_PATH = "./backend/config/";
const ENV_FILE_PATH = "./backend/.env.prod";

function main() {
  console.log("################################");
  console.log("###       Create Build       ###");
  console.log("################################");
  console.log("");

  const sections: string[] = ["core", "feature"];

  setupBuild(sections);

  const pm2Services: { name: string; script: string; args: string; env: Record<string, string> }[] = [];

  for (const section of sections) {
    const services: { name: string; path: string; devPort: string; prodPort: string; enabled: boolean }[] = JSON.parse(
      fs.readFileSync(`${CONFIG_PATH}${section}/services.json`, "utf-8"),
    );

    console.log(`### ${section.toUpperCase()} ###`);
    for (const service of services.filter((service) => service.enabled === true)) {
      console.log(service.name);
      compileService(service);
      copyToBuild(section, service);

      // create pm2 service
      pm2Services.push({
        name: `${section.toUpperCase()} - ${service.name}`,
        script: `./${section}/koru-${section}-${service.name.toLowerCase().replace(/ /g, "-")}`,
        args: "",
        env: { ENV: "production" },
      });
    }

    console.log("");
  }

  // write pm2 config file
  fs.writeFileSync(`${BUILD_PATH}ecosystem.config.json`, JSON.stringify({ apps: pm2Services }, null, 2));

  const buildSize = getFolderSize(BUILD_PATH);

  console.log("");
  console.log(`Build created successfully, size: ${formatSize(buildSize)}`);
}

function setupBuild(sections: string[]) {
  // delete build folder content
  if (fs.existsSync(BUILD_PATH) === true) fs.rmdirSync(BUILD_PATH, { recursive: true });
  // create build folder
  fs.mkdirSync(BUILD_PATH);
  // copy env file to build folder
  fs.copyFileSync(ENV_FILE_PATH, `${BUILD_PATH}.env.prod`);
  // copy config folder to build folder
  fs.cpSync(CONFIG_PATH, `${BUILD_PATH}config`, { recursive: true });
  // copy assets folder to build folder
  fs.cpSync(ASSETS_PATH, `${BUILD_PATH}assets`, { recursive: true });
  // create log folder
  fs.mkdirSync(`${BUILD_PATH}logs`);
  // create sections folder
  for (const section of sections) fs.mkdirSync(BUILD_PATH + section);
}

function compileService(service: { name: string; path: string; devPort: string; prodPort: string; enabled: boolean }) {
  const command = new Deno.Command("deno", { args: ["task", "compile:server"], cwd: service.path });
  const { code } = command.outputSync();
  if (code !== 0) throw new Error(`Failed to compile service: ${service.name}`);
}

function copyToBuild(section: string, service: { name: string; path: string; devPort: string; prodPort: string; enabled: boolean }) {
  const serviceBuildPath: string = `${service.path}/build`;
  // check if service build folder exists
  if (fs.existsSync(serviceBuildPath) === false) throw new Error(`Service build folder not found for service: ${service.name}`);
  // read all files inside service build folder
  const files = fs.readdirSync(serviceBuildPath);
  // for each file
  for (const file of files) {
    // copy file to build folder
    fs.copyFileSync(`${serviceBuildPath}/${file}`, `${BUILD_PATH}${section}/${file}`);
  }
}

function getFolderSize(folderPath: string): number {
  let totalSize = 0;
  for (const file of fs.readdirSync(folderPath)) {
    const filePath = path.join(folderPath, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      totalSize += getFolderSize(filePath);
    } else {
      totalSize += stats.size;
    }
  }
  return totalSize;
}

function formatSize(bytes: number): string {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let index = 0;
  while (bytes >= 1024 && index < units.length - 1) {
    bytes /= 1024;
    index++;
  }
  return `${bytes.toFixed(2)} ${units[index]}`;
}

main();
