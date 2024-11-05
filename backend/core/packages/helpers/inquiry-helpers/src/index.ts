// third party
import { checkbox, confirm, select } from "@inquirer/prompts";

export class InquiryHelpers {
  public static async confirmExecution(): Promise<boolean> {
    return await confirm({
      message: "Confirm the execution:",
      default: false,
    });
  }

  public static async selectEnvironment(): Promise<string> {
    return await select({
      message: "Select an environment:",
      choices: [
        { name: "DEVELOPMENT", value: "development" },
        { name: "PRODUCTION", value: "production" },
      ],
    });
  }

  public static async selectChoices(title: string, choices: { name: string; value: string }[]): Promise<string[]> {
    return await checkbox({
      message: title,
      choices: choices,
    });
  }

  public static async selectSection(): Promise<string> {
    return await select({
      message: "Select a section:",
      choices: [
        { name: "CORE", value: "core" },
        { name: "FEATURE", value: "feature" },
      ],
    });
  }
}
