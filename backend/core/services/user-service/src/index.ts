import type { Express } from "express";

import { MicroService } from "@koru/microservice";

import { createUserEndpoint, deleteUserEndpoint, readUserEndpoint, readUsersEndpoint, updateUserEndpoint } from "./endpoints/index.ts";

import { userCreateRabbit, userReadRabbit, userUpdateRabbit } from "./rabbits/index.ts";

const microservice: MicroService = new MicroService("User Service");
export const express: Express = microservice.getHandler().getExpress();

export async function startService(): Promise<void> {
  // endpoints
  microservice.setEndpoints([
    // read users endpoint
    readUsersEndpoint(microservice.getHandler()),
    // read user endpoint
    readUserEndpoint(microservice.getHandler()),
    // create user endpoint
    createUserEndpoint(microservice.getHandler()),
    // update user endpoint
    updateUserEndpoint(microservice.getHandler()),
    // delete user endpoint
    deleteUserEndpoint(microservice.getHandler()),
  ]);

  // rabbits
  microservice.setRabbits([
    // user create rabbit
    userCreateRabbit(microservice.getHandler()),
    // user read rabbit
    userReadRabbit(microservice.getHandler()),
    // user update rabbit
    userUpdateRabbit(microservice.getHandler()),
  ]);

  // start service
  return await microservice.start();
}

export async function stopService(): Promise<void> {
  // stop service
  return await microservice.stop();
}

startService();
