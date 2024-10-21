import { checkbox, confirm, select } from "@inquirer/prompts";

export class InquiryHelpers {
  public static async confirmExecution() {
    return await confirm({
      message: "Confirm the execution:",
      default: false,
    });
  }

  public static async selectEnvironment() {
    return await select({
      message: "Select an environment:",
      choices: [
        { name: "DEVELOPMENT", value: "development" },
        { name: "PRODUCTION", value: "production" },
      ],
    });
  }

  public static async selectChoices(title: string, choices: { name: string; value: string }[]) {
    return await checkbox({
      message: title,
      choices: choices,
    });
  }

  public static async selectSection() {
    return await select({
      message: "Select a section:",
      choices: [
        { name: "CORE", value: "core" },
        { name: "FEATURE", value: "feature" },
      ],
    });
  }

  /*
  public static async selectCollection(config) {
    try {
      const collectionsObjects = config.database.collections;

      const collectionName = await select({
        message: "Select a collection:",
        choices: Object.keys(collectionsObjects).map((key) => {
          return { name: collectionsObjects[key].name, value: collectionsObjects[key].name };
        }),
        pageSize: 30,
      });

      const collectionObject = collectionsObjects.find((collection) => collection.name == collectionName);
      if (collectionObject == undefined) throw new Error(`Collection ${collectionName} not found`);
      return collectionObject;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  public static async selectDataFile() {
    const dataFiles = [];
    const files = fs.readdirSync(WorkbenchHelpers.getSetting("dataPath"));
    for (const file of files) {
      // check if file start with .
      if (file.startsWith(".") === true) continue;
      // check if file is a folder
      if (fs.lstatSync(WorkbenchHelpers.getSetting("dataPath") + file).isDirectory() === true) continue;
      dataFiles.push(file);
    }

    return await select({
      message: "Select a data file:",
      choices: dataFiles.map((module) => {
        return { name: module, value: module };
      }),
    });
  }

  public static async selectSearchModule(searchModules) {
    return await select({
      message: "Select a search module:",
      choices: searchModules.map((module) => {
        return { name: module, value: module };
      }),
    });
  }

  public static async selectType() {
    return await select({
      message: "Select a type:",
      choices: [
        { name: "Cog", value: "cog" },
        { name: "Seeder", value: "seeder" },
      ],
    });
  }

  public static async selectWorkbenchModule(modules) {
    return await select({
      message: "Select a module:",
      choices: modules.map((module) => {
        return { name: module, value: module };
      }),
      pageSize: 30,
    });
  }
  */
}
