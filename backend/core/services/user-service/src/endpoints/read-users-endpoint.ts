import type { Request, Response } from "express";

import { Endpoint, EndpointMethod } from "@koru/base-service";
import type { Handler } from "@koru/handler";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";
import { UserController } from "../controllers/index.ts";

export function readUsersEndpoint(handler: Handler): Endpoint {
  const endpoint: Endpoint = new Endpoint("/users", EndpointMethod.GET, true, ["user.read.all"]);

  const endpointHandler: (req: Request, res: Response) => void = async (req: Request, res: Response) => {
    try {
      // create a user controller instance
      const userController: UserController = new UserController(handler);
      // get the page from the request
      const page: number | undefined = req.query.page != undefined ? Number(req.query.page) : undefined;
      // get the limit from the request
      const limit: number | undefined = req.query.limit != undefined ? Number(req.query.limit) : undefined;
      // get the search from the request
      const search: string | undefined = req.query.search != undefined ? req.query.search.toString() : undefined;
      // get the users with the given parameters
      const result: { entities: Record<string, unknown>[]; total: number; page: number; limit: number } = await userController.getEntitiesWithParams(
        page,
        limit,
        search,
      );
      // return the users
      return RequestHelpers.sendJsonResponse(res, result);
    } catch (error) {
      console.error(error);
      return RequestHelpers.sendJsonError(res, HttpStatusCode.InternalServerError, "error", (error as Error).message);
    }
  };

  endpoint.setHandler(endpointHandler);

  return endpoint;
}
