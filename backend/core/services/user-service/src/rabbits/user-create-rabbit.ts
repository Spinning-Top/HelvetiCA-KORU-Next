import type { ConsumeMessage } from "amqplib";
import { ValidationError } from "class-validator";

import { type Handler, Rabbit } from "@koru/microservice";
import { User } from "@koru/core-models";
import { UserController } from "../controllers/index.ts";

export function userCreateRabbit(handler: Handler): Rabbit<User | undefined> {
  // create a new rabbit instance for the user create
  const rabbit: Rabbit<User | undefined> = new Rabbit<User>("userCreate");
  // set the response handler for the user create
  rabbit.setResponseHandler(async (msg: ConsumeMessage): Promise<User | undefined> => {
    try {
      // create a user controller instance
      const userController: UserController = new UserController(handler);
      // get the parameters json from the message
      const parameters: Record<string, unknown> = JSON.parse(msg.content.toString());
      // create the new user from the request
      const newUser: User = User.createFromJsonData(parameters, new User());
      // save the new user
      const saveResult: User | ValidationError[] | string = await userController.createEntity(newUser);
      // if the save result is an array of validation errors
      if (Array.isArray(saveResult) && saveResult.length > 0 && saveResult[0] instanceof ValidationError) {
        // return the validation errors
        throw new Error("Validation failed");
      } else if (saveResult === "duplicatedEmail") {
        // return the validation error
        throw new Error("Provided email is already in use");
      } else if (saveResult instanceof User) {
        // return the new saved user
        return saveResult;
      }
      return undefined;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  });
  // return the rabbit instance
  return rabbit;
}
