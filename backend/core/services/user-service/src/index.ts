// project
import { MicroService } from "@koru/micro-service";

// local
import { createUserEndpoint, deleteUserEndpoint, readUserEndpoint, readUsersEndpoint, updateUserEndpoint } from "./endpoints/index.ts";
import { userCreateRabbit, userReadRabbit, userUpdateRabbit } from "./rabbits/index.ts";

const microService: MicroService = new MicroService("User Service", 9206);

export function startService(): Promise<void> {
  // endpoints
  microService.setEndpoints([
    // read users endpoint
    readUsersEndpoint(microService.getHandler()),
    // read user endpoint
    readUserEndpoint(microService.getHandler()),
    // create user endpoint
    createUserEndpoint(microService.getHandler()),
    // update user endpoint
    updateUserEndpoint(microService.getHandler()),
    // delete user endpoint
    deleteUserEndpoint(microService.getHandler()),
  ]);

  // rabbits
  microService.setRabbits([
    // user create rabbit
    userCreateRabbit(microService.getHandler()),
    // user read rabbit
    userReadRabbit(microService.getHandler()),
    // user update rabbit
    userUpdateRabbit(microService.getHandler()),
  ]);

  // start service
  return microService.start();
}

export function stopService(): Promise<void> {
  // stop service
  return microService.stop();
}

startService();
