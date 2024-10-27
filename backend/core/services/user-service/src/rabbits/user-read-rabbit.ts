import type { ConsumeMessage } from "amqplib";

import type { Handler } from "@koru/handler";
import { Rabbit } from "@koru/micro-service";
import type { User } from "@koru/core-models";
import { UserController } from "../controllers/index.ts";

export function userReadRabbit(handler: Handler): Rabbit<User | undefined> {
  // create a new rabbit instance for the user read
  const rabbit: Rabbit<User | undefined> = new Rabbit<User | undefined>("userRead");
  // set the response handler for the user read
  rabbit.setResponseHandler(async (msg: ConsumeMessage): Promise<User | undefined> => {
    // create a user controller instance
    const userController: UserController = new UserController(handler);
    // get the parameters json from the message
    const parameters: Record<string, unknown> = JSON.parse(msg.content.toString());
    // if id is provided in the parameters
    if (parameters.id !== undefined) {
      console.log("Finding user by id");
      // find the user by id
      const user: User | undefined = await userController.getEntityById(Number(parameters.id));
      return user;
    } else if (parameters.email !== undefined) {
      console.log("Finding user by email");
      // otherwise if email is provided, find the user by email
      const user: User | undefined = await userController.getEntityByField("email", parameters.email as string);
      handler.getLog().info(`User found: ${user}`);
      return user;
    }
    // no id or email provided, return undefined
    return undefined;
  });
  // return the rabbit instance
  return rabbit;
}
