// third party
import type { ConsumeMessage } from "amqplib";
import { ValidationError } from "class-validator";

// project
import type { Handler } from "@koru/handler";
import { Rabbit } from "@koru/micro-service";
import { User } from "@koru/core-models";

// local
import { UserController } from "../controllers/index.ts";

export function userUpdateRabbit(handler: Handler): Rabbit<User | undefined> {
  // create a new rabbit instance for the user update
  const rabbit: Rabbit<User | undefined> = new Rabbit<User>("userUpdate");
  // set the response handler for the user update
  rabbit.setResponseHandler(async (msg: ConsumeMessage): Promise<User | undefined> => {
    try {
      // create a user controller instance
      const userController: UserController = new UserController(handler);
      // get the parameters json from the message
      const parameters: Record<string, unknown> = JSON.parse(msg.content.toString());
      // find the user by id
      const dbUser: User | undefined = await userController.getEntityById(Number(parameters.id));
      // if user is not found
      if (dbUser === undefined) {
        throw new Error(`User with id ${parameters.id} not found`);
      }
      // update the user from the request
      dbUser.updateFromJsonData(parameters);
      // save the updated user
      const saveResult: User | ValidationError[] | string = await userController.updateEntity(dbUser);
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
