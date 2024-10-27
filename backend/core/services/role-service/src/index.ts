import type { Express } from "express";

import { MicroService } from "@koru/micro-service";

import {
  createRoleEndpoint,
  deleteRoleEndpoint,
  readDeletedRolesEndpoint,
  readRoleEndpoint,
  readRolesEndpoint,
  updateRoleEndpoint,
} from "./endpoints/index.ts";

const microservice: MicroService = new MicroService("Role Service");
export const express: Express = microservice.getHandler().getExpress();

export async function startService(): Promise<void> {
  // endpoints
  microservice.setEndpoints([
    // read deleted roles endpoint
    readDeletedRolesEndpoint(microservice.getHandler()),
    // read roles endpoint
    readRolesEndpoint(microservice.getHandler()),
    // read role endpoint
    readRoleEndpoint(microservice.getHandler()),
    // create role endpoint
    createRoleEndpoint(microservice.getHandler()),
    // update role endpoint
    updateRoleEndpoint(microservice.getHandler()),
    // delete role endpoint
    deleteRoleEndpoint(microservice.getHandler()),
  ]);

  // start service
  return await microservice.start();
}

export async function stopService(): Promise<void> {
  return await microservice.stop();
}

startService();
