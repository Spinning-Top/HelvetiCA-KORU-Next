import type { Context } from "hono";

import { Endpoint, EndpointMethod } from "@koru/base-service";
import type { Handler } from "@koru/handler";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";
import type { User } from "@koru/core-models";
import { UserController } from "../controllers/index.ts";

export function deleteUserEndpoint(handler: Handler): Endpoint {
  const endpoint: Endpoint = new Endpoint("/users/:id", EndpointMethod.DELETE, true, ["user.delete"]);

  const endpointHandler: (c: Context) => void = async (c: Context) => {
    try {
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
      const userToDelete: User | undefined = await userController.getEntityById(id);
      // if user is not found
      if (userToDelete === undefined) {
        // return an error
        return RequestHelpers.sendJsonError(c, HttpStatusCode.NotFound, "notFound", `User with id ${id} not found`);
      }
      // remove the user
      await userController.deleteEntity(userToDelete);
      // return the success response
      return RequestHelpers.sendJsonDeleted(c);
    } catch (error) {
      console.error(error);
      return RequestHelpers.sendJsonError(c, HttpStatusCode.InternalServerError, "error", (error as Error).message);
    }
  };

  endpoint.setHandler(endpointHandler);

  return endpoint;
}
