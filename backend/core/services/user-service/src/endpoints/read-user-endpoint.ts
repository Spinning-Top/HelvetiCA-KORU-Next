// third party
import type { Context } from "hono";

// project
import { Endpoint, EndpointMethod } from "@koru/base-service";
import type { Handler } from "@koru/handler";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";
import type { User } from "@koru/core-models";

// local
import { UserController } from "../controllers/index.ts";

export function readUserEndpoint(handler: Handler): Endpoint {
  const endpoint: Endpoint = new Endpoint("/users/:id", EndpointMethod.GET, true, ["user.read.byId"]);

  const endpointHandler: (c: Context) => void = async (c: Context) => {
    try {
      // create a user controller instance
      const userController: UserController = new UserController(handler);
      // get the user id from the request
      const id: number = Number(c.req.param("id"));
      // if id is not a number
      if (isNaN(id)) {
        // return an error
        return RequestHelpers.sendJsonError(c, HttpStatusCode.BadRequest, "invalidId", "Invalid id provided");
      }
      // find the user by id
      const user: User | undefined = await userController.getEntityById(id);
      // if user is not found
      if (user === undefined) {
        // return an error
        return RequestHelpers.sendJsonError(c, HttpStatusCode.NotFound, "notFound", `Entity with id ${id} not found`);
      }
      // return the user
      return RequestHelpers.sendJsonResponse(c, user.toReadResponse());
    } catch (error) {
      console.error(error);
      return RequestHelpers.sendJsonError(c, HttpStatusCode.InternalServerError, "error", (error as Error).message);
    }
  };

  endpoint.setHandler(endpointHandler);

  return endpoint;
}
