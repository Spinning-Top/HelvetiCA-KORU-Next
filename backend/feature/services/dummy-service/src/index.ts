import { CrudTemplate } from "@koru/crud-template";
import { EndpointType } from "@koru/base-service";
import { MicroService } from "@koru/micro-service";
import { Dummy } from "@koru/feature-models";

import { DummyController } from "./controllers/index.ts";

const microService: MicroService = new MicroService("Dummy Service", 9301);

export function startService(): Promise<void> {
  // endpoints
  microService.setEndpoints(
    CrudTemplate.getTemplate(
      microService.getHandler(),
      "/dummies",
      "dummy",
      Dummy,
      DummyController,
      [EndpointType.Create, EndpointType.ReadAll, EndpointType.Read, EndpointType.ReadDeleted, EndpointType.Update, EndpointType.Delete],
    ),
  );

  // start service
  return microService.start();
}

export function stopService(): Promise<void> {
  return microService.stop();
}

startService();
