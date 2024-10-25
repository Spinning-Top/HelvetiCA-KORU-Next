import type { Express } from "express";

import { Microservice } from "@koru/microservice";

import {
  createDummyEndpoint,
  deleteDummyEndpoint,
  readDeletedDummiesEndpoint,
  readDummyEndpoint,
  readDummiesEndpoint,
  updateDummyEndpoint,
} from "./endpoints/index.ts";

const microservice: Microservice = new Microservice("Dummy Service", "");
export const express: Express = microservice.getHandler().getExpress();

export async function startService(): Promise<void> {
  // endpoints
  microservice.setEndpoints([
    // read deleted dummies endpoint
    readDeletedDummiesEndpoint(microservice.getHandler()),
    // read dummies endpoint
    readDummiesEndpoint(microservice.getHandler()),
    // read dummy endpoint
    readDummyEndpoint(microservice.getHandler()),
    // create dummy endpoint
    createDummyEndpoint(microservice.getHandler()),
    // update dummy endpoint
    updateDummyEndpoint(microservice.getHandler()),
    // delete dummy endpoint
    deleteDummyEndpoint(microservice.getHandler()),
  ]);

  // start service
  return await microservice.start();
}

export async function stopService(): Promise<void> {
  return await microservice.stop();
}

startService();
