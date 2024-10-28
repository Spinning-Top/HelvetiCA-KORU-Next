import { MicroService } from "@koru/micro-service";

import {
  createDummyEndpoint,
  deleteDummyEndpoint,
  readDeletedDummiesEndpoint,
  readDummiesEndpoint,
  readDummyEndpoint,
  updateDummyEndpoint,
} from "./endpoints/index.ts";

const microService: MicroService = new MicroService("Dummy Service", 9301);

export function startService(): Promise<void> {
  // endpoints
  microService.setEndpoints([
    // read deleted dummies endpoint
    readDeletedDummiesEndpoint(microService.getHandler()),
    // read dummies endpoint
    readDummiesEndpoint(microService.getHandler()),
    // read dummy endpoint
    readDummyEndpoint(microService.getHandler()),
    // create dummy endpoint
    createDummyEndpoint(microService.getHandler()),
    // update dummy endpoint
    updateDummyEndpoint(microService.getHandler()),
    // delete dummy endpoint
    deleteDummyEndpoint(microService.getHandler()),
  ]);

  // start service
  return microService.start();
}

export function stopService(): Promise<void> {
  return microService.stop();
}

startService();
