import { MicroService } from "@koru/micro-service";

import {
  createCronJobEndpoint,
  deleteCronJobEndpoint,
  readCronJobEndpoint,
  readCronJobsEndpoint,
  updateCronJobEndpoint,
} from "./endpoints/index.ts";

const microService: MicroService = new MicroService("Cron Job Service", 9202);

export function startService(): Promise<void> {
  // endpoints
  microService.setEndpoints([
    // read cron jobs endpoint
    readCronJobsEndpoint(microService.getHandler()),
    // read cron job endpoint
    readCronJobEndpoint(microService.getHandler()),
    // create cron job endpoint
    createCronJobEndpoint(microService.getHandler()),
    // update cron job endpoint
    updateCronJobEndpoint(microService.getHandler()),
    // delete cron job endpoint
    deleteCronJobEndpoint(microService.getHandler()),
  ]);

  // start service
  return microService.start();
}

export function stopService(): Promise<void> {
  return microService.stop();
}

startService();
