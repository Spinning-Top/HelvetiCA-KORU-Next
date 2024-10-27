import type { Request, Response } from "express";
import { ValidationError } from "class-validator";

import { Endpoint, EndpointMethod } from "@koru/base-service";
import type { Handler } from "@koru/handler";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";
import type { User } from "@koru/core-models";
import { UserController } from "../controllers/index.ts";

export function updateUserEndpoint(handler: Handler): Endpoint {
  const endpoint: Endpoint = new Endpoint("/users/:id", EndpointMethod.PUT, true, ["user.update"]);

  const endpointHandler: (req: Request, res: Response) => void = async (req: Request, res: Response) => {
    try {
      // create a user controller instance
      const userController: UserController = new UserController(handler);
      // get the user id from the request
      const id: number = Number(req.params.id);
      // if id is not a number
      if (isNaN(id)) {
        // return an error
        return RequestHelpers.sendJsonError(res, HttpStatusCode.BadRequest, "invalidUserId", "Invalid user id");
      }
      // find the user by id
      const user: User | undefined = await userController.getEntityById(id);
      // if user is not found
      if (user === undefined) {
        // return an error
        return RequestHelpers.sendJsonError(res, HttpStatusCode.NotFound, "notFound", `User with id ${id} not found`);
      }
      // update the user from the request
      user.updateFromRequest(req);
      // save the updated user
      const saveResult: User | ValidationError[] | string = await userController.updateEntity(user);
      // if the save result is an array of validation errors
      if (Array.isArray(saveResult) && saveResult.length > 0 && saveResult[0] instanceof ValidationError) {
        // return the validation errors
        return RequestHelpers.sendJsonError(
          res,
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
        return RequestHelpers.sendJsonError(res, HttpStatusCode.BadRequest, "duplicatedEmail", "Provided email is already in use");
      }
      // return the success response
      return RequestHelpers.sendJsonUpdated(res);
    } catch (error) {
      console.error(error);
      return RequestHelpers.sendJsonError(res, HttpStatusCode.InternalServerError, "error", (error as Error).message);
    }
  };

  endpoint.setHandler(endpointHandler);

  return endpoint;
}
