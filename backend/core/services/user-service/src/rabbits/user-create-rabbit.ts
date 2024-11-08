// third party
import type { ConsumeMessage } from "amqplib";
import { ValidationError } from "class-validator";

// project
import type { Handler } from "@koru/handler";
import { Rabbit } from "@koru/rabbit-breeder";
import { User } from "@koru/core-models";

// local
import { UserController } from "../controllers/index.ts";

export function userCreateRabbit(handler: Handler): Rabbit<User | undefined> {
  // create a new rabbit instance for the user create
  const rabbit: Rabbit<User | undefined> = new Rabbit<User>("userCreateRequest");
  // set the response handler for the user create
  rabbit.setResponseHandler(async (msg: ConsumeMessage): Promise<User | undefined> => {
    try {
      // create a user controller instance
      const userController: UserController = new UserController(handler);
      // get the parameters json from the message
      const parameters: Record<string, unknown> = JSON.parse(msg.content.toString());
      // create the new user from the request
      const newUser: User = User.createFromJsonData(parameters, new User());
      // TODOMAIL take the new temporary password and send a welcome e-mail
      // set immediate password expiration
      newUser.passwordExpiresAt = new Date();
      // set the user locale and theme
      newUser.locale = handler.getGlobalConfig().koru.defaultLocale;
      newUser.theme = handler.getGlobalConfig().koru.defaultTheme;
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
