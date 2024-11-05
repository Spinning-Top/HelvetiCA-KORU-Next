// project
import { CrudTemplate } from "@koru/crud-template";
import { EndpointType } from "@koru/base-service";
import { MicroService } from "@koru/micro-service";
import { Role } from "@koru/core-models";

// local
import { RoleController } from "./controllers/index.ts";

const microService: MicroService = new MicroService("Role Service", 9205);

export function startService(): Promise<void> {
  // endpoints
  microService.setEndpoints(
    CrudTemplate.getTemplate(
      microService.getHandler(),
      "/roles",
      "role",
      Role,
      RoleController,
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
