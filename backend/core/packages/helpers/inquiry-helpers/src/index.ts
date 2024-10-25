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
}
