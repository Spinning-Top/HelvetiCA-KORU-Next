import type { Context } from "hono";
import { ValidationError } from "class-validator";

import { Endpoint, EndpointMethod } from "@koru/base-service";
import type { Handler } from "@koru/handler";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";
import type { User } from "@koru/core-models";
import { UserController } from "../controllers/index.ts";

export function updateUserEndpoint(handler: Handler): Endpoint {
  const endpoint: Endpoint = new Endpoint("/users/:id", EndpointMethod.PUT, true, ["user.update"]);

  const endpointHandler: (c: Context) => void = async (c: Context) => {
    try {
      // get the user from the context
      const user: User | undefined = c.get("user");
      // check if the user exists
      if (user === undefined) {
        // return an error
        return RequestHelpers.sendJsonError(c, HttpStatusCode.Unauthorized, "unauthorized", "Authentication needed to access this endpoint");
      }

      // create a user controller instance
      const userController: UserController = new UserController(handler);
      // get the user id from the request
      const id: number = Number(c.req.param("id"));
      // if id is not a number
      if (isNaN(id)) {
        // return an error
        return RequestHelpers.sendJsonError(c, HttpStatusCode.BadRequest, "invalidUserId", "Invalid user id");
      }
      // find the user by id
      const userToUpdate: User | undefined = await userController.getEntityById(id);
      // if user is not found
      if (userToUpdate === undefined) {
        // return an error
        return RequestHelpers.sendJsonError(c, HttpStatusCode.NotFound, "notFound", `User with id ${id} not found`);
      }
      // get the body from the request
      const body: Record<string, unknown> = await c.req.parseBody();
      // update the user from the request
      userToUpdate.updateFromRequest(body);
      // save the updated user
      const saveResult: User | ValidationError[] | string = await userController.updateEntity(userToUpdate);
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
      return RequestHelpers.sendJsonUpdated(c);
    } catch (error) {
      console.error(error);
      return RequestHelpers.sendJsonError(c, HttpStatusCode.InternalServerError, "error", (error as Error).message);
    }
  };

  endpoint.setHandler(endpointHandler);

  return endpoint;
}
