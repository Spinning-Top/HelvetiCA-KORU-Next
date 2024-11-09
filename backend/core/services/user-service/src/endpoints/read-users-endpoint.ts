// third party
import type { Context } from "hono";

// project
import { Endpoint, EndpointMethod } from "@koru/base-service";
import type { Handler } from "@koru/handler";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";
import type { ReadWithParamsResult } from "@koru/core-entities";

// local
import { UserController } from "../controllers/index.ts";

export function readUsersEndpoint(handler: Handler): Endpoint {
  const endpoint: Endpoint = new Endpoint("/users", EndpointMethod.GET, true, ["user.read.all"]);

  const endpointHandler: (c: Context) => void = async (c: Context) => {
    try {
      // create a user controller instance
      const userController: UserController = new UserController(handler);
      // get the page from the request
      const page: number | undefined = c.req.query("page") != undefined ? Number(c.req.query("page")) : undefined;
      // get the limit from the request
      const limit: number | undefined = c.req.query("limit") != undefined ? Number(c.req.query("limit")) : undefined;
      // get the search from the request
      const search: string | undefined = c.req.query("search") != undefined ? c.req.query("search") : undefined;
      // get the users with the given parameters
      const result: ReadWithParamsResult = await userController.getEntitiesWithParams(page, limit, search);
      // return the users
      return RequestHelpers.sendJsonResponse(c, result.toJson());
    } catch (error) {
      console.error(error);
      return RequestHelpers.sendJsonError(c, HttpStatusCode.InternalServerError, "error", (error as Error).message);
    }
  };

  endpoint.setHandler(endpointHandler);

  return endpoint;
}
