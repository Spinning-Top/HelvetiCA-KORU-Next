import { CronJob } from "@koru/core-models";
import { CrudTemplate } from "@koru/crud-template";
import { EndpointType } from "@koru/base-service";
import { MicroService } from "@koru/micro-service";

import { CronJobController } from "./controllers/index.ts";

const microService: MicroService = new MicroService("Cron Job Service", 9202);

export function startService(): Promise<void> {
  // endpoints
  microService.setEndpoints(
    CrudTemplate.getTemplate(
      microService.getHandler(),
      "/cron-jobs",
      "cronJob",
      CronJob,
      CronJobController,
      [EndpointType.Create, EndpointType.ReadAll, EndpointType.Read, EndpointType.Update, EndpointType.Delete],
    ),
  );

  // start service
  return microService.start();
}

export function stopService(): Promise<void> {
  return microService.stop();
}

startService();
