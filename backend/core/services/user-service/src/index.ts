import { MicroService } from "@koru/micro-service";

import { createUserEndpoint, deleteUserEndpoint, readUserEndpoint, readUsersEndpoint, updateUserEndpoint } from "./endpoints/index.ts";

import { userCreateRabbit, userReadRabbit, userUpdateRabbit } from "./rabbits/index.ts";

const microservice: MicroService = new MicroService("User Service", 9206);

export function startService(): Promise<void> {
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
  return microservice.start();
}

export function stopService(): Promise<void> {
  // stop service
  return microservice.stop();
}

startService();
