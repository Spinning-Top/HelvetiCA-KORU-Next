// local
import { DatabaseService } from "./database-service.ts";

const databaseService: DatabaseService = new DatabaseService();

export async function startService(): Promise<void> {
  // connect the database
  await databaseService.connect();

  // start service
  return await databaseService.startAndBoot();
}

export async function stopService(): Promise<void> {
  // stop service
  return await databaseService.stop();
}

startService();
