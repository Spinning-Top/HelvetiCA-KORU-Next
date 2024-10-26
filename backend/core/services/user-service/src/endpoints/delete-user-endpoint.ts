import type { Request, Response } from "express";

import { Endpoint, EndpointMethod, type Handler } from "@koru/microservice";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";
import type { User } from "@koru/core-models";
import { UserController } from "../controllers/index.ts";

export function deleteUserEndpoint(handler: Handler): Endpoint {
  const endpoint: Endpoint = new Endpoint("/users/:id", EndpointMethod.DELETE, true, ["user.delete"]);

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
      // remove the user
      await userController.deleteEntity(user);
      // return the success response
      return RequestHelpers.sendJsonDeleted(res);
    } catch (error) {
      console.error(error);
      return RequestHelpers.sendJsonError(res, HttpStatusCode.InternalServerError, "error", (error as Error).message);
    }
  };

  endpoint.setHandler(endpointHandler);

  return endpoint;
}
