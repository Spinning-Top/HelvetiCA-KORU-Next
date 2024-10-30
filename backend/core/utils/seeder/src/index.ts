import { basename, extname, resolve } from "@std/path";
import { sync } from "glob";

import { Database } from "@koru/database";
import { getGlobalConfig, type GlobalConfig, initGlobalConfig } from "@koru/global-config";
import { InquiryHelpers } from "@koru/inquiry-helpers";

const CORE_SEEDERS_PATTERN = "./backend/core/**/*-seeder.ts";
const FEATURE_SEEDERS_PATTERN = "./backend/feature/**/*-seeder.ts";

interface Seeder {
  name: string;
  file: string;
  dependsOn?: string;
}

async function main() {
  console.log("");
  console.log("#############################");
  console.log("###      KORU Seeder      ###");
  console.log("#############################");
  console.log("");

  const selectedEnvironment = await InquiryHelpers.selectEnvironment();
  console.log("");

  if (["development", "production"].includes(selectedEnvironment) === false) {
    console.log("Invalid environment provided");
    return;
  }

  Deno.env.set("ENV", selectedEnvironment);

  const selectedSection = await InquiryHelpers.selectSection();
  console.log("");

  if (["core", "feature"].includes(selectedSection) === false) {
    console.log("Invalid section provided");
    return;
  }

  const seeders: Seeder[] = await findSeeders(selectedSection);
  if (seeders.length === 0) {
    console.log("No seeders found");
    return;
  }

  const selectedSeedersNames: string[] = await InquiryHelpers.selectChoices(
    "Select seeders to run",
    seeders.map((seeder) => {
      return { name: seeder.dependsOn != undefined ? `${seeder.name} (depends on ${seeder.dependsOn})` : seeder.name, value: seeder.name };
    }),
  );
  console.log("");

  const selectedSeeders = seeders.filter((seeder) => selectedSeedersNames.includes(seeder.name));

  const confirm = await InquiryHelpers.confirmExecution();
  console.log("");

  if (confirm == false) {
    console.log("Bye!");
    return;
  }

  console.log(`Running on ${selectedEnvironment.toUpperCase()} - ${selectedSection.toUpperCase()}...`);
  console.log("");

  await runSeeders(selectedSeeders);
}

async function findSeeders(section: string): Promise<Seeder[]> {
  const seedersPattern = resolve(Deno.cwd(), section === "core" ? CORE_SEEDERS_PATTERN : FEATURE_SEEDERS_PATTERN);

  console.log(`Searching seeders in ${seedersPattern}...`);

  const seeders: Seeder[] = await Promise.all(
    sync(seedersPattern).map(async (file) => {
      const seederModule = await import(file);
      const seederName = basename(file, extname(file));

      return {
        name: seederName,
        file,
        dependsOn: seederModule.dependsOn || null,
      } as Seeder;
    }),
  );

  // Ordina i seeder in base alle dipendenze
  const orderedSeeders = topologicalSort(seeders);

  return orderedSeeders;
}

async function runSeeders(seeders: Seeder[]) {
  const database: Database = await initAndEmptyDatabase();

  await executeSeeders(seeders);

  await database.disconnect();
}

async function initAndEmptyDatabase(): Promise<Database> {
  initGlobalConfig();

  const globalConfig: GlobalConfig = getGlobalConfig();
  const database: Database = new Database(globalConfig);
  await database.connect();

  await database.getDataSource().synchronize(true);

  return database;
}

async function executeSeeders(seeders: Seeder[]) {
  for (const seeder of seeders) {
    const seederModule = await import(seeder.file);
    if (typeof seederModule.default === "function") {
      await seederModule.default();
    }
  }
}

function topologicalSort(seeders: Seeder[]): Seeder[] {
  const sorted: Seeder[] = [];
  const visited: Set<string> = new Set();

  const visit = (seeder: Seeder) => {
    if (!visited.has(seeder.name)) {
      visited.add(seeder.name);

      const dependency = seeders.find((s) => s.name === seeder.dependsOn);
      if (dependency) {
        visit(dependency);
      }

      sorted.push(seeder);
    }
  };

  seeders.forEach(visit);

  return sorted;
}

main();
