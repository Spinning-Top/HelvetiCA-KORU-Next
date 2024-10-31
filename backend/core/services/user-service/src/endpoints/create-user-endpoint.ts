import type { Context } from "hono";
import { ValidationError } from "class-validator";

import { Endpoint, EndpointMethod } from "@koru/base-service";
import type { Handler } from "@koru/handler";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";
import { User } from "@koru/core-models";
import { UserController } from "../controllers/index.ts";

export function createUserEndpoint(handler: Handler): Endpoint {
  const endpoint: Endpoint = new Endpoint("/users", EndpointMethod.POST, true, ["user.create"]);

  const endpointHandler: (c: Context) => void = async (c: Context) => {
    try {
      // create a user controller instance
      const userController: UserController = new UserController(handler);
      // get the body from the request
      const body: Record<string, unknown> = await c.req.parseBody();
      // create the new user from the request
      const newUser: User = User.createFromRequest(body, new User());
      // save the new user
      const saveResult: User | ValidationError[] | string = await userController.createEntity(newUser);
      // if the save result is an array of validation errors
      if (Array.isArray(saveResult) && saveResult.length > 0 && saveResult[0] instanceof ValidationError) {
        // return the validation errors
        return RequestHelpers.sendJsonError(
          c,
          HttpStatusCode.BadRequest,
          "validationError",
          "Validation failed",
          saveResult.map((error) => ({
            property: error.property,
            constraints: error.constraints,
          })),
        );
      } else if (saveResult === "duplicatedEmail") {
        // return the validation error
        return RequestHelpers.sendJsonError(c, HttpStatusCode.BadRequest, "duplicatedEmail", "Provided email is already in use");
      }
      // return the success response
      return RequestHelpers.sendJsonCreated(c);
    } catch (error) {
      console.error(error);
      return RequestHelpers.sendJsonError(c, HttpStatusCode.InternalServerError, "error", (error as Error).message);
    }
  };

  endpoint.setHandler(endpointHandler);

  return endpoint;
}
