import { MicroService } from "@koru/micro-service";

import {
  createRoleEndpoint,
  deleteRoleEndpoint,
  readDeletedRolesEndpoint,
  readRoleEndpoint,
  readRolesEndpoint,
  updateRoleEndpoint,
} from "./endpoints/index.ts";

const microService: MicroService = new MicroService("Role Service", 9205);

export function startService(): Promise<void> {
  // endpoints
  microService.setEndpoints([
    // read deleted roles endpoint
    readDeletedRolesEndpoint(microService.getHandler()),
    // read roles endpoint
    readRolesEndpoint(microService.getHandler()),
    // read role endpoint
    readRoleEndpoint(microService.getHandler()),
    // create role endpoint
    createRoleEndpoint(microService.getHandler()),
    // update role endpoint
    updateRoleEndpoint(microService.getHandler()),
    // delete role endpoint
    deleteRoleEndpoint(microService.getHandler()),
  ]);

  // start service
  return microService.start();
}

export function stopService(): Promise<void> {
  return microService.stop();
}

startService();
